import { describe, expect, it } from "vitest";

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

describe("prompt v1", () => {
  it("stamps the version as 1.0", () => {
    expect(promptVersion).toBe("1.0");
    expect(PROMPT_VERSION).toBe("1.0");
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

  it("keeps house style: no exclamation marks and no emoji", () => {
    expect(promptV1).not.toMatch(/!|[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it("contains no secrets or key material", () => {
    expect(promptV1).not.toMatch(/sk-[A-Za-z0-9]|api[_-]?key|bearer\s/i);
  });
});
