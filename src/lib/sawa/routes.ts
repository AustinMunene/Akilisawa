/*
 * The full-screen Sawa conversation. SawaLauncher sends visitors here with
 * their first message in router state; SawaChatPage reads it once and then
 * drops it from history, so the message is not left in the history entry.
 */
export const SAWA_CHAT_PATH = "/sawa-ai/chat";

export type SawaChatLocationState = { readonly start?: string };

export function startMessageFrom(state: unknown): string | undefined {
  if (!state || typeof state !== "object") return undefined;
  const start = (state as SawaChatLocationState).start;
  return typeof start === "string" && start.trim().length > 0 ? start : undefined;
}
