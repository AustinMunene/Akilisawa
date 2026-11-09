import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SawaChat from "../src/components/sawa/SawaChat";
import { SawaLanguageProvider, useSawaLanguage } from "../src/components/sawa/SawaLanguageProvider";
import {
  chatCopy,
  messageTooLong,
  openingLine,
  readSawaLanguage,
  SAWA_LANGUAGE_KEY,
  writeSawaLanguage,
  type SawaLanguageStorage,
} from "../src/lib/sawa/language";
import { initialChatState, OPENING_LINE } from "../src/lib/sawa/chat";

class FakeStorage implements SawaLanguageStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  peek(key: string): string | undefined {
    return this.map.get(key);
  }
}

describe("Sawa language preference", () => {
  it("reads and writes the stored preference", () => {
    const storage = new FakeStorage();
    expect(readSawaLanguage(storage)).toBe("en");

    writeSawaLanguage("sw", storage);

    expect(storage.peek(SAWA_LANGUAGE_KEY)).toBe("sw");
    expect(readSawaLanguage(storage)).toBe("sw");
  });

  it("falls back to English for an unknown or unavailable stored value", () => {
    const storage = new FakeStorage();
    storage.setItem(SAWA_LANGUAGE_KEY, "fr");

    expect(readSawaLanguage(storage)).toBe("en");
    expect(readSawaLanguage(null)).toBe("en");
  });

  it("does not throw when storage access is blocked", () => {
    const blocked: SawaLanguageStorage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    };

    expect(readSawaLanguage(blocked)).toBe("en");
    expect(() => writeSawaLanguage("sw", blocked)).not.toThrow();
  });

  it("builds the opening and validation copy in the chosen language", () => {
    expect(openingLine("en")).toBe(OPENING_LINE);
    expect(openingLine("sw")).toBe("Sasa, mimi ni Sawa. Kuna kitu ungependa tuongee leo?");
    expect(initialChatState("sw").messages[0]?.content).toBe(openingLine("sw"));
    expect(messageTooLong("sw", 50)).toContain("herufi 50");
  });

  it("renders one language at a time in the chat", () => {
    const html = renderToStaticMarkup(
      createElement(
        SawaLanguageProvider,
        { initialLanguage: "sw" },
        createElement(SawaChat),
      ),
    );

    expect(html).toContain("Sasa, mimi ni Sawa");
    expect(html).toContain("Nisaidie kuelewa kitu kinanisumbua");
    expect(html).toContain("Ujumbe wako");
    expect(html).toContain("Tuma");
    expect(html).toContain("Sawa si therapist wala huduma ya dharura");
    expect(html).not.toContain("Hi, I'm Sawa");
    expect(html).not.toContain("Type your message...");
  });

  it("lets a nested provider defer to the one above it", () => {
    const Probe = () => createElement("span", null, useSawaLanguage().language);
    const html = renderToStaticMarkup(
      createElement(
        SawaLanguageProvider,
        { initialLanguage: "sw" },
        createElement(SawaLanguageProvider, { initialLanguage: "en" }, createElement(Probe)),
      ),
    );
    expect(html).toBe("<span>sw</span>");
  });

  it("keeps the two language dictionaries structurally aligned", () => {
    expect(Object.keys(chatCopy.sw)).toEqual(Object.keys(chatCopy.en));
    expect(chatCopy.sw.startingOptions).toHaveLength(
      chatCopy.en.startingOptions.length,
    );
  });
});
