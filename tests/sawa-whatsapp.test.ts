import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SawaPrivacySection from "../src/components/sawa/SawaPrivacySection";
import SawaWhatsAppCard from "../src/components/sawa/SawaWhatsAppCard";
import { SawaLanguageProvider } from "../src/components/sawa/SawaLanguageProvider";
import {
  configuredWhatsAppNumber,
  parseWhatsAppNumber,
  WHATSAPP_EXCERPT_MAX,
  whatsappAnchors,
  whatsappCopy,
  whatsappLink,
  whatsappMessage,
  whatsappPrivacyNote,
} from "../src/lib/sawa/whatsapp";

/*
 * The Akili Sawa WhatsApp line: switched off until a number is configured,
 * neutral by default, the visitor's own words only when they tick the box.
 */

describe("WhatsApp line configuration", () => {
  it("is off when no number is configured", () => {
    expect(configuredWhatsAppNumber()).toBeNull();
  });

  it("accepts a wa.me number and rejects anything else", () => {
    expect(parseWhatsAppNumber("254 712 345 678")).toBe("254712345678");
    expect(parseWhatsAppNumber("+254712345678")).toBe("254712345678");
    expect(parseWhatsAppNumber("0712345678")).toBeNull();
    expect(parseWhatsAppNumber("")).toBeNull();
    expect(parseWhatsAppNumber(undefined)).toBeNull();
    expect(parseWhatsAppNumber("call us")).toBeNull();
  });
});

describe("the WhatsApp message", () => {
  it("is a neutral starter unless the visitor adds their words", () => {
    expect(whatsappMessage("en")).toBe(whatsappCopy.en.starter);
    expect(whatsappMessage("sw", "   ")).toBe(whatsappCopy.sw.starter);
    expect(whatsappMessage("en", "I am scared")).toBe(
      `${whatsappCopy.en.starter}\n\nWhat I wrote: I am scared`,
    );
  });

  it("caps the visitor's words like the support inbox does", () => {
    const long = "a".repeat(WHATSAPP_EXCERPT_MAX + 50);
    expect(whatsappMessage("en", long)).toContain("a".repeat(WHATSAPP_EXCERPT_MAX));
    expect(whatsappMessage("en", long)).not.toContain("a".repeat(WHATSAPP_EXCERPT_MAX + 1));
  });

  it("builds a wa.me link with the message encoded", () => {
    expect(whatsappLink("254712345678", "Hi & bye?")).toBe(
      "https://wa.me/254712345678?text=Hi%20%26%20bye%3F",
    );
  });
});

describe("where the WhatsApp card goes", () => {
  const user = (id: string, content: string) => ({ id, role: "user" as const, content });
  const sawa = (id: string, tier?: "low" | "elevated" | "high" | "abuse") => ({
    id,
    role: "assistant" as const,
    content: "...",
    ...(tier ? { safety: { tier } } : {}),
  });

  it("goes once, under the last bubble of a flagged run, with the visitor's message", () => {
    const anchors = whatsappAnchors([
      sawa("open"),
      user("u1", "My partner threatens me"),
      sawa("reply", "elevated"),
      sawa("support", "elevated"),
      user("u2", "thanks"),
      sawa("plain"),
    ]);
    expect([...anchors.keys()]).toEqual(["support"]);
    expect(anchors.get("support")).toEqual({ excerpt: "My partner threatens me", tier: "elevated" });
  });

  it("goes under a crisis message, but never under low turns or abuse", () => {
    const anchors = whatsappAnchors([
      user("u1", "I want to kill myself"),
      sawa("crisis", "high"),
      user("u2", "you are stupid"),
      sawa("decline", "abuse"),
      user("u3", "tired"),
      sawa("low", "low"),
    ]);
    expect([...anchors.keys()]).toEqual(["crisis"]);
  });
});

describe("the WhatsApp card", () => {
  const render = (tier: "elevated" | "high", language: "en" | "sw" = "en") =>
    renderToStaticMarkup(
      createElement(
        SawaLanguageProvider,
        { initialLanguage: language },
        createElement(SawaWhatsAppCard, { number: "254712345678", excerpt: "I am scared", tier }),
      ),
    ).replace(/&#x27;/g, "'");

  it("opens WhatsApp with the neutral starter, the visitor's words unticked", () => {
    const html = render("elevated");
    expect(html).toContain(`href="https://wa.me/254712345678?text=${encodeURIComponent(whatsappCopy.en.starter)}"`);
    expect(html).not.toContain("I%20am%20scared");
    expect(html).not.toContain("checked");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("puts 999 or 112 first on a crisis message, and promises no emergency service", () => {
    expect(render("high")).toContain("Call 999 or 112 first.");
    expect(render("elevated")).not.toContain("Call 999 or 112 first.");
    expect(render("elevated")).toContain("This is not an emergency service.");
  });

  it("speaks the chosen language", () => {
    expect(render("high", "sw")).toContain("Fungua WhatsApp");
  });
});

describe("the WhatsApp privacy note", () => {
  it("appears in the privacy section only while the line is on", () => {
    const on = renderToStaticMarkup(createElement(SawaPrivacySection, { initialLanguage: "en", whatsappEnabled: true })).replace(/&#x27;/g, "'");
    const off = renderToStaticMarkup(createElement(SawaPrivacySection, { initialLanguage: "en" })).replace(/&#x27;/g, "'");
    expect(on).toContain(whatsappPrivacyNote.en);
    expect(off).not.toContain(whatsappPrivacyNote.en);
  });
});
