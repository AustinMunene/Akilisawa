import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../api/sawa-report";
import SawaReplyReport from "../src/components/sawa/SawaReplyReport";
import { SawaLanguageProvider } from "../src/components/sawa/SawaLanguageProvider";
import { privacyCopy } from "../src/lib/sawa/language";
import { promptV1 } from "../src/lib/sawa/prompt";
import {
  buildReport,
  REPORT_MAX_MESSAGE,
  reportableReplies,
  reportCopy,
} from "../src/lib/sawa/report";
import { HARM_URGE_SUPPORT } from "../src/lib/sawa/safety/crisisCopy";

/*
 * "This didn't help": the opt-in report on one reply. Nothing leaves without
 * the visitor pressing Send, and only that one exchange ever does.
 */

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const makeRes = () => {
  let statusCode = 200;
  let body: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(value: unknown) {
      body = value;
      return res;
    },
  };
  return { res, get status() { return statusCode; }, get body() { return body; } };
};

let ip = 0;
const post = async (body: unknown) => {
  ip += 1;
  const fake = makeRes();
  await handler({ method: "POST", headers: { "x-forwarded-for": `192.0.2.${ip}` }, body }, fake.res);
  return fake;
};

beforeEach(() => {
  process.env.RESEND_API_KEY = "test-key";
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: "mail-1" }, error: null });
});
afterEach(() => {
  delete process.env.RESEND_API_KEY;
});

describe("which replies can be reported", () => {
  it("offers the button on Sawa's own replies only", () => {
    const map = reportableReplies([
      { id: "open", role: "assistant", content: "Hi, I'm Sawa." },
      { id: "u1", role: "user", content: "I wanna hurt someone" },
      { id: "a1", role: "assistant", content: "Is anyone in danger right now?" },
      { id: "s1", role: "assistant", content: HARM_URGE_SUPPORT.en },
    ]);
    expect([...map.entries()]).toEqual([["a1", "I wanna hurt someone"]]);
  });
});

describe("the report", () => {
  it("carries one exchange, capped, and drops an empty comment", () => {
    const report = buildReport({
      message: "m".repeat(REPORT_MAX_MESSAGE + 10),
      reply: "  a reply  ",
      comment: "   ",
      language: "en",
      promptVersion: "1.7",
    });
    expect(report.message).toHaveLength(REPORT_MAX_MESSAGE);
    expect(report).toEqual({ message: report.message, reply: "a reply", language: "en", promptVersion: "1.7" });
  });

  it("emails the exchange to the team and ignores anything else sent", async () => {
    const fake = await post({
      message: "I wanna hurt someone",
      reply: "Is anyone in danger right now?",
      comment: "felt cold",
      language: "en",
      promptVersion: "1.7",
      conversationId: "should-not-appear",
      history: [{ role: "user", content: "earlier secret" }],
    });
    expect(fake.status).toBe(200);
    const mail = sendMock.mock.calls[0]?.[0];
    expect(mail.text).toContain("I wanna hurt someone");
    expect(mail.text).toContain("Is anyone in danger right now?");
    expect(mail.text).toContain("felt cold");
    expect(mail.text).toContain("not monitored for emergencies");
    expect(mail.text).not.toContain("should-not-appear");
    expect(mail.text).not.toContain("earlier secret");
  });

  it("refuses a report with no message or reply", async () => {
    expect((await post({ reply: "x" })).status).toBe(400);
    expect((await post({ message: "x" })).status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("reports failure when Resend returns an error instead of throwing", async () => {
    sendMock.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad" } });
    expect((await post({ message: "m", reply: "r" })).status).toBe(500);
  });
});

describe("the button", () => {
  it("starts as a quiet button and sends nothing on render", () => {
    const fetcher = vi.fn();
    const html = renderToStaticMarkup(
      createElement(
        SawaLanguageProvider,
        { initialLanguage: "en" },
        createElement(SawaReplyReport, { message: "m", reply: "r", fetcher: fetcher as unknown as typeof fetch }),
      ),
    ).replace(/&#x27;/g, "'");
    expect(html).toContain(reportCopy.en.open);
    expect(html).not.toContain(reportCopy.en.explain);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("honesty about the report", () => {
  it("is in the privacy section, in both languages, and Sawa knows about it", () => {
    expect(privacyCopy.en.questions[0].body.join(" ")).toContain("This didn't help");
    expect(privacyCopy.sw.questions[0].body.join(" ")).toContain("Hili halikusaidia");
    expect(promptV1).toContain("Nothing is sent without that choice.");
  });
});
