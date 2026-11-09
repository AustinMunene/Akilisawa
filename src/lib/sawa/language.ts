/*
 * Scoped language support for Sawa. This is deliberately not a site-wide i18n
 * layer: the feedback was about a single surface mixing English and Kiswahili
 * in the same paragraph, so the preference lives with Sawa and nowhere else.
 *
 * The preference is a convenience, not a privacy record. It is stored in
 * localStorage so it survives a tab close, and every read and write degrades to
 * English without throwing when storage is blocked. With nothing stored, a
 * browser set to Kiswahili starts in Kiswahili; everything else starts in
 * English.
 */

export type SawaLanguage = "en" | "sw";

export const SAWA_LANGUAGE_KEY = "sawa.language.v1";

export type SawaLanguageStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function isSawaLanguage(value: unknown): value is SawaLanguage {
  return value === "en" || value === "sw";
}

function resolveStorage(): SawaLanguageStorage | null {
  try {
    return (globalThis as { localStorage?: SawaLanguageStorage }).localStorage ?? null;
  } catch {
    return null;
  }
}

function resolveBrowserLanguages(): readonly string[] {
  try {
    const nav = (globalThis as {
      navigator?: { languages?: readonly string[]; language?: string };
    }).navigator;
    if (!nav) return [];
    if (nav.languages && nav.languages.length > 0) return nav.languages;
    return nav.language ? [nav.language] : [];
  } catch {
    return [];
  }
}

/** The language to start in when nothing valid is stored. */
export function defaultSawaLanguage(
  browserLanguages: readonly string[] = resolveBrowserLanguages()
): SawaLanguage {
  const preferred = browserLanguages[0]?.toLowerCase() ?? "";
  return preferred === "sw" || preferred.startsWith("sw-") ? "sw" : "en";
}

export function readSawaLanguage(
  storage: SawaLanguageStorage | null = resolveStorage(),
  browserLanguages?: readonly string[]
): SawaLanguage {
  const fallback = defaultSawaLanguage(browserLanguages);
  if (!storage) return fallback;
  try {
    const stored = storage.getItem(SAWA_LANGUAGE_KEY);
    return isSawaLanguage(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function writeSawaLanguage(
  language: SawaLanguage,
  storage: SawaLanguageStorage | null = resolveStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(SAWA_LANGUAGE_KEY, language);
  } catch {
    // The choice still applies for this page view.
  }
}

export type SawaGateCopy = {
  readonly before: string;
  readonly title: string;
  readonly intro: string;
  readonly safety: string;
  readonly dateOfBirth: string;
  readonly dateOfBirthHelp: string;
  readonly day: string;
  readonly month: string;
  readonly year: string;
  readonly months: readonly string[];
  readonly consentPrefix: string;
  readonly privacyLabel: string;
  readonly consentSuffix: string;
  readonly ageError: string;
  readonly consentError: string;
  readonly submit: string;
};

export const gateCopy: Readonly<Record<SawaLanguage, SawaGateCopy>> = {
  en: {
    before: "Before you begin",
    title: "A conversation for adults",
    intro:
      "Sawa AI is a non-clinical wellbeing companion. It is not a therapist, medical professional or emergency service. Your conversations may be processed by the AI provider to generate responses. Your date of birth is checked in this browser only; it is not sent to the server or saved.",
    safety:
      "If a high-severity safety concern is detected, the message that raised it may be sent to Akili Sawa's designated support inbox. Email retention depends on that inbox's settings. The service is not monitored for emergencies and cannot guarantee an immediate response.",
    dateOfBirth: "Date of birth",
    dateOfBirthHelp:
      "Select the day, month and year. This is checked in your browser only.",
    day: "Day",
    month: "Month",
    year: "Year",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    consentPrefix:
      "I am 18 or over, understand Sawa AI is not professional or emergency care, understand the safety excerpt notice above, and agree to continue. I have read the ",
    privacyLabel: "Privacy notice",
    consentSuffix: ".",
    ageError: "Sawa AI is available to adults aged 18 and over.",
    consentError: "Please confirm that you understand the limits of this service.",
    submit: "Continue",
  },
  sw: {
    before: "Kabla ya kuanza",
    title: "Mazungumzo ya watu wazima",
    intro:
      "Sawa AI ni msaidizi wa ustawi wa akili usiotoa huduma za kitabibu. Si mtaalamu wa tiba, daktari wala huduma ya dharura. Mazungumzo yako yanaweza kuchakatwa na mtoa huduma wa AI ili kutoa majibu. Tarehe yako ya kuzaliwa inakaguliwa kwenye kivinjari hiki pekee; haitumwi kwa seva wala kuhifadhiwa.",
    safety:
      "Ikiwa mfumo utagundua hatari kubwa ya usalama, ujumbe ulioibua wasiwasi huo unaweza kutumwa kwenye kisanduku maalum cha usaidizi cha Akili Sawa. Muda wa kuhifadhi barua pepe hutegemea mipangilio ya kisanduku hicho. Huduma hii haifuatiliwi kwa dharura na haiwezi kuhakikisha jibu la haraka.",
    dateOfBirth: "Tarehe ya kuzaliwa",
    dateOfBirthHelp:
      "Chagua siku, mwezi na mwaka. Hii inakaguliwa kwenye kivinjari chako pekee.",
    day: "Siku",
    month: "Mwezi",
    year: "Mwaka",
    months: [
      "Januari",
      "Februari",
      "Machi",
      "Aprili",
      "Mei",
      "Juni",
      "Julai",
      "Agosti",
      "Septemba",
      "Oktoba",
      "Novemba",
      "Desemba",
    ],
    consentPrefix:
      "Nina miaka 18 au zaidi, nimeelewa kuwa Sawa AI si huduma ya kitaalamu wala ya dharura, nimeelewa taarifa ya kipande cha ujumbe wa usalama hapo juu, na ninakubali kuendelea. Nimesoma ",
    privacyLabel: "Ilani ya Faragha",
    consentSuffix: ".",
    ageError: "Sawa AI inapatikana kwa watu wazima wenye umri wa miaka 18 na zaidi.",
    consentError: "Tafadhali thibitisha kuwa umeelewa mipaka ya huduma hii.",
    submit: "Endelea",
  },
};

export type SawaChatCopy = {
  readonly opening: string;
  readonly startingOptions: readonly string[];
  readonly startingOptionsLabel: string;
  readonly conversationLabel: string;
  readonly partialReply: string;
  readonly degraded: string;
  readonly retry: string;
  readonly messageLabel: string;
  readonly placeholder: string;
  readonly stop: string;
  readonly send: string;
  readonly genericError: string;
  readonly turnCapFallback: string;
  /** Shown in place of the server's English cap copy when Kiswahili is chosen. */
  readonly limitReached: string;
  readonly thinking: string;
  readonly stillThinking: string;
  readonly clear: string;
  readonly clearConfirm: string;
  readonly clearConfirmYes: string;
  readonly clearConfirmNo: string;
  readonly cleared: string;
  /** Under the composer on the full-screen chat. */
  readonly footnote: string;
  /** The full-screen chat's way back to /sawa-ai. */
  readonly leave: string;
  readonly title: string;
  /** SawaLauncher: the button that opens the full-screen chat. */
  readonly launchLabel: string;
  readonly continueLabel: string;
  readonly streamTruncated: string;
  readonly streamTimeout: string;
  readonly decline: string;
  readonly refusal: string;
};

export const chatCopy: Readonly<Record<SawaLanguage, SawaChatCopy>> = {
  en: {
    opening: "Hi, I'm Sawa. What's on your mind today?",
    startingOptions: [
      "Help me make sense of a concern",
      "Help me plan a next step",
      "What support options could suit me?",
      "What can you help me with?",
    ],
    startingOptionsLabel: "Ways Sawa can help",
    conversationLabel: "Conversation with Sawa",
    partialReply: "Reply stopped early.",
    degraded:
      "Akili Sawa cannot save this conversation to your browser right now. It is held in memory for this tab only.",
    retry: "Try again",
    messageLabel: "Your message",
    placeholder: "Type your message...",
    stop: "Stop",
    send: "Send",
    genericError: "Sawa is unavailable right now. Please try again.",
    turnCapFallback:
      "This conversation has reached its turn limit. Your transcript stays in this browser; you can begin a new conversation whenever you like.",
    limitReached:
      "Sawa has reached its message limit for now. You can start a new conversation, or try again later.",
    thinking: "Sawa is thinking",
    stillThinking: "Still working on a reply",
    clear: "Clear conversation",
    clearConfirm:
      "Clear this conversation? It is removed from this browser tab and cannot be brought back.",
    clearConfirmYes: "Clear",
    clearConfirmNo: "Keep it",
    cleared: "Conversation cleared.",
    footnote:
      "Sawa is not a therapist or a crisis service. In an emergency, call 999 or 112.",
    leave: "Leave",
    title: "Sawa AI",
    launchLabel: "Start",
    continueLabel: "Continue your conversation",
    streamTruncated: "The reply stopped early. You can try again to continue.",
    streamTimeout:
      "Sawa stopped responding. Your message is saved here; you can try again.",
    decline:
      "Akili Sawa cannot continue with that message. I can stay with you if you would like to talk about what is on your mind.",
    refusal:
      "Akili Sawa cannot offer diagnoses or advice on medication. I can stay with you and help you think about what might help next.",
  },
  sw: {
    opening: "Sasa, mimi ni Sawa. Kuna kitu ungependa tuongee leo?",
    startingOptions: [
      "Nisaidie kuelewa kitu kinanisumbua",
      "Nisaidie kupanga next step",
      "Ni support gani inaweza kunifaa?",
      "Unaweza kunisaidia na nini?",
    ],
    startingOptionsLabel: "Njia Sawa anaweza kukusaidia",
    conversationLabel: "Chat na Sawa",
    partialReply: "Jibu lilikatika.",
    degraded:
      "Akili Sawa haiwezi kusave hii chat kwa browser yako saa hii. Iko kwa memory ya hii tab pekee.",
    retry: "Jaribu tena",
    messageLabel: "Ujumbe wako",
    placeholder: "Andika hapa...",
    stop: "Simamisha",
    send: "Tuma",
    genericError: "Sawa hapatikani saa hii. Tafadhali jaribu tena.",
    turnCapFallback:
      "Hii chat imefika limit ya zamu. Chat yako inabaki kwa hii browser; unaweza kuanza chat mpya wakati wowote.",
    limitReached:
      "Sawa imefika limit ya messages kwa sasa. Unaweza kuanza chat mpya, ama ujaribu tena baadaye kidogo.",
    thinking: "Sawa anafikiria",
    stillThinking: "Bado anaandika jibu, ngoja kidogo",
    clear: "Futa chat",
    clearConfirm: "Ufute hii chat? Itatoka kwa hii tab na haiwezi kurudi.",
    clearConfirmYes: "Futa",
    clearConfirmNo: "Hapana, iwache",
    cleared: "Chat imefutwa.",
    footnote: "Sawa si therapist wala huduma ya dharura. Kwa dharura, piga 999 au 112.",
    leave: "Toka",
    title: "Sawa AI",
    launchLabel: "Anza",
    continueLabel: "Endelea na chat yako",
    streamTruncated: "Jibu lilisimama mapema. Jaribu tena ili liendelee.",
    streamTimeout:
      "Sawa ameacha kujibu. Ujumbe wako bado uko hapa; unaweza kujaribu tena.",
    decline:
      "Akili Sawa haiwezi kuendelea na huo ujumbe. Lakini niko hapa kama ungependa tuongee kuhusu kile kiko kwa akili yako.",
    refusal:
      "Akili Sawa haiwezi kukupa diagnosis au ushauri wa dawa. Lakini niko hapa kukusaidia kufikiria kitu kinaweza kusaidia."
  },
};

export function openingLine(language: SawaLanguage = "en"): string {
  return chatCopy[language].opening;
}

export function messageTooLong(language: SawaLanguage, maxChars: number): string {
  return language === "sw"
    ? `Ujumbe unaweza kuwa na herufi ${maxChars} kwa kiwango cha juu. Tafadhali ufupishe na ujaribu tena.`
    : `A message can be up to ${maxChars} characters. Please shorten this one and try again.`;
}

/*
 * The Sawa AI section of /privacy (Sawa AI User Feedback No. 1, issue 2).
 *
 * The summary is the replacement copy written by the therapy and board team,
 * kept as written. The detail answers the four questions the brief asks for,
 * and every claim in it was checked against the code on 3 November 2026:
 * sessionStorage transcript (src/lib/sawa/store.ts), no server transcript or
 * logging (api/sawa.ts), a 500-character excerpt and a random conversation id
 * in the escalation email (api/_sawaEscalation.ts), and an in-memory per-IP
 * message count for rate limiting (api/sawa.ts).
 *
 * The Kiswahili detail is a draft and needs the Kiswahili reviewer before
 * release; the age gate's opening disclaimer reuses the brief's own Kiswahili.
 */

export type SawaPrivacyBlock = {
  readonly heading: string;
  readonly body: readonly string[];
};

export type SawaPrivacyQuestion = SawaPrivacyBlock & { readonly id: string };

export type SawaPrivacyCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly summary: readonly SawaPrivacyBlock[];
  readonly noticeLink: string;
  readonly escalationLink: string;
  readonly questionsTitle: string;
  readonly questions: readonly SawaPrivacyQuestion[];
  readonly emergency: string;
};

/*
 * The Kiswahili privacy copy is a legal statement and has not had its native
 * review yet (Kiswahili decisions, 9 November). Until it has, the Kiswahili
 * view of the Sawa privacy section shows the English text under a one-line
 * Kiswahili note. `privacyCopy.sw` stays here, aligned, for the reviewer.
 * Flip this to true when the review is done.
 */
export const SW_PRIVACY_REVIEWED = false;

export const SW_PRIVACY_PENDING_NOTE =
  "Toleo la Kiswahili la sehemu hii bado linakaguliwa. Kwa sasa, maelezo kamili yako kwa Kiingereza hapa chini.";

export const privacyCopy: Readonly<Record<SawaLanguage, SawaPrivacyCopy>> = {
  en: {
    eyebrow: "Sawa AI",
    title: "Your privacy matters",
    intro:
      "Akili Sawa is designed to give you a space to reflect on your wellbeing and explore concerns without having to share more personal information than necessary.",
    summary: [
      {
        heading: "How your conversations are handled",
        body: [
          "Your conversation transcript is held in your browser. Your messages are also sent to the AI provider configured for Sawa AI to generate responses. Please consult our Privacy Notice for details about the provider and its data-handling practices.",
        ],
      },
      {
        heading: "When additional safety support may be needed",
        body: [
          "If a message triggers a high-severity safety signal, the flagged message may be sent to Akili Sawa's designated support inbox for review. The retention of that email depends on the inbox's settings.",
        ],
      },
      {
        heading: "What you should know",
        body: [
          "Sawa AI is not continuously monitored for emergencies and cannot guarantee an immediate response. Please review our Privacy Notice to understand the applicable safeguards, data handling and retention arrangements before sharing sensitive information.",
        ],
      },
    ],
    noticeLink: "Read our Privacy Notice",
    escalationLink: "Understand safety escalation",
    questionsTitle: "Your questions, answered",
    questions: [
      {
        id: "sawa-collected",
        heading: "What information is collected?",
        body: [
          "The messages you type and Sawa's replies. They are held in this browser tab, not in an account on our servers.",
          "Your date of birth is checked in your browser and is not sent or saved. The tab records only that you completed the age and consent steps.",
          "There is no account, so we do not ask for your name, email address or phone number. Your language choice is saved in this browser.",
        ],
      },
      {
        id: "sawa-processed",
        heading: "Who or what processes my messages?",
        body: [
          "To generate a reply, your message and recent conversation history are sent through Akili Sawa's server to the AI provider configured for Sawa AI. Our server passes them on and does not keep a copy of the conversation.",
          "The provider's own privacy terms, processing location and retention periods apply. Current provider details are available on request through the Contact page.",
          "To limit misuse, our server keeps a short-lived count of messages from your network address. The count is not linked to what you wrote.",
        ],
      },
      {
        id: "safety-escalation",
        heading: "When might a message be shared with the Akili Sawa support team?",
        body: [
          "Only when a message shows a high-severity safety signal, such as active suicidal intent, self-harm or a risk of harm to someone else. Sawa then shows crisis support lines straight away.",
          "The message that raised the concern, up to 500 characters, may be emailed to Akili Sawa's designated support inbox for human review, with a random conversation reference. The rest of the conversation is not sent, and we have no name or contact details to send.",
          "The inbox is not monitored for emergencies and no immediate response is guaranteed. Akili Sawa cannot call emergency services for you.",
        ],
      },
      {
        id: "sawa-retention",
        heading: "How long is information retained, and what control do I have over it?",
        body: [
          "In your browser, the conversation stays until you close the tab, and closing the tab clears it. Your language choice stays until you clear this site's data.",
          "With the AI provider, retention follows the provider's terms. In the support inbox, a flagged email is kept according to that inbox's settings.",
          "You choose what to share, and you can ask about or request deletion of data we hold through the Contact page.",
        ],
      },
    ],
    emergency:
      "Sawa AI is not an emergency service. If you need urgent help, contact local emergency services or a trusted healthcare provider.",
  },
  sw: {
    eyebrow: "Sawa AI",
    title: "Faragha yako ni muhimu",
    intro:
      "Akili Sawa imeundwa kukupa nafasi ya kutafakari kuhusu ustawi wako na kuchunguza wasiwasi wako bila kulazimika kushiriki taarifa binafsi zaidi ya zinazohitajika.",
    summary: [
      {
        heading: "Jinsi mazungumzo yako yanavyoshughulikiwa",
        body: [
          "Nakala ya mazungumzo yako inahifadhiwa kwenye kivinjari chako. Ujumbe wako pia hutumwa kwa mtoa huduma wa AI aliyewekwa kwa ajili ya Sawa AI ili kutoa majibu. Tafadhali soma Ilani yetu ya Faragha kwa maelezo kuhusu mtoa huduma huyo na jinsi anavyoshughulikia data.",
        ],
      },
      {
        heading: "Wakati msaada wa ziada wa usalama unaweza kuhitajika",
        body: [
          "Ikiwa ujumbe utaonyesha ishara ya hatari kubwa ya usalama, ujumbe huo unaweza kutumwa kwenye kisanduku maalum cha usaidizi cha Akili Sawa ili ukaguliwe. Muda wa kuhifadhi barua pepe hiyo hutegemea mipangilio ya kisanduku hicho.",
        ],
      },
      {
        heading: "Unachopaswa kujua",
        body: [
          "Sawa AI haifuatiliwi muda wote kwa ajili ya dharura na haiwezi kuhakikisha jibu la haraka. Tafadhali soma Ilani yetu ya Faragha ili kuelewa kinga, ushughulikiaji wa data na muda wa kuhifadhi kabla ya kushiriki taarifa nyeti.",
        ],
      },
    ],
    noticeLink: "Soma Ilani yetu ya Faragha",
    escalationLink: "Elewa jinsi masuala ya usalama yanavyoshughulikiwa",
    questionsTitle: "Majibu ya maswali yako",
    questions: [
      {
        id: "sawa-collected",
        heading: "Ni taarifa gani zinakusanywa?",
        body: [
          "Ujumbe unaoandika na majibu ya Sawa. Vinahifadhiwa kwenye kichupo hiki cha kivinjari, si kwenye akaunti kwenye seva zetu.",
          "Tarehe yako ya kuzaliwa inakaguliwa kwenye kivinjari chako na haitumwi wala kuhifadhiwa. Kichupo kinahifadhi tu kwamba ulikamilisha hatua za umri na ridhaa.",
          "Hakuna akaunti, kwa hivyo hatuombi jina lako, barua pepe wala nambari ya simu. Lugha uliyochagua inahifadhiwa kwenye kivinjari hiki.",
        ],
      },
      {
        id: "sawa-processed",
        heading: "Ni nani au nini kinachoshughulikia ujumbe wangu?",
        body: [
          "Ili kutoa jibu, ujumbe wako na sehemu ya mazungumzo ya hivi karibuni hutumwa kupitia seva ya Akili Sawa kwa mtoa huduma wa AI aliyewekwa kwa ajili ya Sawa AI. Seva yetu inaupitisha tu na haihifadhi nakala ya mazungumzo.",
          "Masharti ya faragha ya mtoa huduma huyo, mahali anaposhughulikia data na muda wa kuhifadhi ndiyo yanayotumika. Maelezo ya mtoa huduma wa sasa yanapatikana ukiomba kupitia ukurasa wa Mawasiliano.",
          "Ili kuzuia matumizi mabaya, seva yetu huhifadhi kwa muda mfupi idadi ya ujumbe kutoka kwa anwani ya mtandao wako. Idadi hiyo haihusishwi na ulichoandika.",
        ],
      },
      {
        id: "safety-escalation",
        heading: "Ni lini ujumbe unaweza kushirikiwa na timu ya usaidizi ya Akili Sawa?",
        body: [
          "Ni pale tu ujumbe unapoonyesha ishara ya hatari kubwa ya usalama, kama nia ya kujiua, kujidhuru au hatari ya kumdhuru mtu mwingine. Sawa huonyesha nambari za msaada wa dharura mara moja.",
          "Ujumbe ulioibua wasiwasi huo, hadi herufi 500, unaweza kutumwa kwa barua pepe kwenye kisanduku maalum cha usaidizi cha Akili Sawa ili ukaguliwe na mtu, pamoja na nambari ya kumbukumbu ya mazungumzo iliyotengenezwa bila mpangilio. Sehemu nyingine ya mazungumzo haitumwi, na hatuna jina wala maelezo yako ya mawasiliano ya kutuma.",
          "Kisanduku hicho hakifuatiliwi kwa ajili ya dharura na hakuna uhakika wa jibu la haraka. Akili Sawa haiwezi kupiga simu kwa huduma za dharura kwa niaba yako.",
        ],
      },
      {
        id: "sawa-retention",
        heading: "Taarifa huhifadhiwa kwa muda gani, na nina udhibiti gani juu yake?",
        body: [
          "Kwenye kivinjari chako, mazungumzo hubaki hadi utakapofunga kichupo, na kufunga kichupo huyafuta. Lugha uliyochagua hubaki hadi utakapofuta data ya tovuti hii.",
          "Kwa mtoa huduma wa AI, muda wa kuhifadhi hufuata masharti yake. Kwenye kisanduku cha usaidizi, barua pepe iliyotumwa huhifadhiwa kulingana na mipangilio ya kisanduku hicho.",
          "Wewe ndiye unayechagua unachoshiriki, na unaweza kuuliza kuhusu data tunayohifadhi au kuomba ifutwe kupitia ukurasa wa Mawasiliano.",
        ],
      },
    ],
    emergency:
      "Sawa AI si huduma ya dharura. Ikiwa unahitaji msaada wa haraka, wasiliana na huduma za dharura zilizo karibu nawe au mtoa huduma za afya unayemwamini.",
  },
};
