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
// runs, which `npm run verify` cannot catch: tsconfig.api.json resolves with
// `moduleResolution: "Bundler"`, where the extensionless form typechecks fine.
import { promptV1, promptVersion } from "../src/lib/sawa/prompt.js";

type Provider = "mistral" | "openai";

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
const DEFAULT_PROVIDER_TIMEOUT_MS = 25_000;

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
  const provider: Provider =
    process.env.SAWA_MODEL_PROVIDER === "openai" ? "openai" : "mistral";

  const apiKey =
    provider === "openai" ? process.env.OPENAI_API_KEY : process.env.MISTRAL_API_KEY;
  const baseUrl =
    provider === "openai" ? process.env.OPENAI_BASE_URL : process.env.MISTRAL_BASE_URL;
  const model =
    provider === "openai" ? process.env.OPENAI_MODEL : process.env.MISTRAL_MODEL;

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
  };
  if (config.provider === "openai") {
    // OpenAI's zero-data-retention grant requires store=false once approved.
    body.store = false;
    body.stream_options = { include_usage: true };
  }
  return body;
};

// Mistral and OpenAI share the Chat Completions delta shape, so one parser
// covers both and the fallback stays a configuration change.
export const extractDeltaText = (payload: string): string => {
  try {
    const parsed = JSON.parse(payload);
    const content = parsed?.choices?.[0]?.delta?.content;
    return typeof content === "string" ? content : "";
  } catch {
    return "";
  }
};

const sendJson = (res: any, status: number, message: string) => {
  res.status(status).json({ message });
};

const writeSse = (res: any, event: unknown) => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
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

  const config = resolveProviderConfig();
  if (!config) {
    sendJson(res, 500, GENERIC_ERROR);
    return;
  }

  const usedTurns = turnStore.get(conversationId) ?? 0;
  if (usedTurns >= MAX_TURNS_PER_CONVERSATION) {
    sendJson(res, 429, TURN_CAP_MESSAGE);
    return;
  }
  turnStore.set(conversationId, usedTurns + 1);

  const messages: ChatMessage[] = [
    { role: "system", content: promptV1 },
    ...sanitiseHistory(payload?.history),
    { role: "user", content: message },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getProviderTimeoutMs());
  let aborted = false;
  const onClose = () => {
    // Client vanished mid-stream: stop generation so we stop being billed.
    aborted = true;
    controller.abort();
  };
  if (typeof req.on === "function") req.on("close", onClose);

  const detach = () => {
    clearTimeout(timeout);
    if (typeof req.off === "function") req.off("close", onClose);
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
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  writeSse(res, { type: "meta", promptVersion });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

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
        if (text) writeSse(res, { type: "delta", text });
      }
    }

    if (!aborted) {
      writeSse(res, { type: "done", promptVersion });
    }
  } catch {
    if (!aborted) {
      writeSse(res, { type: "error", message: GENERIC_ERROR });
    }
  } finally {
    detach();
    res.end();
  }
}
