import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SawaAi from "../src/pages/SawaAi";

/*
 * Render-level smoke tests for the /sawa-ai page shell (ticket 10).
 *
 * `renderToStaticMarkup` runs in the default node environment without a DOM, so
 * no jsdom or testing-library is introduced. React escapes apostrophes in text
 * to `&#x27;`, so the helper below restores them before the copy assertions.
 */

const render = () =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(SawaAi))
  ).replace(/&#x27;/g, "'");

describe("SawaAi page", () => {
  it("carries the §8 hero verbatim", () => {
    const html = render();
    expect(html).toContain("Meet Sawa AI.");
    expect(html).toContain("A conversation can be a place to start.");
    expect(html).toContain(
      "Sawa AI is Akili Sawa's AI-powered wellbeing companion"
    );
    expect(html).toContain("Talk to Sawa AI");
  });

  it("renders the opening line verbatim", () => {
    expect(render()).toContain("Hi, I'm Sawa. What's on your mind today?");
  });

  it("keeps the non-clinical disclaimer in the house third person", () => {
    const html = render();
    expect(html).toContain("Akili Sawa is not a therapist, clinician or crisis service.");
  });

  it("renders the three §10 access levels, marking only Level 1 as available", () => {
    const html = render();
    expect(html).toContain("Three ways to use Sawa");
    expect(html).toContain("Level 1");
    expect(html).toContain("Level 2");
    expect(html).toContain("Level 3");
    expect(html).toContain("Available now");
    expect(html.match(/Not available yet/g)?.length).toBe(2);
  });

  it("routes the account CTA to /contact as waitlist capture, not a stub form", () => {
    const html = render();
    expect(html).toContain("Create your Sawa account");
    expect(html).toContain("/contact?reason=sawa-account-waitlist");
  });

  it("keeps the institutional copy free of surveillance implications", () => {
    const html = render();
    expect(html).toContain(
      "Institutions see aggregate insight, never private conversations."
    );
  });

  it("renders the §13 capability-boundary band with the thesis verbatim", () => {
    const html = render();
    expect(html).toContain("What Sawa can and cannot do");
    expect(html).toContain(
      "AI identifies patterns. Humans provide context. People make decisions."
    );
    expect(html).toContain(
      "Akili Sawa cannot diagnose, treat or prescribe medication"
    );
  });

  it("renders the §13 six-step safety-flow strip as pill chips", () => {
    const html = render();
    for (const step of ["Conversation", "Signal detection", "Safety rules", "Triage", "Human support", "Follow-up"]) {
      expect(html).toContain(step);
    }
  });

  it("keeps the safety copy honest: mechanism, not a live readout", () => {
    const html = render();
    expect(html).toContain("not a live readout of this conversation");
    expect(html).toContain(
      "the conversation is routed for human follow-up rather than continued open-endedly"
    );
    expect(html).toContain("Akili Sawa does not call on your behalf");
  });

  it("explains the transcript lives in the browser and links to /privacy", () => {
    const html = render();
    expect(html).toContain("Your conversation is held in this browser");
    expect(html).toContain("Read about privacy");
    expect(html).toContain('href="/privacy"');
  });
});
