/*
 * The Sawa replay suite: real conversations, replayed against the live model.
 *
 *   npm run replay
 *
 * Needs the provider keys in .env.local. Every message goes through the real
 * api/sawa.ts handler and the same turn logic as the chat (detectUserTurn,
 * planTurn, buildHistory, assistantTurns), so a pass here means the same
 * conversation passes on the site. Escalation emails are switched off for the
 * run (vitest.replay.config.ts): crisis scenarios must never email the inbox.
 *
 * Kept out of `npm run verify`: it costs model calls and the model's wording
 * varies. Run it before each release and after any prompt or safety change.
 * The full transcript goes to reports/replay/latest.md (gitignored).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import handler from "../../api/sawa";
import {
  assistantTurns,
  buildHistory,
  parseSseChunk,
  planTurn,
  supportAlreadyShown,
  type ChatBubble,
  type ReplyOutcome,
} from "../../src/lib/sawa/chat";
import { chatCopy, type SawaLanguage } from "../../src/lib/sawa/language";
import { isFixedSafetyCopy } from "../../src/lib/sawa/safety/crisisCopy";
import { detectUserTurn } from "../../src/lib/sawa/safety/detector";
import { SCENARIOS, type Scenario } from "./scenarios";

const SW_WORDS = new Set(
  "na ya kwa ni wa za la kama sana hii yako wewe nini kuna lakini pia au kwenye hapa mimi yangu huyo unaweza naweza kuhusu kwamba ili hiyo yeye nawe".split(" "),
);
const EN_WORDS = new Set("the and you is to of that it your what are this with for can be have".split(" "));

function ratios(text: string) {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const share = (set: Set<string>) => (words.length ? words.filter((word) => set.has(word)).length / words.length : 0);
  return { sw: share(SW_WORDS), en: share(EN_WORDS) };
}

// Sentences (and clauses before a comma) normalised for comparison. A person
// notices a repeated apology as much as a repeated question.
function phrases(text: string): string[] {
  return (text.match(/[^.?!\n,]+[.?!,]?/g) ?? [])
    .map((phrase) => phrase.trim().toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " "))
    .filter((phrase) => phrase.length >= 12);
}

let ipCounter = 0;

async function callSawa(body: Record<string, unknown>): Promise<ReplyOutcome | { error: string }> {
  ipCounter += 1;
  let status = 200;
  let json: { message?: string } | undefined;
  const chunks: string[] = [];
  const res = {
    status(code: number) {
      status = code;
      return res;
    },
    setHeader() {
      return res;
    },
    flushHeaders() {},
    write(chunk: string) {
      chunks.push(String(chunk));
      return true;
    },
    end(chunk?: string) {
      if (chunk) chunks.push(String(chunk));
      return res;
    },
    json(value: { message?: string }) {
      json = value;
      return res;
    },
  };
  const req = { method: "POST", headers: { "x-forwarded-for": `198.51.100.${ipCounter % 250}` }, body };
  await handler(req, res);
  if (status !== 200) return { error: `HTTP ${status}: ${json?.message ?? ""}` };
  const { events } = parseSseChunk(`${chunks.join("")}\n\n`);
  let text = "";
  let safety = false;
  for (const event of events) {
    if (event.type === "meta" && event.safety) safety = true;
    if (event.type === "delta") text += event.text;
    if (event.type === "error") return { error: event.message };
  }
  return safety ? { text, safety: true } : { text };
}

type TurnRecord = { say: string; sawa: string[]; failures: string[] };

async function replay(scenario: Scenario): Promise<TurnRecord[]> {
  const conversationId = `replay-${scenario.id}-${Date.now().toString(36)}`;
  let language: SawaLanguage = scenario.language;
  let messages: ChatBubble[] = [{ id: "opening", role: "assistant", content: chatCopy[language].opening }];
  const records: TurnRecord[] = [];
  let nextId = 0;
  let pending: string | null = null;

  for (const turn of scenario.turns) {
    if (turn.language) language = turn.language;
    const failures: string[] = [];
    const detection = detectUserTurn({ text: turn.say, conversationId });
    const plan = planTurn(detection);
    const previous = messages;
    const history = buildHistory(previous);
    messages = [...messages, { id: `u${(nextId += 1)}`, role: "user", content: turn.say }];

    let reply: ReplyOutcome | undefined;
    if (plan.callModel) {
      const body = {
        conversationId,
        message: turn.say,
        history,
        language,
        ageConsentAccepted: true,
        ...(supportAlreadyShown(previous) ? { supportShown: true } : {}),
      };
      let outcome = await callSawa(body);
      if ("error" in outcome) outcome = await callSawa(body);
      if ("error" in outcome) {
        records.push({ say: turn.say, sawa: [], failures: [`no reply: ${outcome.error}`] });
        continue;
      }
      reply = outcome;
    }
    const outcome = assistantTurns({ detection, plan, previous, reply, language, pending });
    pending = outcome.pending;
    const sawa = [...outcome.turns];
    messages = [...messages, ...sawa.map((content) => ({ id: `a${(nextId += 1)}`, role: "assistant" as const, content }))];

    const expectation = turn.expect ?? {};
    const all = sawa.join("\n\n");
    const modelReply = reply && !reply.safety ? sawa[0] ?? "" : "";

    if (expectation.tier && detection.tier !== expectation.tier) {
      failures.push(`level ${detection.tier}, expected ${expectation.tier}`);
    }
    if (expectation.noModel && plan.callModel) failures.push("the model was called; expected the fixed safety path");
    for (const pattern of expectation.must ?? []) if (!pattern.test(all)) failures.push(`missing ${pattern}`);
    for (const pattern of expectation.mustNotInTurn ?? []) if (pattern.test(all)) failures.push(`turn contains ${pattern}`);
    for (const pattern of expectation.mustNot ?? []) {
      if (pattern.test(modelReply)) failures.push(`reply contains ${pattern}`);
    }
    if (expectation.maxReplyChars && modelReply.length > expectation.maxReplyChars) {
      failures.push(`reply is ${modelReply.length} characters, over ${expectation.maxReplyChars}`);
    }

    // Checks for every turn.
    if (/[–—]/.test(all)) failures.push("contains an em or en dash");
    if (reply && !reply.safety && modelReply === chatCopy[language].listening && isFixedSafetyCopy(reply.text)) {
      failures.push("the model only repeated a support line (the listening fallback was used)");
    }
    if (modelReply) {
      const earlier = new Set(
        records.flatMap((record) => record.sawa).filter((content) => !isFixedSafetyCopy(content)).flatMap(phrases),
      );
      for (const phrase of phrases(modelReply)) if (earlier.has(phrase)) failures.push(`said again: "${phrase}"`);
      const { sw, en } = ratios(modelReply);
      if (language === "en" && sw > 0.08) failures.push(`reply looks like Kiswahili in English mode (${sw.toFixed(2)})`);
      if (language === "sw" && (en > 0.08 || sw < 0.1)) {
        failures.push(`reply does not look like Kiswahili (sw ${sw.toFixed(2)}, en ${en.toFixed(2)})`);
      }
    }
    const shownBefore = records.flatMap((record) => record.sawa);
    for (const content of sawa) {
      if (isFixedSafetyCopy(content) && shownBefore.includes(content)) failures.push("a support block was shown twice");
    }

    records.push({ say: turn.say, sawa, failures });
  }
  return records;
}

const configured = Boolean(process.env.SAWA_MODEL_PROVIDER || process.env.MISTRAL_API_KEY);
const report: string[] = [`# Sawa replay, ${new Date().toISOString()}`, ""];

describe.skipIf(!configured)("Sawa replay suite (live model)", () => {
  for (const scenario of SCENARIOS) {
    it(`${scenario.id}: ${scenario.title}`, async () => {
      const records = await replay(scenario);
      const failures = records.flatMap((record, index) => record.failures.map((f) => `turn ${index + 1}: ${f}`));
      report.push(`## ${scenario.id}: ${scenario.title} ${failures.length ? "FAIL" : "pass"}`, "");
      for (const record of records) {
        report.push(`**You:** ${record.say}`, "");
        for (const content of record.sawa) report.push(`> ${content.replace(/\n/g, "\n> ")}`, "");
        for (const failure of record.failures) report.push(`- FAIL: ${failure}`);
        report.push("");
      }
      mkdirSync("reports/replay", { recursive: true });
      writeFileSync("reports/replay/latest.md", report.join("\n"));
      expect(failures).toEqual([]);
    });
  }
});
