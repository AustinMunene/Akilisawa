import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SawaAgeGate from "../src/components/sawa/SawaAgeGate";
import { isAdultDateOfBirth } from "../src/lib/sawa/ageGate";

describe("Sawa age and consent gate", () => {
  it("requires an adult date of birth and explicit consent before rendering the chat", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(SawaAgeGate, null, createElement("p", null, "Private chat content")),
      ),
    );

    expect(html).toContain("Date of birth / Tarehe ya kuzaliwa");
    expect(html).toContain('name="birthDay"');
    expect(html).toContain('name="birthMonth"');
    expect(html).toContain('name="birthYear"');
    expect(html).toContain("Select the day, month and year");
    expect(html).toContain("I am 18 or over");
    expect(html).not.toContain("Private chat content");
  });

  it("accepts the eighteenth birthday and rejects a date one day too young", () => {
    const today = new Date(2026, 9, 18);
    expect(isAdultDateOfBirth("2008-10-18", today)).toBe(true);
    expect(isAdultDateOfBirth("2008-10-19", today)).toBe(false);
    expect(isAdultDateOfBirth("2027-01-01", today)).toBe(false);
    expect(isAdultDateOfBirth("not-a-date", today)).toBe(false);
  });
});
