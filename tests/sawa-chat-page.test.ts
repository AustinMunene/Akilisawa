import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SawaChatPage from "../src/pages/SawaChatPage";
import { SAWA_CHAT_PATH, startMessageFrom } from "../src/lib/sawa/routes";

/*
 * The full-screen conversation at /sawa-ai/chat. Node environment, no DOM, so
 * the markup is checked with renderToStaticMarkup like the other page tests.
 */

const render = () =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [{ pathname: SAWA_CHAT_PATH, state: { start: "hello" } }] },
      createElement(SawaChatPage)
    )
  ).replace(/&#x27;/g, "'");

describe("SawaChatPage", () => {
  it("fills the viewport with no site navigation or footer", () => {
    const html = render();
    expect(html).toContain("h-dvh");
    expect(html).not.toContain("<footer");
    expect(html).not.toContain("<nav");
  });

  it("keeps a way back, the title and one language toggle", () => {
    const html = render();
    expect(html).toContain('href="/sawa-ai"');
    expect(html).toContain("Sawa AI");
    expect(html.match(/aria-label="Language \/ Lugha"/g)).toHaveLength(1);
  });

  it("puts the age gate in front of the chat, even with a first message waiting", () => {
    const html = render();
    expect(html).toContain("Date of birth");
    expect(html).not.toContain('role="log"');
    expect(html).not.toContain("hello");
  });
});

describe("startMessageFrom", () => {
  it("reads a non-empty start message and ignores anything else", () => {
    expect(startMessageFrom({ start: "I need to talk" })).toBe("I need to talk");
    expect(startMessageFrom({ start: "   " })).toBeUndefined();
    expect(startMessageFrom({ start: 42 })).toBeUndefined();
    expect(startMessageFrom(null)).toBeUndefined();
    expect(startMessageFrom("start")).toBeUndefined();
  });
});
