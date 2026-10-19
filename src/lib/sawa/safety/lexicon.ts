/*
 * The bilingual crisis and distress lexicon (ticket 17).
 *
 * Build it bilingual from day one (SAWA-AI-NO-ACCOUNTS-APPROACH.md section 2).
 * Kiswahili is the language most likely to be used at the moment of crisis, so
 * an English-only list misses the people it exists for. Matching is per phrase,
 * so code-switched turns ("nimekuwa vizuri sana but I am so tired") match
 * whichever language the distress actually appears in.
 *
 * A word list alone cannot cover indirect reference, so the `indirect` entries
 * carry the euphemisms ("joining my brother") that read as something else on
 * their surface. This list is the deterministic floor; section 2 permits a
 * model-assisted classifier call above it, wired later, not here.
 *
 * What is deliberately absent: "trauma", "emergency" and similar wellbeing
 * vocabulary. api/contact.ts:21 rejected B2B enquiries for containing them.
 * That inverted list is the anti-pattern this ticket exists to not reproduce.
 */

import type { SeverityTier, SignalCategory } from "./tiers.js";

export type LexiconLang = "en" | "sw";

export type LexiconEntry = {
  readonly term: string;
  readonly lang: LexiconLang;
  readonly category: SignalCategory;
  readonly tier: SeverityTier;
  readonly indirect?: boolean;
};

export type LexiconMatch = {
  readonly entry: LexiconEntry;
  readonly index: number;
};

const high = "high" as const;
const elevated = "elevated" as const;
const low = "low" as const;
const abuse = "abuse" as const;

export const LEXICON: readonly LexiconEntry[] = [
  // High: active suicidal ideation.
  { term: "suicide", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "suicidal", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "kill myself", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "killing myself", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "end my life", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "ending my life", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "take my own life", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "want to die", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "wanna die", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "wish i was dead", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "wish i were dead", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "better off dead", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "no reason to live", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "nothing to live for", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "do not want to live", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "dont want to live", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "end it all", lang: "en", category: "suicidal_ideation", tier: high },
  { term: "not worth living", lang: "en", category: "suicidal_ideation", tier: high },

  { term: "kujiua", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "kujiuwa", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nataka kufa", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "sitaki kuishi", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "sitaki kuendelea", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "kumaliza maisha yangu", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "sina sababu ya kuishi", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "hakuna sababu ya kuishi", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "bora nife", lang: "sw", category: "suicidal_ideation", tier: high },

  // High: self-harm.
  { term: "self harm", lang: "en", category: "self_harm", tier: high },
  { term: "selfharm", lang: "en", category: "self_harm", tier: high },
  { term: "cut myself", lang: "en", category: "self_harm", tier: high },
  { term: "cutting myself", lang: "en", category: "self_harm", tier: high },
  { term: "hurt myself", lang: "en", category: "self_harm", tier: high },
  { term: "hurting myself", lang: "en", category: "self_harm", tier: high },
  { term: "harm myself", lang: "en", category: "self_harm", tier: high },
  { term: "burning myself", lang: "en", category: "self_harm", tier: high },
  { term: "starve myself", lang: "en", category: "self_harm", tier: high },

  { term: "kujidhuru", lang: "sw", category: "self_harm", tier: high },
  { term: "kujiumiza", lang: "sw", category: "self_harm", tier: high },
  { term: "kujikata", lang: "sw", category: "self_harm", tier: high },
  { term: "najikata", lang: "sw", category: "self_harm", tier: high },
  { term: "kujichoma", lang: "sw", category: "self_harm", tier: high },

  // High: indirect reference, the euphemisms a word list misses.
  { term: "joining my brother", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "join my brother", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "joining my sister", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "joining my mother", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "be with my brother", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "be with my dad", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "leave this world", lang: "en", category: "indirect_reference", tier: high, indirect: true },
  { term: "not be here anymore", lang: "en", category: "indirect_reference", tier: high, indirect: true },

  { term: "kujiunga na ndugu yangu", lang: "sw", category: "indirect_reference", tier: high, indirect: true },
  { term: "kujiunga na wazazi wangu", lang: "sw", category: "indirect_reference", tier: high, indirect: true },
  { term: "kuwa na ndugu yangu", lang: "sw", category: "indirect_reference", tier: high, indirect: true },

  // High: risk to others.
  { term: "kill him", lang: "en", category: "harm_to_others", tier: high },
  { term: "kill her", lang: "en", category: "harm_to_others", tier: high },
  { term: "kill them", lang: "en", category: "harm_to_others", tier: high },
  { term: "hurt him", lang: "en", category: "harm_to_others", tier: high },
  { term: "hurt her", lang: "en", category: "harm_to_others", tier: high },
  { term: "stab", lang: "en", category: "harm_to_others", tier: high },

  { term: "kumuua", lang: "sw", category: "harm_to_others", tier: high },
  { term: "kumdhuru", lang: "sw", category: "harm_to_others", tier: high },
  { term: "kuwadhuru", lang: "sw", category: "harm_to_others", tier: high },
  { term: "kuchoma moto", lang: "sw", category: "harm_to_others", tier: high },

  // Elevated: gender-based violence.
  { term: "rape", lang: "en", category: "gbv", tier: elevated },
  { term: "raped", lang: "en", category: "gbv", tier: elevated },
  { term: "raping me", lang: "en", category: "gbv", tier: elevated },
  { term: "sexual assault", lang: "en", category: "gbv", tier: elevated },
  { term: "sexually assaulted", lang: "en", category: "gbv", tier: elevated },
  { term: "domestic violence", lang: "en", category: "gbv", tier: elevated },
  { term: "he hits me", lang: "en", category: "gbv", tier: elevated },
  { term: "she hits me", lang: "en", category: "gbv", tier: elevated },
  { term: "beats me", lang: "en", category: "gbv", tier: elevated },
  { term: "abusive partner", lang: "en", category: "gbv", tier: elevated },
  { term: "forced me", lang: "en", category: "gbv", tier: elevated },

  { term: "nibakwa", lang: "sw", category: "gbv", tier: elevated },
  { term: "kubakwa", lang: "sw", category: "gbv", tier: elevated },
  { term: "alinibaka", lang: "sw", category: "gbv", tier: elevated },
  { term: "ananibaka", lang: "sw", category: "gbv", tier: elevated },
  { term: "ananipiga", lang: "sw", category: "gbv", tier: elevated },
  { term: "kunipiga", lang: "sw", category: "gbv", tier: elevated },
  { term: "unyanyasaji wa kijinsia", lang: "sw", category: "gbv", tier: elevated },
  { term: "ukatili wa kijinsia", lang: "sw", category: "gbv", tier: elevated },
  { term: "amenilazimisha", lang: "sw", category: "gbv", tier: elevated },

  // Elevated: substance crisis.
  { term: "overdose", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "overdosed", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "overdosing", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "cannot stop drinking", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "cant stop drinking", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "cannot stop using", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "withdrawal", lang: "en", category: "substance_crisis", tier: elevated },
  { term: "relapsed", lang: "en", category: "substance_crisis", tier: elevated },

  { term: "kupindukia dawa", lang: "sw", category: "substance_crisis", tier: elevated },
  { term: "siwezi kuacha kunywa", lang: "sw", category: "substance_crisis", tier: elevated },
  { term: "madawa ya kulevya", lang: "sw", category: "substance_crisis", tier: elevated },
  { term: "pombe kupita kiasi", lang: "sw", category: "substance_crisis", tier: elevated },

  // Elevated: child safety, including under-18 disclosure.
  { term: "i am 12", lang: "en", category: "child_safety", tier: elevated },
  { term: "i am 13", lang: "en", category: "child_safety", tier: elevated },
  { term: "i am 14", lang: "en", category: "child_safety", tier: elevated },
  { term: "i am 15", lang: "en", category: "child_safety", tier: elevated },
  { term: "i am 16", lang: "en", category: "child_safety", tier: elevated },
  { term: "i am 17", lang: "en", category: "child_safety", tier: elevated },
  { term: "child abuse", lang: "en", category: "child_safety", tier: elevated },

  { term: "nina miaka 12", lang: "sw", category: "child_safety", tier: elevated },
  { term: "nina miaka 13", lang: "sw", category: "child_safety", tier: elevated },
  { term: "nina miaka 14", lang: "sw", category: "child_safety", tier: elevated },
  { term: "nina miaka 15", lang: "sw", category: "child_safety", tier: elevated },
  { term: "nina miaka 16", lang: "sw", category: "child_safety", tier: elevated },
  { term: "nina miaka 17", lang: "sw", category: "child_safety", tier: elevated },

  // Elevated: passive distress that still warrants an offer of human support.
  { term: "cannot take it anymore", lang: "en", category: "distress", tier: elevated },
  { term: "cant take it anymore", lang: "en", category: "distress", tier: elevated },
  { term: "hopeless", lang: "en", category: "distress", tier: elevated },
  { term: "worthless", lang: "en", category: "distress", tier: elevated },
  { term: "nobody would miss me", lang: "en", category: "distress", tier: elevated },
  { term: "everything is pointless", lang: "en", category: "distress", tier: elevated },
  { term: "i feel empty", lang: "en", category: "distress", tier: elevated },

  { term: "sina tumaini", lang: "sw", category: "distress", tier: elevated },
  { term: "hakuna anayenijali", lang: "sw", category: "distress", tier: elevated },
  { term: "nimechoka kabisa", lang: "sw", category: "distress", tier: elevated },

  // Low: ordinary distress. Continue and watch.
  { term: "tired", lang: "en", category: "distress", tier: low },
  { term: "exhausted", lang: "en", category: "distress", tier: low },
  { term: "overwhelmed", lang: "en", category: "distress", tier: low },
  { term: "stressed", lang: "en", category: "distress", tier: low },
  { term: "lonely", lang: "en", category: "distress", tier: low },
  { term: "sad", lang: "en", category: "distress", tier: low },
  { term: "unhappy", lang: "en", category: "distress", tier: low },
  { term: "burnt out", lang: "en", category: "distress", tier: low },
  { term: "burned out", lang: "en", category: "distress", tier: low },
  { term: "anxious", lang: "en", category: "distress", tier: low },
  { term: "anxiety", lang: "en", category: "distress", tier: low },
  { term: "depressed", lang: "en", category: "distress", tier: low },
  { term: "depression", lang: "en", category: "distress", tier: low },
  { term: "trauma", lang: "en", category: "distress", tier: low },
  { term: "grief", lang: "en", category: "distress", tier: low },
  { term: "grieving", lang: "en", category: "distress", tier: low },
  { term: "struggling", lang: "en", category: "distress", tier: low },
  { term: "crying", lang: "en", category: "distress", tier: low },
  { term: "cannot sleep", lang: "en", category: "distress", tier: low },
  { term: "cant sleep", lang: "en", category: "distress", tier: low },

  { term: "nimechoka", lang: "sw", category: "distress", tier: low },
  { term: "uchovu", lang: "sw", category: "distress", tier: low },
  { term: "huzuni", lang: "sw", category: "distress", tier: low },
  { term: "upweke", lang: "sw", category: "distress", tier: low },
  { term: "wasiwasi", lang: "sw", category: "distress", tier: low },
  { term: "msongo wa mawazo", lang: "sw", category: "distress", tier: low },
  { term: "ninalia", lang: "sw", category: "distress", tier: low },
  { term: "sijalala", lang: "sw", category: "distress", tier: low },

  // Abuse: declines the turn, but never routes anyone to the crisis channel.
  { term: "you are stupid", lang: "en", category: "abuse", tier: abuse },
  { term: "stupid ai", lang: "en", category: "abuse", tier: abuse },
  { term: "you are useless", lang: "en", category: "abuse", tier: abuse },
  { term: "shut up", lang: "en", category: "abuse", tier: abuse },
  { term: "send me money", lang: "en", category: "abuse", tier: abuse },
  { term: "give me money", lang: "en", category: "abuse", tier: abuse },

  { term: "wewe ni mjinga", lang: "sw", category: "abuse", tier: abuse },
  { term: "wewe ni mpuuzi", lang: "sw", category: "abuse", tier: abuse },
  { term: "nyamaza", lang: "sw", category: "abuse", tier: abuse },
  { term: "niletee pesa", lang: "sw", category: "abuse", tier: abuse },
];

const APOSTROPHES = /['\u2019`]/g;
const NON_WORD = /[^\p{L}\p{N}]+/gu;

/*
 * Normalising both the lexicon and the incoming text the same way makes the
 * match apostrophe-insensitive ("cannot" vs "can't"), punctuation-insensitive
 * and whitespace-insensitive, and makes it case-insensitive without a regex
 * per entry. Used for the substring test only, never for anything a user sees.
 */
export function normalise(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .replace(NON_WORD, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const NEEDLES: readonly { entry: LexiconEntry; needle: string }[] = LEXICON.map(
  (entry) => ({ entry, needle: ` ${normalise(entry.term)} ` }),
);

export function matchLexicon(text: string): LexiconMatch[] {
  const haystack = ` ${normalise(text)} `;
  const matches: LexiconMatch[] = [];
  for (const { entry, needle } of NEEDLES) {
    const index = haystack.indexOf(needle);
    if (index !== -1) matches.push({ entry, index });
  }
  return matches;
}
