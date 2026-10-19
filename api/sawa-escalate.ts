import { detectUserTurn } from "../src/lib/sawa/safety/detector.js";
import { sendSafetyNotification } from "./_sawaEscalation.js";

const IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ALERTS_PER_IP_PER_DAY = 10;
const ipStore = new Map<string, { count: number; start: number }>();

const sendJson = (res: any, status: number, message: string) => {
  res.status(status).json({ message });
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, "Method not allowed.");
    return;
  }

  const forwarded = req.headers?.["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : "unknown";
  const now = Date.now();
  const ipRecord = ipStore.get(ip);
  if (!ipRecord || now - ipRecord.start > IP_WINDOW_MS) {
    ipStore.set(ip, { count: 1, start: now });
  } else if (ipRecord.count >= MAX_ALERTS_PER_IP_PER_DAY) {
    sendJson(res, 429, "Too many requests. Please try again later.");
    return;
  } else {
    ipRecord.count += 1;
  }

  let payload: any;
  try {
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    sendJson(res, 400, "Invalid submission.");
    return;
  }

  const conversationId = payload?.conversationId;
  const excerpt = payload?.excerpt;
  if (
    typeof conversationId !== "string" ||
    !/^[A-Za-z0-9_-]{8,64}$/.test(conversationId) ||
    typeof excerpt !== "string" ||
    excerpt.length === 0 ||
    excerpt.length > 500 ||
    payload?.ageConsentAccepted !== true
  ) {
    sendJson(res, 400, "Invalid submission.");
    return;
  }

  // Do not trust a severity or signal supplied by the browser. Reclassify the
  // excerpt at the server boundary and only send high-severity signals.
  const detection = detectUserTurn({ text: excerpt, conversationId });
  if (detection.tier !== "high" || !detection.signal) {
    sendJson(res, 400, "Invalid submission.");
    return;
  }

  const sent = await sendSafetyNotification(detection.signal);
  if (!sent) {
    sendJson(res, 503, "Akili Sawa cannot send a support notification right now.");
    return;
  }
  res.status(200).json({ message: "ok" });
}
