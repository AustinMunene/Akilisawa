import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Faq67 from "../src/components/sawa/Faq67";
import SawaAi from "../src/pages/SawaAi";

/*
 * Ticket 14: the six §67 answers below the product. `renderToStaticMarkup`
 * runs in the default node environment, so no jsdom is introduced. React
 * escapes apostrophes to `&#x27;`, restored here before copy assertions.
 */

const render = (node: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, node)
  ).replace(/&#x27;/g, "'");

const questions = [
  "What is Sawa?",
  "What can Sawa do?",
  "What can't Sawa do?",
  "When does a human become involved?",
  "How is information protected?",
  "How does institutional deployment work?",
];

describe("Faq67", () => {
  it("renders all six §67 questions", () => {
    const html = render(createElement(Faq67));
    for (const question of questions) {
      expect(html).toContain(question);
    }
  });

  it("renders the answers verbatim from docs/adr/67-answers-v1.md", () => {
    const html = render(createElement(Faq67));
    expect(html).toContain(
      "Sawa AI is a preventive, non-clinical support companion."
    );
    expect(html).toContain(
      "Its role is to support reflection and navigation, not assessment."
    );
    expect(html).toContain(
      "It is not a therapist, psychiatrist, psychologist or other licensed clinician."
    );
    expect(html).toContain("Your transcript is held in this browser.");
    expect(html).toContain(
      "organisations see aggregated insights where relevant, never private conversation details."
    );
  });

  it("opens the two sceptic questions by default and leaves the rest collapsed", () => {
    const html = render(createElement(Faq67));
    expect(html.match(/<details/g)?.length).toBe(6);
    expect(html.match(/open=""/g)?.length).toBe(2);
  });

  it("states Sawa is not an emergency service and links to /privacy", () => {
    const html = render(createElement(Faq67));
    expect(html).toContain(
      "contact local emergency services or a trusted healthcare provider"
    );
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("Read about privacy");
  });

  it("places the FAQ below the product and the closing CTA", () => {
    const html = render(createElement(SawaAi));
    const chat = html.indexOf("Date of birth / Tarehe ya kuzaliwa");
    const cta = html.indexOf("Bring Sawa AI to your organisation");
    const faq = html.indexOf("What is Sawa?");
    expect(chat).toBeGreaterThan(-1);
    expect(cta).toBeGreaterThan(-1);
    expect(faq).toBeGreaterThan(chat);
    expect(faq).toBeGreaterThan(cta);
  });
});
