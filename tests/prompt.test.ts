import { describe, expect, it } from "vitest";

import { CRISIS_RESOURCES } from "../src/lib/sawa/safety/crisisCopy";
import {
  PROMPT_VERSION,
  promptV1,
  promptVersion,
} from "../src/lib/sawa/prompt";

/*
 * Ticket 15: the versioned system prompt. These are structural assertions on
 * the reviewable artefact, not an adversarial model run - the safety
 * behaviours themselves are exercised in ticket 17's harness.
 */

describe("Sawa prompt", () => {
  it("stamps the website-rules production prompt as version 1.2", () => {
    expect(promptVersion).toBe("1.2");
    expect(PROMPT_VERSION).toBe("1.2");
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
    expect(promptV1).toContain("Sawa accounts, history, check-ins and follow-ups are not available");
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

  it("answers in the language the person writes in, Kiswahili included", () => {
    expect(promptV1).toContain("Kiswahili included");
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
