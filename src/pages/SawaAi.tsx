import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionBackground from "../components/layout/SectionBackground";
import Faq67 from "../components/sawa/Faq67";
import SawaAgeGate from "../components/sawa/SawaAgeGate";
import SawaChat from "../components/sawa/SawaChat";
import Badge from "../components/ui/Badge";
import { Button, ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  accessLevels,
  capabilityBoundary,
  safetyFlow,
} from "../lib/sawa/copy";

const SawaAi = () => {
  const prefersReducedMotion = useReducedMotion();

  const showChat = () => {
    document.getElementById("sawa-ai-chat")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <div>
      {/*
       * §8 hero. Product first: the chat mounts directly under the heading so the
       * opening message and input sit within the first screen (the §67 principle),
       * with the explanatory paragraph below rather than between the hero and the
       * conversation.
       */}
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-dark dark:text-brand">
              Sawa AI
            </p>
            <h1 className="text-balance">Meet Sawa AI.</h1>
            <h2 className="text-balance">A conversation can be a place to start.</h2>
          </div>

          {/*
           * The working chat (ticket 20). The wrapper keeps the fixed minimum
           * height and the `#sawa-ai-chat` anchor the hero CTA scrolls to, so
           * the transcript and composer land without reflowing the hero.
           */}
          <Card>
            <div id="sawa-ai-chat" className="flex min-h-[24rem] flex-col">
              <SawaAgeGate>
                <SawaChat variant="page" />
              </SawaAgeGate>
            </div>
          </Card>

          <p className="text-base text-muted md:text-lg">
            Sawa AI is Akili Sawa's AI-powered wellbeing companion, designed to
            help people talk through what they are experiencing, reflect on their
            wellbeing and identify an appropriate next step.
          </p>
          <p className="text-xs text-muted">
            Akili Sawa is not a therapist, clinician or crisis service. If you
            need urgent help, contact local emergency services or a trusted
            healthcare provider.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button type="button" onClick={showChat}>
              Talk to Sawa AI
            </Button>
          </div>
        </div>
      </SectionBackground>

      {/*
       * §10 access levels. Level 1 is live and visually marked; Levels 2 and 3
       * are described without a control that implies a capability we do not
       * have. The §13 scope band and §14 answers slot below this.
       */}
      <SectionBackground variant="mid" className="pt-0">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2>Three ways to use Sawa</h2>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Sawa begins with a conversation. No account is needed to start, and
              nothing here asks you to create one.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {accessLevels.map((level) => (
              <Card
                key={level.id}
                className={level.available ? "ring-2 ring-accent/50" : undefined}
                eyebrow={`Level ${level.level}`}
                title={level.name}
              >
                <div className="space-y-4">
                  {level.available ? (
                    <Badge>Available now</Badge>
                  ) : (
                    <Badge>Not available yet</Badge>
                  )}
                  <p>{level.who}</p>
                  <p>{level.body}</p>
                  {level.cta?.kind === "scroll" ? (
                    <Button
                      type="button"
                      onClick={showChat}
                      className="min-h-[44px]"
                    >
                      {level.cta.label}
                    </Button>
                  ) : level.cta?.kind === "link" ? (
                    <ButtonLink
                      to={level.cta.to}
                      variant="secondary"
                      className="min-h-[44px]"
                    >
                      {level.cta.label}
                    </ButtonLink>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/*
       * §13 capability-boundary band and safety-flow strip. The mockup's split
       * is the structural reference: left carries the can-and-cannot copy with
       * the org's core thesis verbatim; right carries the six-step flow as pill
       * chips. The strip reads as architecture, not as a live readout, and it
       * does not claim the escalation inbox is staffed - the mechanism is
       * described honestly, per ticket 13's boundary table.
       */}
      <SectionBackground variant="soft" className="pt-0">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
          <div className="space-y-5">
            <h2>{capabilityBoundary.heading}</h2>
            <p className="text-base text-muted md:text-lg">
              {capabilityBoundary.can}
            </p>
            <p className="text-base text-muted md:text-lg">
              {capabilityBoundary.cannot}
            </p>
            <blockquote className="border-l-4 border-accent pl-4 text-lg font-medium text-text">
              {capabilityBoundary.thesis}
            </blockquote>
            <p className="text-sm text-muted">
              {capabilityBoundary.transcript}{" "}
              <Link
                to={capabilityBoundary.privacyTo}
                className="text-brand-dark dark:text-brand"
              >
                {capabilityBoundary.privacyLabel}
              </Link>
            </p>
          </div>

          <div className="space-y-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-dark dark:text-brand">
              {safetyFlow.kicker}
            </p>
            <ol className="flex list-none flex-wrap items-center gap-x-2 gap-y-3">
              {safetyFlow.steps.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="rounded-pill bg-white/85 px-4 py-2 text-sm text-text shadow-float ring-1 ring-line dark:bg-panel/85">
                    {step}
                  </span>
                  {index < safetyFlow.steps.length - 1 ? (
                    <span aria-hidden className="text-brand">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="text-sm text-muted">{safetyFlow.mechanism}</p>
            <p className="text-xs text-muted">{safetyFlow.architecture}</p>
            <p className="text-xs text-muted">{safetyFlow.crisis}</p>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">
                Bring Sawa AI to your organisation
              </h2>
              <p className="text-sm text-muted">
                Akili Sawa works with employers, insurers, researchers and
                community programmes to make preventive wellbeing support more
                accessible.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/contact?reason=scoping-conversation">
                Request a scoping conversation
              </ButtonLink>
            </div>
          </div>
        </Card>
      </SectionBackground>

      {/*
       * §67 six-question FAQ (ticket 14). Placed last, below the closing CTA
       * and before the site footer, so the product is met first and the
       * explanations follow.
       */}
      <SectionBackground variant="light" className="pt-0">
        <Faq67 />
      </SectionBackground>
    </div>
  );
};

export default SawaAi;
