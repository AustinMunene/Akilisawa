/*
 * The Akili Sawa WhatsApp line: a route to the organisation's own doctors and
 * therapists, offered beside the support and crisis messages.
 *
 * SWITCHED OFF UNTIL A NUMBER EXISTS. The line is not live yet; the number is
 * still to come from the clinical team. Nothing renders until
 * VITE_SAWA_WHATSAPP_NUMBER is set (Vercel environment, then redeploy).
 *
 * PRIVACY. The link is `https://wa.me/<number>?text=<message>`: whatever is
 * pre-typed travels in that URL, through WhatsApp's link service, and sits in
 * browser history. So the default message is a neutral starter. What the
 * person told Sawa is added only if they tick the box for it, capped at the
 * same 500 characters the support inbox takes. Nothing is ever sent for them:
 * WhatsApp opens with the text ready and the person decides whether to press
 * send.
 *
 * NOT AN EMERGENCY SERVICE. Until the clinical team confirms hours and response
 * times, the copy promises neither. In the crisis message 999/112 stays first
 * and the card says so.
 */

import type { SawaLanguage } from "./language";
import type { SeverityTier } from "./safety/tiers";

export const WHATSAPP_EXCERPT_MAX = 500;

/**
 * Digits only, country code first, no plus (wa.me's format, e.g. 2547XXXXXXXX).
 * Anything else counts as unset, so a mistyped value hides the card rather than
 * opening a broken link.
 */
export function parseWhatsAppNumber(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[\s+()-]/g, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function configuredWhatsAppNumber(): string | null {
  return parseWhatsAppNumber(import.meta.env.VITE_SAWA_WHATSAPP_NUMBER);
}

export type WhatsAppCopy = {
  readonly title: string;
  readonly body: string;
  readonly reply: string;
  readonly urgent: string;
  readonly includeLabel: string;
  readonly open: string;
  readonly starter: string;
  readonly excerptLabel: string;
};

// Kiswahili pending the native review, like the rest of the safety copy.
export const whatsappCopy: Readonly<Record<SawaLanguage, WhatsAppCopy>> = {
  en: {
    title: "Talk to the Akili Sawa team on WhatsApp",
    body: "Our doctors and therapists read these messages. WhatsApp opens with a message ready, and you choose whether to send it.",
    reply: "They reply as soon as they can. This is not an emergency service.",
    urgent: "In danger right now? Call 999 or 112 first.",
    includeLabel: "Add what I wrote to Sawa, so they know what is happening",
    open: "Open WhatsApp",
    starter: "Hi, I was talking to Sawa and I would like to speak to someone.",
    excerptLabel: "What I wrote:",
  },
  sw: {
    title: "Ongea na timu ya Akili Sawa kwa WhatsApp",
    body: "Madaktari na wataalamu wetu wa tiba husoma ujumbe huu. WhatsApp itafunguka na ujumbe tayari, na wewe ndiye utaamua kuutuma.",
    reply: "Watajibu haraka wawezavyo. Hii si huduma ya dharura.",
    urgent: "Uko hatarini sasa hivi? Piga 999 au 112 kwanza.",
    includeLabel: "Ongeza nilichoandika kwa Sawa, ili wajue kinachoendelea",
    open: "Fungua WhatsApp",
    starter: "Habari, nilikuwa naongea na Sawa na ningependa kuongea na mtu.",
    excerptLabel: "Nilichoandika:",
  },
};

/** Shown in the Sawa privacy section only while the line is switched on. */
export const whatsappPrivacyNote: Readonly<Record<SawaLanguage, string>> = {
  en: "If you choose to message the Akili Sawa team on WhatsApp, that conversation happens on WhatsApp, not in Sawa. Akili Sawa then sees your phone number and what you send, and WhatsApp's own terms apply. Nothing is sent unless you press send yourself.",
  sw: "Ukichagua kutumia WhatsApp kuongea na timu ya Akili Sawa, mazungumzo hayo yanafanyika kwenye WhatsApp, si kwenye Sawa. Akili Sawa itaona nambari yako ya simu na unachotuma, na masharti ya WhatsApp yanatumika. Hakuna kinachotumwa usipobonyeza tuma mwenyewe.",
};

export function whatsappMessage(
  language: SawaLanguage,
  excerpt?: string,
): string {
  const t = whatsappCopy[language];
  const trimmed = excerpt?.trim();
  if (!trimmed) return t.starter;
  const capped =
    trimmed.length > WHATSAPP_EXCERPT_MAX ? trimmed.slice(0, WHATSAPP_EXCERPT_MAX) : trimmed;
  return `${t.starter}\n\n${t.excerptLabel} ${capped}`;
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

type Turn = {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly safety?: { readonly tier: SeverityTier };
};

export type WhatsAppAnchor = { readonly excerpt: string; readonly tier: SeverityTier };

/**
 * Which assistant turns get the WhatsApp card, and with which excerpt.
 *
 * An elevated turn is two assistant bubbles (Sawa's reply, then the support
 * block) that both carry the safety result, so the card goes under the LAST
 * bubble of a run, once. The excerpt is the user turn that started the run.
 * Abuse aimed at Sawa never gets the card.
 */
export function whatsappAnchors(messages: readonly Turn[]): Map<string, WhatsAppAnchor> {
  const anchors = new Map<string, WhatsAppAnchor>();
  const flagged = (turn: Turn | undefined) =>
    turn?.role === "assistant" &&
    (turn.safety?.tier === "elevated" || turn.safety?.tier === "high");

  let lastUser = "";
  messages.forEach((turn, index) => {
    if (turn.role === "user") {
      lastUser = turn.content;
      return;
    }
    if (!flagged(turn) || flagged(messages[index + 1])) return;
    anchors.set(turn.id, { excerpt: lastUser, tier: turn.safety!.tier });
  });
  return anchors;
}
