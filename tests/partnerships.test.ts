import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Footer from "../src/components/layout/Footer";
import Navigation from "../src/components/layout/Navigation";
import Contact from "../src/pages/Contact";
import Partnerships from "../src/pages/Partnerships";

/*
 * The partnerships route and the contact prefill (tickets 27 and 28).
 *
 * Both are about a link landing the visitor in the right place. The old
 * /pilots URL has to keep working, because it is in bookmarks and in
 * shared links, and a `?reason=` link has to actually preselect the
 * reason it names.
 *
 * `renderToStaticMarkup` runs in the default node environment without a
 * DOM, so no jsdom or testing-library is introduced. React escapes
 * apostrophes in text to `&#x27;`, so the helper restores them.
 */
/*
 * The page is rendered directly rather than through the App. The App's
 * pages are all lazy-loaded and `renderToStaticMarkup` resolves no
 * Suspense boundary, so the App renders as empty markup.
 */
const renderPartnerships = () =>
  renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(Partnerships))
  ).replace(/&#x27;/g, "'");

const renderContactAt = (path: string) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Contact)
    )
  ).replace(/&#x27;/g, "'");

describe("the partnerships route", () => {
  it("serves the partnerships page at its new path", () => {
    const html = renderPartnerships();
    expect(html).toContain("Partnerships, Engagements, and Learning Collaborations");
    expect(html).toContain("What We Mean by an Engagement");
  });

  it("links the partnerships page into the site nav and footer", () => {
    const nav = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Navigation))
    );
    expect(nav).toContain('href="/partnerships"');
    expect(nav).not.toContain('href="/pilots"');

    const footer = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Footer))
    );
    expect(footer).toContain('href="/partnerships"');
    expect(footer).not.toContain('href="/pilots"');
  });
  /*
   * The redirect is configured in two places, and both are needed.
   *
   * `vercel.json` redirects /pilots at the edge, before any JavaScript
   * runs, so a visitor with a bookmark or a shared link lands on the new
   * page rather than on a client-side route that has to boot first. The
   * in-app <Navigate> is the fallback for local dev and for any host that
   * does not read vercel.json.
   *
   * `renderToStaticMarkup` does not run effects, so the in-app redirect
   * cannot be observed here - the router would have navigated already.
   * The edge redirect is asserted against the real config file instead.
   */
  it("redirects the old /pilots path at the edge", () => {
    const vercel = JSON.parse(
      readFileSync(
        new URL("../vercel.json", import.meta.url),
        "utf8"
      )
    ) as {
      redirects?: { source: string; destination: string; permanent?: boolean }[];
    };
    const redirect = vercel.redirects?.find(
      (entry) => entry.source === "/pilots"
    );
    expect(redirect).toBeDefined();
    expect(redirect?.destination).toBe("/partnerships");
    expect(redirect?.permanent).toBe(true);
  });

  it("keeps an in-app redirect for hosts that do not read vercel.json", () => {
    const source = readFileSync(
      new URL("../src/App.tsx", import.meta.url),
      "utf8"
    );
    expect(source).toContain('path="pilots"');
    expect(source).toContain('<Navigate to="/partnerships" replace />');
  });

  it("shows no 'pilot' wording anywhere on the page", () => {
    const html = renderPartnerships().toLowerCase();
    expect(html).not.toContain("pilot");
  });
});

describe("the contact prefill", () => {
  /*
   * React renders `selected` on whichever <option> matches the select's
   * value, and the "Select one" placeholder is selected by default. So the
   * assertion is about WHICH option is selected, not about whether the
   * attribute appears at all.
   */
  const selectedReason = (html: string) =>
    html.match(/<option value="([^"]*)" selected=""/)?.[1] ?? null;

  it("preselects the reason a link names", () => {
    const html = renderContactAt("/contact?reason=partnership");
    expect(selectedReason(html)).toBe("Partnership Discussion");
  });

  it("preselects the account enquiry for the Sawa AI access level", () => {
    const html = renderContactAt("/contact?reason=sawa-account");
    expect(selectedReason(html)).toBe("Sawa Account Enquiry");
  });

  it("preselects the deployment enquiry for the institutional access level", () => {
    const html = renderContactAt("/contact?reason=institutional-deployment");
    expect(selectedReason(html)).toBe("Institutional Deployment Enquiry");
  });

  it("resolves the slugs the site published before the slugs were settled", () => {
    expect(
      selectedReason(renderContactAt("/contact?reason=sawa-account-waitlist"))
    ).toBe("Sawa Account Enquiry");
    expect(
      selectedReason(renderContactAt("/contact?reason=scoping-conversation"))
    ).toBe("Partnership Discussion");
  });

  it("leaves the reason unselected when the link names nothing recognisable", () => {
    const html = renderContactAt("/contact?reason=not-a-real-reason");
    expect(selectedReason(html)).toBe("");
  });

  it("leaves the reason unselected when there is no reason in the link", () => {
    const html = renderContactAt("/contact");
    expect(selectedReason(html)).toBe("");
  });

  it("offers every reason the API will accept", () => {
    const html = renderContactAt("/contact");
    for (const value of [
      "Partnership Discussion",
      "Institutional Deployment Enquiry",
      "Insurance / Financial Institution Collaboration",
      "Employer / Workforce Program",
      "Research Collaboration",
      "Sawa Account Enquiry",
      "General Organisational Enquiry",
      "Media / Speaking Request",
    ]) {
      expect(html).toContain(`value="${value}"`);
    }
  });

  it("shows no 'pilot' wording in the form", () => {
    expect(renderContactAt("/contact").toLowerCase()).not.toContain("pilot");
  });
});
