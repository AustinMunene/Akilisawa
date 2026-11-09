import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SawaPrivacySection from "../src/components/sawa/SawaPrivacySection";
import {
  defaultSawaLanguage,
  privacyCopy,
  SW_PRIVACY_PENDING_NOTE,
  SW_PRIVACY_REVIEWED,
  readSawaLanguage,
  SAWA_LANGUAGE_KEY,
  type SawaLanguageStorage,
} from "../src/lib/sawa/language";
import Privacy from "../src/pages/Privacy";

/*
 * Sawa AI User Feedback No. 1, issue 2: a plain-language summary first, the
 * four questions the brief lists, "may be sent" for the support inbox, and
 * English and Kiswahili saying the same thing, one at a time.
 */

const render = (language?: "en" | "sw") =>
  renderToStaticMarkup(createElement(SawaPrivacySection, { initialLanguage: language }));

describe("Sawa privacy section", () => {
  it("opens with the board's plain-language summary", () => {
    const html = render("en");
    const title = html.indexOf("Your privacy matters");
    const firstQuestion = html.indexOf("What information is collected?");
    expect(title).toBeGreaterThan(-1);
    expect(firstQuestion).toBeGreaterThan(title);
    expect(html).toContain("How your conversations are handled");
    expect(html).toContain("When additional safety support may be needed");
    expect(html).toContain("What you should know");
  });

  it("answers the four questions the feedback asks for", () => {
    const html = render("en");
    for (const question of [
      "What information is collected?",
      "Who or what processes my messages?",
      "When might a message be shared with the Akili Sawa support team?",
      "How long is information retained, and what control do I have over it?",
    ]) {
      expect(html).toContain(question);
    }
  });

  it("separates browser storage from server processing", () => {
    const html = render("en");
    expect(html).toContain("held in this browser tab");
    expect(html).toContain("sent through Akili Sawa&#x27;s server to the AI provider");
    expect(html).toContain("does not keep a copy of the conversation");
  });

  it("says the support inbox may receive a message, never that it always does", () => {
    const text = JSON.stringify(privacyCopy.en);
    expect(text).toContain("may be sent");
    expect(text).toContain("may be emailed");
    expect(text).not.toMatch(/message is sent to Akili Sawa/);
    expect(text).not.toMatch(/\banonymous\b|\bencrypted\b/i);
  });

  it("carries the anchors the age gate, chat and FAQ link to", () => {
    const html = render("en");
    expect(html).toContain('id="sawa-privacy"');
    expect(html).toContain('id="safety-escalation"');
    expect(html).toContain('href="#safety-escalation"');
    expect(html).toContain('href="#privacy-notice"');
  });

  it("shows English under a Kiswahili note until the Kiswahili legal copy is reviewed", () => {
    expect(SW_PRIVACY_REVIEWED).toBe(false);
    const sw = render("sw");
    expect(sw).toContain(SW_PRIVACY_PENDING_NOTE);
    expect(sw).toContain("Your privacy matters");
    expect(sw).not.toContain("Faragha yako ni muhimu");

    const en = render("en");
    expect(en).not.toContain(SW_PRIVACY_PENDING_NOTE);
    expect(en).not.toContain("Faragha yako ni muhimu");
  });

  it("keeps English and Kiswahili structurally aligned", () => {
    const { en, sw } = privacyCopy;
    expect(sw.summary.length).toBe(en.summary.length);
    expect(sw.questions.map((q) => q.id)).toEqual(en.questions.map((q) => q.id));
    en.questions.forEach((question, index) => {
      expect(sw.questions[index].body.length).toBe(question.body.length);
    });
  });

  it("is part of the privacy page, under the page-level anchor", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Privacy)),
    );
    expect(html).toContain('id="privacy-notice"');
    expect(html).toContain('id="sawa-privacy"');
    expect(html.match(/id="safety-escalation"/g)?.length).toBe(1);
  });
});

describe("Sawa language default", () => {
  const empty: SawaLanguageStorage = { getItem: () => null, setItem: () => undefined };

  it("starts in Kiswahili for a browser set to Kiswahili", () => {
    expect(defaultSawaLanguage(["sw-KE", "en"])).toBe("sw");
    expect(defaultSawaLanguage(["sw"])).toBe("sw");
    expect(readSawaLanguage(empty, ["sw-KE"])).toBe("sw");
  });

  it("starts in English otherwise", () => {
    expect(defaultSawaLanguage(["en-KE", "sw"])).toBe("en");
    expect(defaultSawaLanguage([])).toBe("en");
  });

  it("lets a stored choice win over the browser language", () => {
    const stored: SawaLanguageStorage = {
      getItem: (key) => (key === SAWA_LANGUAGE_KEY ? "en" : null),
      setItem: () => undefined,
    };
    expect(readSawaLanguage(stored, ["sw-KE"])).toBe("en");
  });
});
