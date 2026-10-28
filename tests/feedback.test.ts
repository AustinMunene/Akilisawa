import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import SawaFeedback from "../src/components/sawa/SawaFeedback";
import SawaAi from "../src/pages/SawaAi";

/*
 * The feedback band (ticket 29).
 *
 * `renderToStaticMarkup` runs in the default node environment without a DOM,
 * so no jsdom or testing-library is introduced. React escapes apostrophes in
 * text to `&#x27;`, so the helper restores them before the copy assertions.
 */
const render = (node: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, node)
  ).replace(/&#x27;/g, "'");

describe("the feedback band", () => {
  it("asks for feedback in plain, specific language", () => {
    const html = render(createElement(SawaFeedback));
    expect(html).toContain("Tell us what you think of Sawa");
    expect(html).toContain("Your feedback");
    expect(html).toContain("Send feedback");
  });

  it("says what happens to the comment and what does not", () => {
    const html = render(createElement(SawaFeedback));
    expect(html).toContain("goes to the Akili Sawa team");
    expect(html).toContain("not linked to your conversation");
    expect(html).toContain("the conversation itself is never sent");
  });

  it("asks for no personal or clinical information", () => {
    const html = render(createElement(SawaFeedback));
    expect(html).toContain(
      "Please do not include personal or clinical information"
    );
  });

  it("labels the field for a screen reader", () => {
    const html = render(createElement(SawaFeedback));
    expect(html).toContain("Your feedback");
    expect(html).toContain("textarea");
  });

  it("sits below the conversation and above the organisation CTA", () => {
    const html = render(createElement(SawaAi));
    const chat = html.indexOf("Date of birth / Tarehe ya kuzaliwa");
    const feedback = html.indexOf("Tell us what you think of Sawa");
    const cta = html.indexOf("Bring Sawa AI to your organisation");
    const faq = html.indexOf("What is Sawa?");
    expect(chat).toBeGreaterThan(-1);
    expect(feedback).toBeGreaterThan(chat);
    expect(cta).toBeGreaterThan(feedback);
    expect(faq).toBeGreaterThan(cta);
  });

  it("does not claim a reply is coming", () => {
    /*
     * The page is account-free, so a comment cannot be tied to a person or
     * answered as a support channel. The band must not promise either.
     */
    const html = render(createElement(SawaFeedback));
    expect(html.toLowerCase()).not.toContain("we will get back to you");
    expect(html.toLowerCase()).not.toContain("we will reply");
  });
});
