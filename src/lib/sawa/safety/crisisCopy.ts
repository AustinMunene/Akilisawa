/*
 * The mandated crisis copy and the verified Kenya resources (ticket 17).
 *
 * The full block below is copied verbatim from docs/adr/crisis-resources-v1.md,
 * the human-owned list from ticket 08. Nothing outside that document may be
 * cited here, or anywhere else in the product: an invented helpline is worse
 * than no helpline. The opening line is the mandated opener and ships exactly
 * as written.
 *
 * Voice is voice-v1: directive, calm, house third person (`Akili Sawa`, `us`),
 * British English, sentence case, no exclamation marks, no emoji. Every number
 * is one the user dials themselves; the copy never implies dispatch and never
 * says Akili Sawa has contacted anyone.
 *
 * High severity emits the full block and stops open-ended conversation.
 * Elevated emits the shorter support block plus only the specialist lines that
 * match the disclosed need.
 */

import type { SeverityTier, SignalCategory } from "./tiers";

export type BilingualText = {
  readonly en: string;
  readonly sw: string;
};

export type CrisisResource = {
  readonly id: string;
  readonly organisation: string;
  readonly phone: string;
  readonly hours: string;
  readonly languages: string;
  readonly tiers: readonly SeverityTier[];
};

// From docs/adr/crisis-resources-v1.md "The verified list". Review gate 2026-12-08.
export const CRISIS_RESOURCES: readonly CrisisResource[] = [
  {
    id: "emergency",
    organisation: "National emergency (police)",
    phone: "999 or 112",
    hours: "24/7",
    languages: "English, Kiswahili",
    tiers: ["high"],
  },
  {
    id: "krcs",
    organisation: "Kenya Red Cross Society",
    phone: "1199",
    hours: "24/7",
    languages: "English and Kiswahili reported",
    tiers: ["high", "elevated"],
  },
  {
    id: "befrienders",
    organisation: "Befrienders Kenya",
    phone: "0722 178 177",
    hours: "Monday to Friday 09:00-17:00",
    languages: "English",
    tiers: ["high", "elevated"],
  },
  {
    id: "gbv",
    organisation: "National gender-based violence helpline",
    phone: "1195",
    hours: "24/7",
    languages: "English, Kiswahili reported",
    tiers: ["elevated"],
  },
  {
    id: "childline",
    organisation: "National Child Helpline (Childline Kenya)",
    phone: "116",
    hours: "24/7",
    languages: "English",
    tiers: ["elevated"],
  },
  {
    id: "nacada",
    organisation: "NACADA (alcohol and drugs)",
    phone: "1192",
    hours: "24/7",
    languages: "English, Kiswahili",
    tiers: ["elevated"],
  },
];

export const MANDATED_OPENER: BilingualText = {
  en: "It sounds like you might be thinking about suicide. Thank you for telling us.",
  sw: "Inawezekana unafikiria kujiua. Asante kwa kutujulisha.",
};

// High. Verbatim from crisis-resources-v1.md, reflowed to paragraphs only.
export const CRISIS_BLOCK: BilingualText = {
  en: [
    "It sounds like you might be thinking about suicide. Thank you for telling us.",
    "Akili Sawa cannot handle this alone, but there are people in Kenya who are ready to help you now, free of charge.",
    "If you are in immediate danger, call 999 or 112. This is the national emergency line, run by the Kenya police. It is free from any phone in Kenya, even with no airtime. Akili Sawa cannot call on your behalf.",
    "To talk to someone, any time, day or night:",
    "- Kenya Red Cross, mental health and psychosocial support: 1199",
    "At other times, or for specialist support:",
    "- Befrienders Kenya, confidential emotional support: 0722 178 177, Monday to Friday 09:00-17:00, call, SMS or WhatsApp",
    "- Gender-based violence support: 1195",
    "- Alcohol and drug support (NACADA): 1192",
    "- Children and young people (Childline Kenya): 116",
    "If one number does not connect, try the next. If you feel you cannot keep yourself safe, go to the nearest hospital emergency department, or call 999 or 112 and ask for the police or an ambulance.",
  ].join("\n\n"),
  sw: [
    "Inawezekana unafikiria kujiua. Asante kwa kutujulisha.",
    "Akili Sawa haiwezi kushughulikia hili peke yake, lakini kuna watu nchini Kenya walio tayari kukusaidia sasa hivi, bila malipo.",
    "Ikiwa uko hatarini mara moja, piga 999 au 112. Hii ni nambari ya dharura ya taifa, inayoendeshwa na polisi wa Kenya. Ni bure kutoka kwa simu yoyote nchini Kenya, hata kama huna salio. Akili Sawa haiwezi kupiga simu kwa niaba yako.",
    "Ili kuzungumza na mtu, wakati wowote, mchana au usiku:",
    "- Kenya Red Cross, usaidizi wa afya ya akili na kisaikolojia: 1199",
    "Nyakati nyingine, au kwa usaidizi maalum:",
    "- Befrienders Kenya, usaidizi wa faragha wa kihisia: 0722 178 177, Jumatatu hadi Ijumaa 09:00-17:00, simu, SMS au WhatsApp",
    "- Usaidizi wa unyanyasaji wa kijinsia (GBV): 1195",
    "- Usaidizi wa pombe na madawa ya kulevya (NACADA): 1192",
    "- Watoto na vijana (Childline Kenya): 116",
    "Ikiwa nambari moja haifunguki, jaribu inayofuata. Ikiwa unahisi huwezi kujilinda, nenda hospitali iliyo karibu, au piga 999 au 112 na uombe polisi au gari la wagonjwa.",
  ].join("\n\n"),
};

export type CrisisResponse = {
  readonly text: BilingualText;
  readonly resourceIds: readonly string[];
};

const ELEVATED_OPENER: BilingualText = {
  en: "Thank you for telling us. What you are carrying sounds heavy, and Akili Sawa cannot handle it alone. There are people in Kenya who are ready to help you, free of charge.",
  sw: "Asante kwa kutujulisha. Kile unachobeba ni kizito, na Akili Sawa haiwezi kushughulikia hili peke yake. Kuna watu nchini Kenya walio tayari kukusaidia, bila malipo.",
};

const ELEVATED_SUPPORT: BilingualText = {
  en: [
    "To talk to someone:",
    "- Kenya Red Cross, mental health and psychosocial support: 1199",
    "- Befrienders Kenya, confidential emotional support: 0722 178 177, Monday to Friday 09:00-17:00, call, SMS or WhatsApp",
  ].join("\n"),
  sw: [
    "Ili kuzungumza na mtu:",
    "- Kenya Red Cross, usaidizi wa afya ya akili na kisaikolojia: 1199",
    "- Befrienders Kenya, usaidizi wa faragha wa kihisia: 0722 178 177, Jumatatu hadi Ijumaa 09:00-17:00, simu, SMS au WhatsApp",
  ].join("\n"),
};

const ELEVATED_CLOSE: BilingualText = {
  en: "If one number does not connect, try the next.",
  sw: "Ikiwa nambari moja haifunguki, jaribu inayofuata.",
};

const SPECIALIST_LINES: Record<
  "gbv" | "substance_crisis" | "child_safety",
  { id: string; line: BilingualText }
> = {
  gbv: {
    id: "gbv",
    line: {
      en: "- Gender-based violence support: 1195",
      sw: "- Usaidizi wa unyanyasaji wa kijinsia (GBV): 1195",
    },
  },
  substance_crisis: {
    id: "nacada",
    line: {
      en: "- Alcohol and drug support (NACADA): 1192",
      sw: "- Usaidizi wa pombe na madawa ya kulevya (NACADA): 1192",
    },
  },
  child_safety: {
    id: "childline",
    line: {
      en: "- Children and young people (Childline Kenya): 116",
      sw: "- Watoto na vijana (Childline Kenya): 116",
    },
  },
};

const SPECIALIST_KEYS = ["gbv", "substance_crisis", "child_safety"] as const;

function buildElevated(categories: readonly SignalCategory[]): CrisisResponse {
  const specialists = SPECIALIST_KEYS.filter((key) => categories.includes(key));
  const resourceIds = ["krcs", "befrienders", ...specialists.map((key) => SPECIALIST_LINES[key].id)];

  if (specialists.length === 0) {
    return {
      text: {
        en: `${ELEVATED_OPENER.en}\n\n${ELEVATED_SUPPORT.en}\n\n${ELEVATED_CLOSE.en}`,
        sw: `${ELEVATED_OPENER.sw}\n\n${ELEVATED_SUPPORT.sw}\n\n${ELEVATED_CLOSE.sw}`,
      },
      resourceIds,
    };
  }

  const labels = { en: "At other times, or for specialist support:", sw: "Nyakati nyingine, au kwa usaidizi maalum:" };
  const enLines = specialists.map((key) => SPECIALIST_LINES[key].line.en).join("\n");
  const swLines = specialists.map((key) => SPECIALIST_LINES[key].line.sw).join("\n");

  return {
    text: {
      en: `${ELEVATED_OPENER.en}\n\n${ELEVATED_SUPPORT.en}\n\n${labels.en}\n${enLines}\n\n${ELEVATED_CLOSE.en}`,
      sw: `${ELEVATED_OPENER.sw}\n\n${ELEVATED_SUPPORT.sw}\n\n${labels.sw}\n${swLines}\n\n${ELEVATED_CLOSE.sw}`,
    },
    resourceIds,
  };
}

export function crisisResponseFor(
  tier: SeverityTier,
  categories: readonly SignalCategory[],
): CrisisResponse | null {
  if (tier === "high") {
    return {
      text: CRISIS_BLOCK,
      resourceIds: CRISIS_RESOURCES.map((resource) => resource.id),
    };
  }
  if (tier === "elevated") return buildElevated(categories);
  return null;
}
