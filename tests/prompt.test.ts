import { describe, expect, it } from "vitest";

import { CRISIS_RESOURCES } from "../src/lib/sawa/safety/crisisCopy";
import {
  PROMPT_VERSION,
  promptFor,
  promptV1,
  promptVersion,
} from "../src/lib/sawa/prompt";

/*
 * Ticket 15: the versioned system prompt. These are structural assertions on
 * the reviewable artefact, not an adversarial model run - the safety
 * behaviours themselves are exercised in ticket 17's harness.
 */

describe("Sawa prompt", () => {
  it("stamps the graded risk-to-others prompt as version 1.7", () => {
    expect(promptVersion).toBe("1.7");
    expect(PROMPT_VERSION).toBe("1.7");
    expect(promptVersion).toBe(PROMPT_VERSION);
  });

  it("is a non-empty reviewable string", () => {
    expect(typeof promptV1).toBe("string");
    expect(promptV1.length).toBeGreaterThan(400);
  });

  it("carries the section 11 thesis line", () => {
    expect(promptV1).toContain(
      "AI identifies patterns. Humans provide context. People make decisions."
    );
  });

  it("states the boundaries: no therapist, no diagnosis, no medication", () => {
    expect(promptV1).toContain("not a therapist");
    expect(promptV1.toLowerCase()).toContain("never diagnose");
    expect(promptV1.toLowerCase()).toContain("never prescribe");
  });

  it("handles the name-condition trap while staying warm", () => {
    expect(promptV1).toContain("do you think I have depression?");
    expect(promptV1).toContain("Akili Sawa cannot diagnose");
  });

  it("points at the verified crisis list and forbids inventing resources", () => {
    expect(promptV1).toContain("docs/adr/crisis-resources-v1.md");
    expect(promptV1.toLowerCase()).toContain("never invent a resource");
  });

  it("encodes the voice split and section 67 constraints", () => {
    expect(promptV1).toContain("Akili Sawa");
    expect(promptV1).toContain('speak as "I"');
    expect(promptV1).toContain("SECTION 67");
    expect(promptV1).toContain("Safety first");
  });

  it("offers reflection, next-step planning and support navigation", () => {
    expect(promptV1).toContain("reflect on what is happening");
    expect(promptV1).toContain("plan a manageable next step");
    expect(promptV1).toContain("explore suitable support options");
  });

  it("encodes what the pages promise: no account, transcript held in this browser", () => {
    expect(promptV1).toContain("no account and no sign-in");
    expect(promptV1).toContain("held in this browser rather than on our servers");
  });

  /*
   * The prompt and the page have to agree (ticket 28). The old line told
   * the model to say accounts "are not available", which the /sawa-ai
   * access levels contradicted. The model now says Sawa is available to
   * talk to now and points an account question at the contact page.
   */
  it("agrees with the page that Sawa is available to talk to now", () => {
    expect(promptV1).toContain("Sawa is available to talk to now");
    expect(promptV1).toContain("register their interest through the contact page");
  });

  it("does not tell the model to call the product unavailable", () => {
    expect(promptV1).not.toContain(
      "Sawa accounts, history, check-ins and follow-ups are not available"
    );
    expect(promptV1.toLowerCase()).not.toContain("are not available");
  });

  it("encodes the §67 privacy and human-review disclosures verbatim in substance", () => {
    expect(promptV1).toContain("Messages are sent to the configured AI provider to generate a reply");
    expect(promptV1).toContain("not monitored for emergencies");
    expect(promptV1).toContain("aggregated insight only, never private conversations");
  });

  it("carries the 18-and-over access level and the Child Helpline line", () => {
    expect(promptV1).toContain("adults aged 18 and over");
    expect(promptV1).toContain("116");
    expect(promptV1).toContain("trusted adult");
  });

  it("graduated the safety response by moment rather than by topic", () => {
    expect(promptV1).toContain("RESPONSE LADDER");
    expect(promptV1).toContain("answer the practical question first");
    expect(promptV1).toContain("Past abuse does not by itself mean current danger");
    expect(promptV1).toContain("Do not tell someone to stay in or leave a relationship");
    expect(promptV1).toContain("do not replace, shorten or add to the crisis block");
  });

  it("covers the clinical team's five scenarios and the conversational order", () => {
    expect(promptV1).toContain("When the situation is unclear");
    expect(promptV1).toContain("controlling or threatening behaviour");
    expect(promptV1).toContain("possible immediate danger");
    expect(promptV1).toContain("a stated intention to harm another person");
    expect(promptV1).toContain("acknowledge what they are going through");
    expect(promptV1).toContain("Do not withhold help until they answer");
    expect(promptV1).toContain("Do not give emergency numbers when no emergency has been indicated");
  });

  it("answers a first message that already asks a question", () => {
    expect(promptV1).toContain("If the first message already asks a question, answer that question");
    expect(promptV1).toContain("continue open-endedly past a high-severity safety signal");
  });

  it("uses the board-approved 'may be sent' wording for the support inbox", () => {
    expect(promptV1).toContain("the flagged message may be sent to Akili Sawa's designated support inbox");
    expect(promptV1).not.toContain("the flagged message is sent");
  });

  it("narrows the emergency boundary without forbidding practical safety help", () => {
    expect(promptV1).toContain("act as an emergency dispatcher");
    expect(promptV1).not.toContain("personal emergency instructions");
  });

  it("replies in the visitor's chosen language instead of mirroring theirs", () => {
    expect(promptV1).not.toContain("Answer in the language the person writes in");
    expect(promptV1).not.toContain("natural mix");
    expect(promptV1).toContain("Reply in that language only");

    const english = promptFor("en");
    expect(english.startsWith(promptV1)).toBe(true);
    expect(english).toContain("The visitor chose English");
    expect(english).toContain("no Kiswahili or Sheng");
    expect(english).not.toContain("The visitor chose Kiswahili");

    const kiswahili = promptFor("sw");
    expect(kiswahili).toContain("The visitor chose Kiswahili");
    expect(kiswahili).toContain("no English sentences or clauses");
    expect(promptFor()).toBe(english);
  });

  it("asks for everyday Kenyan Kiswahili, not Kiswahili sanifu", () => {
    expect(promptV1).toContain("Not Kiswahili sanifu");
    expect(promptV1).toContain("Sheng");
    expect(promptV1).toContain("Niaje, nafeel down sana kwa job");
  });

  it("rules out crude, regional, over-familiar and religious wording", () => {
    expect(promptV1).toContain("over-familiar ways of addressing the person, such as maze, bro or msee");
    expect(promptV1).toContain("Mungu akubariki");
    // The register example must follow its own rule.
    expect(promptV1).not.toContain("Pole sana, maze");
  });

  it("stays with someone who has an urge to hurt someone, and asks about danger at once", () => {
    expect(promptV1).toContain("saying it out loud is a reason to stay, not to stop");
    expect(promptV1).toContain("Ask directly whether anyone is in danger right now, then ask what happened");
    expect(promptV1).toContain("Keep the reply short, two or three sentences");
    expect(promptV1).toContain("Do not list phone numbers");
    expect(promptV1).toContain("Never repeat a support line, a crisis message or a list of numbers yourself");
    expect(promptV1).toContain("they are telling you they do not feel heard");
    expect(promptV1).toContain("a stated intention to harm another person");
  });

  it("asks for a human conversation in every situation, not a script", () => {
    expect(promptV1).toContain("HOW TO SOUND");
    expect(promptV1).toContain("never the same question twice");
    expect(promptV1).toContain("Do not repeat disclaimers, safety checks, support lines or numbers");
    expect(promptV1).toContain("Copy that feel, never the exact words.");
    expect(promptV1).toContain("Never say the conversation stays only in the browser");
    expect(promptV1).toContain("Never reuse a sentence from earlier in the conversation");
  });

  it("forbids em and en dashes, and itself contains none", () => {
    expect(promptV1).toContain("Never use an em dash or an en dash");
    expect(promptFor("en")).not.toMatch(/[\u2013\u2014]/);
    expect(promptFor("sw")).not.toMatch(/[\u2013\u2014]/);
  });

  it("renders every verified support line from the safety pipeline's own list", () => {
    for (const resource of CRISIS_RESOURCES) {
      expect(promptV1).toContain(resource.phone);
    }
    expect(promptV1).toContain("Befrienders Kenya");
    expect(promptV1).toContain("Monday to Friday");
  });

  it("keeps house style: no exclamation marks and no emoji", () => {
    expect(promptV1).not.toMatch(/!|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it("tells Sawa the transcript is plain text, so no markdown is emitted", () => {
    expect(promptV1).toContain("plain text");
    expect(promptV1).toContain("no markdown");
  });

  it("contains no secrets or key material", () => {
    expect(promptV1).not.toMatch(/sk-[A-Za-z0-9]|api[_-]?key|bearer\s/i);
  });
});
