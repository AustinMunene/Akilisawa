import { describe, expect, it } from "vitest";

import {
  contactReasonAliases,
  contactReasonValues,
  contactReasons,
  findContactReason,
  resolveContactReasonSlug,
} from "../src/lib/contact";

/*
 * The shared contact reasons (tickets 27 and 28).
 *
 * The reason string reaches the email subject line, so the API's allowlist
 * and the form's dropdown have to agree exactly. When they were edited
 * separately they drifted: the form could offer a reason the API would
 * reject with a 400, and the `?reason=` links pointed at values that were
 * not in the list at all.
 *
 * These tests pin the list, the aliases, and the slug resolution.
 */
describe("contact reasons", () => {
  it("gives every reason a value and a slug", () => {
    for (const reason of contactReasons) {
      expect(reason.value.length).toBeGreaterThan(0);
      expect(reason.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("has no duplicate values or slugs", () => {
    const values = contactReasons.map((reason) => reason.value);
    const slugs = contactReasons.map((reason) => reason.slug);
    expect(new Set(values).size).toBe(values.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no longer offers a reason with 'pilot' in it", () => {
    for (const value of contactReasonValues) {
      expect(value.toLowerCase()).not.toContain("pilot");
    }
  });

  it("carries the reason that replaced the old partnership option", () => {
    expect(contactReasonValues).toContain("Partnership Discussion");
  });

  it("carries a reason for each of the three access levels", () => {
    /*
     * Levels 2 and 3 on /sawa-ai now route here, and each needs a reason
     * the API accepts (ticket 28).
     */
    expect(contactReasonValues).toContain("Sawa Account Enquiry");
    expect(contactReasonValues).toContain("Institutional Deployment Enquiry");
  });

  it("resolves a slug to its reason", () => {
    expect(resolveContactReasonSlug("partnership")?.value).toBe(
      "Partnership Discussion"
    );
    expect(resolveContactReasonSlug("sawa-account")?.value).toBe(
      "Sawa Account Enquiry"
    );
    expect(resolveContactReasonSlug("institutional-deployment")?.value).toBe(
      "Institutional Deployment Enquiry"
    );
  });

  it("resolves the slugs the site published before the slugs were settled", () => {
    expect(resolveContactReasonSlug("sawa-account-waitlist")?.value).toBe(
      "Sawa Account Enquiry"
    );
    expect(resolveContactReasonSlug("scoping-conversation")?.value).toBe(
      "Partnership Discussion"
    );
  });

  it("leaves the dropdown alone for a slug it does not recognise", () => {
    expect(resolveContactReasonSlug("not-a-real-reason")).toBeUndefined();
    expect(resolveContactReasonSlug("")).toBeUndefined();
    expect(resolveContactReasonSlug(null)).toBeUndefined();
  });

  it("only points aliases at reasons that exist", () => {
    for (const alias of Object.values(contactReasonAliases)) {
      expect(contactReasons.some((reason) => reason.slug === alias)).toBe(true);
    }
  });

  it("finds a reason by its submitted value", () => {
    expect(findContactReason("Research Collaboration")?.variant).toBe("research");
    expect(findContactReason("Media / Speaking Request")?.variant).toBe("media");
    expect(findContactReason("Sawa Account Enquiry")?.variant).toBe("sawaAccount");
    expect(findContactReason("Not A Reason")).toBeUndefined();
  });
});
