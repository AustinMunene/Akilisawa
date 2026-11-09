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

import type { SeverityTier, SignalCategory } from "./tiers.js";

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

/*
 * High severity, harm to others, with no self-harm or suicide signal. Until
 * 9 November this path reused CRISIS_BLOCK, which opens "It sounds like you
 * might be thinking about suicide" - wrong for someone who says they might
 * hurt another person, and wrong for someone who says another person tried to
 * stab them, because the lexicon cannot tell those apart. So the opener names
 * neither side: it says someone may be in danger of being hurt, then speaks to
 * both the person at risk and the person who fears what they might do.
 *
 * Adopted on the owner's decision from the feedback brief's recommendations,
 * not a clinical review; Kiswahili still pending review. Every number is from
 * the verified list above (999/112, 1199, 1195, Befrienders); no new resource
 * is introduced. See docs/adr/sawa-feedback-response-v1.md sections 5 and 6.
 */
// Short on purpose (9 November): someone this close to violence will not read
// eleven paragraphs. Four short ones: what is happening, the emergency line,
// one step for each side, and who to talk to.
export const HARM_TO_OTHERS_BLOCK: BilingualText = {
  en: [
    "It sounds like someone could get hurt. Thank you for telling us.",
    "If anyone is in danger right now, call 999 or 112. It is free from any phone, even with no airtime. Akili Sawa cannot call for you.",
    "If you are afraid of what you might do, step away from the person now. If someone is hurting you, get somewhere safe, near other people.",
    "To talk to someone any time: Kenya Red Cross on 1199, or gender-based violence support on 1195.",
  ].join("\n\n"),
  sw: [
    "Inaonekana kuna mtu anaweza kuumizwa. Asante kwa kutujulisha.",
    "Kama kuna mtu yuko hatarini sasa hivi, piga 999 au 112. Ni bure kutoka kwa simu yoyote, hata bila salio. Akili Sawa haiwezi kukupigia simu.",
    "Kama unaogopa kile unaweza kufanya, jitenge na huyo mtu sasa hivi. Kama kuna mtu anakuumiza, nenda mahali salama, karibu na watu wengine.",
    "Kuongea na mtu wakati wowote: Kenya Red Cross kwa 1199, au usaidizi wa unyanyasaji wa kijinsia kwa 1195.",
  ].join("\n\n"),
};

const HARM_TO_OTHERS_RESOURCES = ["emergency", "krcs", "gbv"] as const;

/*
 * Elevated harm to others: an urge, a feeling or a fear of what one might do
 * ("I wanna hurt someone"). Sawa's own reply does the work: it stays calm,
 * asks whether anyone is in danger and asks what happened. This is the one
 * line that follows it, as the feedback's "current risk" step asks: a direct
 * safety question in the reply, one specialist line after it, keep the
 * person engaged. Kiswahili pending review.
 */
export const HARM_URGE_SUPPORT: BilingualText = {
  en: "If anyone is in danger right now, call 999 or 112. To talk to someone any time, call Kenya Red Cross on 1199.",
  sw: "Kama kuna mtu yuko hatarini sasa hivi, piga 999 au 112. Kuongea na mtu wakati wowote, piga Kenya Red Cross kwa 1199.",
};

export type CrisisResponse = {
  readonly text: BilingualText;
  readonly resourceIds: readonly string[];
};

/*
 * Elevated: Sawa's own reply comes first and carries the conversation; these
 * short lines follow it. Until 9 November this was a nine-line block with a
 * scripted opener, which read as a leaflet to someone afraid to go home
 * tonight. Now: the line that matches the need, then who to talk to. Every
 * number is from the verified list above. Kiswahili pending review.
 */
const ELEVATED_TALK: BilingualText = {
  en: "To talk to someone any time, call Kenya Red Cross on 1199, or Befrienders Kenya on 0722 178 177 (Monday to Friday, 09:00 to 17:00).",
  sw: "Kuongea na mtu wakati wowote, piga Kenya Red Cross kwa 1199, au Befrienders Kenya kwa 0722 178 177 (Jumatatu hadi Ijumaa, 09:00 hadi 17:00).",
};

const SPECIALIST_LINES: Record<
  "gbv" | "substance_crisis" | "child_safety",
  { ids: readonly string[]; line: BilingualText }
> = {
  gbv: {
    ids: ["emergency", "gbv"],
    line: {
      en: "If you are in danger right now, call 999 or 112. Gender-based violence support (violence or threats): 1195, any time.",
      sw: "Kama uko hatarini sasa hivi, piga 999 au 112. Usaidizi wa unyanyasaji wa kijinsia (vurugu au vitisho): 1195, wakati wowote.",
    },
  },
  substance_crisis: {
    ids: ["nacada"],
    line: {
      en: "For alcohol or drugs, NACADA is on 1192, any time.",
      sw: "Kwa pombe au madawa ya kulevya, NACADA ni 1192, wakati wowote.",
    },
  },
  child_safety: {
    ids: ["childline"],
    line: {
      en: "For anyone under 18, Childline Kenya is on 116, any time.",
      sw: "Kwa walio chini ya miaka 18, Childline Kenya ni 116, wakati wowote.",
    },
  },
};

const SPECIALIST_KEYS = ["gbv", "substance_crisis", "child_safety"] as const;

function buildElevated(categories: readonly SignalCategory[]): CrisisResponse {
  const specialists = SPECIALIST_KEYS.filter((key) => categories.includes(key));
  const lines = (language: "en" | "sw") =>
    [...specialists.map((key) => SPECIALIST_LINES[key].line[language]), ELEVATED_TALK[language]].join("\n\n");
  return {
    text: { en: lines("en"), sw: lines("sw") },
    resourceIds: ["krcs", "befrienders", ...specialists.flatMap((key) => SPECIALIST_LINES[key].ids)],
  };
}

export function crisisResponseFor(
  tier: SeverityTier,
  categories: readonly SignalCategory[],
): CrisisResponse | null {
  if (
    tier === "high" &&
    categories.includes("harm_to_others") &&
    !categories.includes("suicidal_ideation") &&
    !categories.includes("self_harm")
  ) {
    return { text: HARM_TO_OTHERS_BLOCK, resourceIds: [...HARM_TO_OTHERS_RESOURCES] };
  }
  if (tier === "high") {
    return {
      text: CRISIS_BLOCK,
      resourceIds: CRISIS_RESOURCES.map((resource) => resource.id),
    };
  }
  if (tier === "elevated" && categories.includes("harm_to_others")) {
    return { text: HARM_URGE_SUPPORT, resourceIds: ["emergency", "krcs"] };
  }
  if (tier === "elevated") return buildElevated(categories);
  return null;
}

/*
 * Every fixed block the safety pipeline can show, in both languages. Used to
 * keep this copy out of the history sent to the model: it is the system
 * speaking, not Sawa, and a model that sees "itself" say the support line
 * twice starts repeating it instead of listening (found in testing,
 * 9 November).
 */
const FIXED_SAFETY_COPY: ReadonlySet<string> = (() => {
  const texts = new Set<string>();
  const add = (text: BilingualText) => {
    texts.add(text.en.trim());
    texts.add(text.sw.trim());
  };
  add(CRISIS_BLOCK);
  add(HARM_TO_OTHERS_BLOCK);
  add(HARM_URGE_SUPPORT);
  // Every combination of specialist lines the elevated block can carry.
  for (let mask = 0; mask < 1 << SPECIALIST_KEYS.length; mask += 1) {
    const categories = SPECIALIST_KEYS.filter((_key, index) => mask & (1 << index));
    add(buildElevated(categories).text);
  }
  return texts;
})();

export function isFixedSafetyCopy(text: string): boolean {
  return FIXED_SAFETY_COPY.has(text.trim());
}
