import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Home from "../src/pages/Home";

/*
 * Render-level smoke tests for the Home §3 Sawa embed (ticket 21).
 *
 * `renderToStaticMarkup` runs in the default node environment without a DOM, so
 * no jsdom or testing-library is introduced. React escapes apostrophes in text
 * to `&#x27;`, so the helper below restores them before the copy assertions.
 */

const render = () =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Home))).replace(
    /&#x27;/g,
    "'"
  );

describe("Home page", () => {
  it("mounts the live Sawa chat in the §3 band", () => {
    const html = render();
    expect(html).toContain("Talk to Sawa");
    expect(html).toContain("Hi, I'm Sawa. What's on your mind today?");
    expect(html).toContain('role="log"');
    expect(html).toContain('aria-live="polite"');
  });

  it("keeps the non-clinical disclaimer in the house third person", () => {
    const html = render();
    expect(html).toContain("Akili Sawa is not a therapist, clinician or crisis service.");
  });

  it("keeps the existing bands and their pathways", () => {
    const html = render();
    expect(html).toContain("Who We Work With");
    expect(html).toContain("Our Prevention Model");
    expect(html).toContain("Interested in working with Akili Sawa?");
    expect(html).toContain('href="/for-organisations"');
    expect(html).toContain('href="/contact?reason=scoping-conversation"');
  });

  it("links the new band through to the full /sawa-ai experience", () => {
    expect(render()).toContain('href="/sawa-ai"');
    expect(render()).toContain("Learn about Sawa AI");
  });
});