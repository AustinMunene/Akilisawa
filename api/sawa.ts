/*
 * api/sawa.ts - the Sawa AI streaming endpoint (ticket 16).
 *
 * One POST carries one turn. The reply is streamed back as Server-Sent Events
 * so the chat can render token by token (§11). Nothing is persisted here: the
 * transcript lives in the visitor's browser, and the only record this endpoint
 * emits is the `promptVersion` stamp on the response (see src/lib/sawa/prompt.ts).
 *
 * SECURITY BOUNDARY
 * The model key is read from `process.env` and used only in this file. It must
 * never reach `src/`, must never be `VITE_`-prefixed, and must never be logged.
 * A missing key or base URL fails closed with the generic `{ message }` shape,
 * and the generic message never names the provider.
 *
 * RATE LIMITING - READ THIS BEFORE TRUSTING THE CAPS
 * The two Maps below are best-effort only. Serverless instances do not share
 * memory and the Maps die on cold start, so they are a courtesy, not the real
 * control. The real budget control is provider-side rate limits plus the caps
 * here; a cold start resets both. See SAWA-AI-NO-ACCOUNTS-APPROACH.md §6.
 *
 * The values are justified by research/provider-comparison.md: 12 turns per
 * conversation matches the cost model, and 40 messages per IP per day bounds a
 * single source to four worst-case conversations a day.
 */

// The `.js` extension is required, not optional. `package.json` sets
// `"type": "module"`, so Vercel compiles this handler to ESM and Node's
// resolver does no extension guessing on a relative specifier. Without it the
// function dies at module load with ERR_MODULE_NOT_FOUND before the handler
// runs. `tsconfig.api.json` now uses NodeNext so the verification gate catches
// extensionless imports in the API's deployed module graph.
import { promptV1, promptVersion } from "../src/lib/sawa/prompt.js";
import {
  crisisTextFor,
  detectAssistantReply,
  detectUserTurn,
} from "../src/lib/sawa/safety/detector.js";
import { sendSafetyNotification } from "./_sawaEscalation.js";

type Provider = "mistral" | "openai" | "nvidia";

type ProviderConfig = {
  provider: Provider;
  baseUrl: string;
  apiKey: string;
  model: string;
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type IpRecord = { count: number; start: number };

const MAX_TURNS_PER_CONVERSATION = 12;
const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 24;
const IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_MESSAGES_PER_IP_PER_DAY = 40;
// NVIDIA's hosted endpoint can take more than 25 seconds on a cold request.
// vercel.json reserves a 60-second function window; leave a little time for
// safety screening and the final SSE response before Vercel's hard deadline.
const DEFAULT_PROVIDER_TIMEOUT_MS = 55_000;
// Replies are buffered for the final safety check before they reach the
// visitor. Keeping this bounded gives NVIDIA enough time to finish within the
// serverless window, while still leaving useful space for a practical answer.
const MAX_REPLY_TOKENS = 220;

const GENERIC_ERROR = "Sawa is unavailable right now. Please try again.";
const INVALID_MESSAGE = "Invalid submission.";
const TURN_CAP_MESSAGE = `This conversation has reached its ${MAX_TURNS_PER_CONVERSATION}-turn limit. Your transcript stays in this browser; you can begin a new conversation whenever you like.`;
const IP_CAP_MESSAGE =
  "Too many messages from this connection today. Please try again later.";

// In-memory, per-instance, cleared on cold start. Courtesy controls only.
const turnStore = new Map<string, number>();
const ipStore = new Map<string, IpRecord>();

// Reused verbatim from api/contact.ts.
const getClientIp = (req: { headers: Record<string, string | string[]> }) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim();
  return "unknown";
};

const resolveProviderConfig = (): ProviderConfig | null => {
  const configuredProvider = process.env.SAWA_MODEL_PROVIDER;
  const provider: Provider =
    configuredProvider === "openai" || configuredProvider === "nvidia"
      ? configuredProvider
      : "mistral";

  const apiKey =
    provider === "nvidia"
      ? process.env.NVIDIA_API_KEY
      : provider === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.MISTRAL_API_KEY;
  const baseUrl =
    provider === "nvidia"
      ? process.env.NVIDIA_BASE_URL
      : provider === "openai"
        ? process.env.OPENAI_BASE_URL
        : process.env.MISTRAL_BASE_URL;
  const model =
    provider === "nvidia"
      ? process.env.NVIDIA_MODEL
      : provider === "openai"
        ? process.env.OPENAI_MODEL
        : process.env.MISTRAL_MODEL;

  if (!apiKey || !baseUrl || !model) return null;
  return { provider, apiKey, baseUrl: baseUrl.replace(/\/+$/, ""), model };
};

const getProviderTimeoutMs = () => {
  const raw = Number(process.env.SAWA_PROVIDER_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PROVIDER_TIMEOUT_MS;
};

// Visitor-supplied and shown in escalation alerts, so keep it to a safe shape.
const sanitiseConversationId = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,64}$/.test(trimmed) ? trimmed : null;
};

const sanitiseHistory = (value: unknown): ChatMessage[] => {
  if (!Array.isArray(value)) return [];
  const messages: ChatMessage[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as { role?: unknown; content?: unknown };
    if (
      (record.role !== "user" && record.role !== "assistant") ||
      typeof record.content !== "string"
    ) {
      continue;
    }
    messages.push({ role: record.role, content: record.content.slice(0, MAX_MESSAGE_CHARS) });
  }
  return messages.slice(-MAX_HISTORY_MESSAGES);
};

// Fixed-window courtesy limiter. True means the request may proceed.
const withinIpCap = (ip: string, now: number): boolean => {
  const record = ipStore.get(ip);
  if (!record || now - record.start > IP_WINDOW_MS) {
    ipStore.set(ip, { count: 1, start: now });
    return true;
  }
  if (record.count >= MAX_MESSAGES_PER_IP_PER_DAY) return false;
  record.count += 1;
  return true;
};

const buildRequestBody = (config: ProviderConfig, messages: ChatMessage[]) => {
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    stream: true,
    max_tokens: MAX_REPLY_TOKENS,
  };
  if (config.provider === "openai") {
    // OpenAI's zero-data-retention grant requires store=false once approved.
    body.store = false;
    body.stream_options = { include_usage: true };
  } else if (config.provider === "nvidia") {
    // The endpoint buffers and screens a complete reply before sending it.
    // Disable Nemotron's reasoning trace so it can return visitor-facing text
    // within the serverless request window.
    body.chat_template_kwargs = { enable_thinking: false };
  }
  return body;
};

// The configured Mistral, OpenAI and NVIDIA Chat Completions endpoints use the
// same content delta shape; reasoning-only deltas are intentionally ignored.
export const extractDeltaText = (payload: string): string => {
  try {
    const parsed = JSON.parse(payload);
    const content = parsed?.choices?.[0]?.delta?.content;
    return typeof content === "string" ? content : "";
  } catch {
    return "";
  }
};

/*
 * The chat renders the transcript as plain text - the bubbles are
 * `whitespace-pre-wrap` with no markdown renderer - so a reply that arrives
 * with `**bold**` shows its asterisks to the visitor. Models emit markdown
 * regardless of what the prompt asks for, so the markers are removed here,
 * at the boundary, rather than trusted away by an instruction.
 */
export const toPlainText = (text: string): string =>
  text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(?<![*\w])\*([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/`+([^`]+)`+/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[ \t]*[*+-][ \t]+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const sendJson = (res: any, status: number, message: string) => {
  res.status(status).json({ message });
};

const writeSse = (res: any, event: unknown) => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};

const sendSseText = (res: any, text: string) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  writeSse(res, { type: "meta", promptVersion });
  for (let offset = 0; offset < text.length; offset += 48) {
    writeSse(res, { type: "delta", text: text.slice(offset, offset + 48) });
  }
  writeSse(res, { type: "done", promptVersion });
  res.end();
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, "Method not allowed.");
    return;
  }

  // No CORS headers on purpose: same-origin only by design.

  if (!withinIpCap(getClientIp(req), Date.now())) {
    sendJson(res, 429, IP_CAP_MESSAGE);
    return;
  }

  let payload: any;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    sendJson(res, 400, INVALID_MESSAGE);
    return;
  }

  const conversationId = sanitiseConversationId(payload?.conversationId);
  const message = typeof payload?.message === "string" ? payload.message : "";

  if (!conversationId || message.trim().length === 0 || message.length > MAX_MESSAGE_CHARS) {
    sendJson(res, 400, INVALID_MESSAGE);
    return;
  }
  if (payload?.ageConsentAccepted !== true) {
    sendJson(res, 400, "Please confirm the age and consent notice before continuing.");
    return;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: promptV1 },
    ...sanitiseHistory(payload?.history),
    { role: "user", content: message },
  ];

  // Repeat safety checks at the trusted server boundary. Client checks remain
  // useful for UX, but cannot be treated as enforcement because callers can
  // POST directly to this public endpoint.
  const detection = detectUserTurn({ text: message, conversationId });
  if (!detection.intake.ok) {
    sendJson(res, 400, INVALID_MESSAGE);
    return;
  }
  if (
    (!detection.behaviour.continueOpenEnded || detection.categories.includes("child_safety")) &&
    detection.crisis
  ) {
    sendSseText(res, crisisTextFor(detection));
    if (detection.signal) await sendSafetyNotification(detection.signal);
    return;
  }

  const config = resolveProviderConfig();
  if (!config) {
    if (detection.crisis) {
      sendSseText(res, crisisTextFor(detection));
      return;
    }
    sendJson(res, 500, GENERIC_ERROR);
    return;
  }

  const usedTurns = turnStore.get(conversationId) ?? 0;
  if (usedTurns >= MAX_TURNS_PER_CONVERSATION) {
    sendJson(res, 429, TURN_CAP_MESSAGE);
    return;
  }
  turnStore.set(conversationId, usedTurns + 1);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getProviderTimeoutMs());
  let aborted = false;
  const onClose = () => {
    // Client vanished mid-stream: stop generation so we stop being billed.
    if (res.writableEnded) return;
    aborted = true;
    controller.abort();
  };
  // IncomingMessage's `close` also fires when the request body has finished.
  // Listen on the response instead so a normal POST does not cancel generation.
  if (typeof res.on === "function") res.on("close", onClose);

  const detach = () => {
    clearTimeout(timeout);
    if (typeof res.off === "function") res.off("close", onClose);
  };

  let upstream: any;
  try {
    upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(config, messages)),
      signal: controller.signal,
    });
  } catch {
    // Never log the body or the error: the message is deliberately generic.
    detach();
    sendJson(res, 500, GENERIC_ERROR);
    return;
  }

  if (!upstream.ok || !upstream.body) {
    detach();
    sendJson(res, 500, GENERIC_ERROR);
    return;
  }

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  writeSse(res, { type: "meta", promptVersion });
  // Keep the visitor's stream and idle timer alive while the provider prepares
  // its first user-facing tokens. The payload is an SSE comment, not content.
  const heartbeat = setInterval(() => {
    if (res.writableEnded || res.destroyed) return;
    try {
      res.write(": keep-alive\n\n");
    } catch {
      // The close handler below aborts upstream work when the visitor leaves.
    }
  }, 15_000);

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let reply = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (aborted) {
        await reader.cancel().catch(() => undefined);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        const text = extractDeltaText(data);
        if (text) reply += text;
      }
    }

    if (!aborted) {
      // Do not expose a prohibited reply token by token. The response is
      // checked in full, then emitted as bounded SSE chunks.
      const checked = detectAssistantReply(reply);
      const safeReply = checked.flagged
        ? "Akili Sawa cannot offer diagnoses or advice on medication. I can stay with you and help you think about what might help next."
        : toPlainText(reply);
      for (let offset = 0; offset < safeReply.length; offset += 48) {
        writeSse(res, { type: "delta", text: safeReply.slice(offset, offset + 48) });
        if (offset + 48 < safeReply.length) {
          await new Promise((resolve) => setTimeout(resolve, 12));
        }
      }
      writeSse(res, { type: "done", promptVersion });
    }
  } catch {
    if (!aborted) {
      writeSse(res, { type: "error", message: GENERIC_ERROR });
    }
  } finally {
    clearInterval(heartbeat);
    detach();
    res.end();
  }
}
