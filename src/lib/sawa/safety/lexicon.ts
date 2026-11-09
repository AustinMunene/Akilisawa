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
  /**
   * Possible immediate danger ("afraid to go home tonight"). The support lines
   * come with Sawa's first reply instead of after a follow-up question.
   */
  readonly immediate?: boolean;
  /**
   * Words that cancel the match when they come straight after the term:
   * "hurt her" is a risk, "hurt her feelings" is not.
   */
  readonly unlessFollowedBy?: readonly string[];
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

  /*
   * Inflected forms (ticket 29).
   *
   * A lexicon that lists one form of a phrase misses the people it exists
   * for. Kiswahili verbs inflect for subject and tense, so "nataka kufa"
   * (I want to die) did not match "ninataka kufa" (I really want to die)
   * or "nasitaki kuishi" (I do not want to live). The turn classified as
   * `low`, which means no crisis copy and no escalation: under-classifying
   * distress, the failure this module refuses to make.
   *
   * These are listed explicitly, as separate entries, rather than derived
   * by stripping prefixes off a word. A stripper has to guess where a
   * prefix ends, and a wrong guess turns a benign word into a crisis
   * signal. An explicit list can be read and signed off by the person who
   * has to sign the safety pipeline off, and the file already worked this
   * way: "kujikata" and "najikata" were already both listed.
   */
  { term: "ninataka kufa", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "ninitaka kufa", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nasitaki kuishi", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "ninasitaki kuishi", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nasitaki kuendelea", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "haina sababu ya kuishi", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nibora nife", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nimekumaliza maisha yangu", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nalimaliza maisha yangu", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nimekujiuwa", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nimekujiua", lang: "sw", category: "suicidal_ideation", tier: high },
  { term: "nilikujiuwa", lang: "sw", category: "suicidal_ideation", tier: high },

  // High: self-harm.
  { term: "cut myself", lang: "en", category: "self_harm", tier: high },
  { term: "cutting myself", lang: "en", category: "self_harm", tier: high },
  { term: "kill myself", lang: "en", category: "self_harm", tier: high },
  { term: "killing myself", lang: "en", category: "self_harm", tier: high },
  { term: "hurt myself", lang: "en", category: "self_harm", tier: high },
  { term: "hurting myself", lang: "en", category: "self_harm", tier: high },
  { term: "harm myself", lang: "en", category: "self_harm", tier: high },
  { term: "harming myself", lang: "en", category: "self_harm", tier: high },
  { term: "self harm", lang: "en", category: "self_harm", tier: high },
  { term: "selfharm", lang: "en", category: "self_harm", tier: high },
  { term: "self harming", lang: "en", category: "self_harm", tier: high },
  { term: "burning myself", lang: "en", category: "self_harm", tier: high },
  { term: "starve myself", lang: "en", category: "self_harm", tier: high },

  { term: "kujidhuru", lang: "sw", category: "self_harm", tier: high },
  { term: "kujiumiza", lang: "sw", category: "self_harm", tier: high },
  { term: "kujikata", lang: "sw", category: "self_harm", tier: high },
  { term: "najikata", lang: "sw", category: "self_harm", tier: high },
  { term: "kujichoma", lang: "sw", category: "self_harm", tier: high },

  // Inflected forms of the Kiswahili self-harm infinitives (ticket 29).
  { term: "nimekujikata", lang: "sw", category: "self_harm", tier: high },
  { term: "nilikujikata", lang: "sw", category: "self_harm", tier: high },
  { term: "nimekatakata", lang: "sw", category: "self_harm", tier: high },
  { term: "nimekujidhuru", lang: "sw", category: "self_harm", tier: high },
  { term: "nimekujiumiza", lang: "sw", category: "self_harm", tier: high },
  { term: "nimekujichoma", lang: "sw", category: "self_harm", tier: high },

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

  // Risk to others, graded by what the person says (9 November). A stated
  // intention or violence happening is `high`: the fixed harm-to-others
  // message, no conversation, escalation. An urge, a feeling or a fear of
  // what one might do ("I wanna hurt someone", "I'm scared I'll hurt
  // someone") is `elevated`: it is often anger, or someone asking for help,
  // so Sawa stays in the conversation, asks at once whether anyone is in
  // danger, and the support lines follow its reply. A turn that moves to a
  // stated intention trips `high` on its own words.
  //
  // "kill him / her / them" stays `high` even though it is sometimes a joke:
  // lethal intent toward a named person costs too much to miss. Bare "hurt
  // someone" and "could kill someone" are left out: they catch everyday
  // speech ("hurt someone's feelings", "so angry I could kill someone").

  // High: stated intention, or violence happening.
  { term: "kill him", lang: "en", category: "harm_to_others", tier: high },
  { term: "kill her", lang: "en", category: "harm_to_others", tier: high },
  { term: "kill them", lang: "en", category: "harm_to_others", tier: high },
  { term: "stab", lang: "en", category: "harm_to_others", tier: high },
  { term: "going to hurt someone", lang: "en", category: "harm_to_others", tier: high },
  { term: "going to hurt somebody", lang: "en", category: "harm_to_others", tier: high },
  { term: "gonna hurt someone", lang: "en", category: "harm_to_others", tier: high },
  { term: "going to kill someone", lang: "en", category: "harm_to_others", tier: high },
  { term: "going to kill somebody", lang: "en", category: "harm_to_others", tier: high },
  { term: "gonna kill someone", lang: "en", category: "harm_to_others", tier: high },
  // A stated intention toward a named person ("I'm going to hurt him
  // tonight"). Without these, "hurt him" alone would rate it an urge.
  { term: "going to hurt him", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "going to hurt her", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "going to hurt them", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "gonna hurt him", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "gonna hurt her", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "gonna hurt them", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "will hurt him", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "will hurt her", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "will hurt them", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "ill hurt him", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "ill hurt her", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "ill hurt them", lang: "en", category: "harm_to_others", tier: high, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },

  { term: "kumuua", lang: "sw", category: "harm_to_others", tier: high },
  { term: "kuchoma moto", lang: "sw", category: "harm_to_others", tier: high },
  // Needs the Kiswahili reviewer.
  { term: "nitamuua", lang: "sw", category: "harm_to_others", tier: high },
  { term: "nitamuumiza", lang: "sw", category: "harm_to_others", tier: high },

  // Elevated: an urge, a feeling, or a fear of what one might do.
  { term: "hurt him", lang: "en", category: "harm_to_others", tier: elevated, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "hurt her", lang: "en", category: "harm_to_others", tier: elevated, unlessFollowedBy: ["feelings", "feeling", "pride", "chances"] },
  { term: "want to hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "want to hurt somebody", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "wanna hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "want to kill someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "want to kill somebody", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "wanna kill someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "feel like hurting someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "feel like killing someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "afraid i will hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "scared i will hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "afraid i might hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "scared i might hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "afraid ill hurt someone", lang: "en", category: "harm_to_others", tier: elevated },
  { term: "scared ill hurt someone", lang: "en", category: "harm_to_others", tier: elevated },

  { term: "kumdhuru", lang: "sw", category: "harm_to_others", tier: elevated },
  { term: "kuwadhuru", lang: "sw", category: "harm_to_others", tier: elevated },
  // Needs the Kiswahili reviewer.
  { term: "kumuumiza mtu", lang: "sw", category: "harm_to_others", tier: elevated },
  { term: "kuua mtu", lang: "sw", category: "harm_to_others", tier: elevated },

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
  { term: "was abused", lang: "en", category: "gbv", tier: elevated },
  { term: "abused me", lang: "en", category: "gbv", tier: elevated },
  { term: "being abused", lang: "en", category: "gbv", tier: elevated },

  // Elevated: threats from another person and fear of going home (Sawa AI
  // User Feedback No. 1, benchmark prompts 4 and 5). Both classified `low`
  // before this, so the urgent prompts got no deterministic support line.
  // Kept to phrases that name a threat or a fear of home: "may hurt me" and
  // "will hurt me" are left out because they also describe emotional hurt
  // ("it will hurt me to say goodbye"). Pending the ticket 17 clinical review.
  { term: "threatened to hurt me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatens to hurt me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatening to hurt me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatened to kill me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatens to kill me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatening to kill me", lang: "en", category: "gbv", tier: elevated },
  // A threat with no stated harm ("my partner checks my phone and threatens
  // me"), the plan's controlling-behaviour benchmark prompt.
  { term: "threatens me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatened me", lang: "en", category: "gbv", tier: elevated },
  { term: "threatening me", lang: "en", category: "gbv", tier: elevated },
  { term: "afraid to go home", lang: "en", category: "gbv", tier: elevated, immediate: true },
  { term: "scared to go home", lang: "en", category: "gbv", tier: elevated, immediate: true },
  { term: "frightened to go home", lang: "en", category: "gbv", tier: elevated, immediate: true },
  { term: "afraid of going home", lang: "en", category: "gbv", tier: elevated, immediate: true },
  { term: "scared of going home", lang: "en", category: "gbv", tier: elevated, immediate: true },
  { term: "not safe at home", lang: "en", category: "gbv", tier: elevated, immediate: true },
  { term: "unsafe at home", lang: "en", category: "gbv", tier: elevated, immediate: true },

  { term: "nibakwa", lang: "sw", category: "gbv", tier: elevated },
  { term: "kubakwa", lang: "sw", category: "gbv", tier: elevated },
  { term: "alinibaka", lang: "sw", category: "gbv", tier: elevated },
  { term: "ananibaka", lang: "sw", category: "gbv", tier: elevated },
  { term: "ananipiga", lang: "sw", category: "gbv", tier: elevated },
  { term: "kunipiga", lang: "sw", category: "gbv", tier: elevated },
  { term: "unyanyasaji wa kijinsia", lang: "sw", category: "gbv", tier: elevated },
  { term: "ukatili wa kijinsia", lang: "sw", category: "gbv", tier: elevated },
  { term: "amenilazimisha", lang: "sw", category: "gbv", tier: elevated },
  // Threats and fear of going home, as above. Needs the Kiswahili reviewer.
  { term: "amenitishia", lang: "sw", category: "gbv", tier: elevated },
  { term: "ananitishia", lang: "sw", category: "gbv", tier: elevated },
  { term: "alinitishia", lang: "sw", category: "gbv", tier: elevated },
  { term: "naogopa kurudi nyumbani", lang: "sw", category: "gbv", tier: elevated, immediate: true },
  { term: "naogopa kwenda nyumbani", lang: "sw", category: "gbv", tier: elevated, immediate: true },
  { term: "siko salama nyumbani", lang: "sw", category: "gbv", tier: elevated, immediate: true },

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

  // Inflected forms of the Kiswahili elevated entries (ticket 29).
  { term: "nimepindukia dawa", lang: "sw", category: "substance_crisis", tier: elevated },
  { term: "nalipindukia dawa", lang: "sw", category: "substance_crisis", tier: elevated },
  { term: "nimekubakwa", lang: "sw", category: "gbv", tier: elevated },
  { term: "nimekuwa na washa", lang: "sw", category: "distress", tier: elevated },

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
 * "i'm" is expanded to "i am" before the apostrophe is stripped, because the
 * lexicon's child-safety ages are written "i am 16" and a visitor writes
 * "I'm 16". Stripping the apostrophe alone turns the second into "im 16",
 * which matches nothing, so the age disclosure is missed.
 *
 * Only this one contraction is expanded. The others do not need it: the
 * lexicon lists both the contracted and the expanded form of each ("dont
 * want to live" alongside "do not want to live"), so stripping the
 * apostrophe already leaves a match.
 */
const CONTRACTIONS: readonly (readonly [RegExp, string])[] = [
  [/\bi['\u2019]m\b/gi, "i am"],
];

/*
 * Normalising both the lexicon and the incoming text the same way makes the
 * match apostrophe-insensitive ("cannot" vs "can't"), punctuation-insensitive
 * and whitespace-insensitive, and makes it case-insensitive without a regex
 * per entry. Used for the substring test only, never for anything a user sees.
 */
export function normalise(text: string): string {
  let expanded = text;
  for (const [pattern, replacement] of CONTRACTIONS) {
    expanded = expanded.replace(pattern, replacement);
  }
  return expanded
    .normalize("NFKC")
    .toLowerCase()
    .replace(APOSTROPHES, "")
    .replace(NON_WORD, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const NEEDLES: readonly {
  entry: LexiconEntry;
  needle: string;
  exceptions: readonly string[];
}[] = LEXICON.map((entry) => ({
  entry,
  needle: ` ${normalise(entry.term)} `,
  exceptions: (entry.unlessFollowedBy ?? []).map((word) => `${normalise(word)} `),
}));

export function matchLexicon(text: string): LexiconMatch[] {
  const haystack = ` ${normalise(text)} `;
  const matches: LexiconMatch[] = [];
  for (const { entry, needle, exceptions } of NEEDLES) {
    // Every occurrence is checked: "hurt her feelings ... I will hurt her"
    // must still match on the second one.
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      const after = haystack.slice(index + needle.length);
      if (!exceptions.some((exception) => after.startsWith(exception))) {
        matches.push({ entry, index });
        break;
      }
      index = haystack.indexOf(needle, index + 1);
    }
  }
  return matches;
}
