import SectionBackground from "../components/layout/SectionBackground";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import IconContainer from "../components/ui/IconContainer";
import ImagePanel from "../components/ui/ImagePanel";

const PreventionModel = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
              Designed for scale. Grounded in behavioural science. Delivered
              ethically.
            </p>
            <h1 className="text-balance">
              A Structured, Preventive Model — Before Crisis
            </h1>
          </div>
          <p className="max-w-2xl text-base text-muted md:text-lg">
            Akili Sawa delivers non-clinical, skills-based mental wellbeing
            support designed to strengthen coping and behavioural follow-through,
            with clear escalation pathways to formal care.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink to="/for-organisations">For Organisations</ButtonLink>
            <ButtonLink to="/ethics" variant="secondary">
              Ethics &amp; Safeguarding
            </ButtonLink>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <h2>What We Mean by Prevention</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Prevention in mental wellbeing focuses on supporting individuals
              before distress escalates into crisis or clinical need. Akili Sawa
              operates in the space between everyday stress and formal mental
              health care — providing structured, non-clinical support while
              maintaining clear boundaries and referral pathways.
            </p>
          </div>
          <ImagePanel
            src="https://akilisawa.com/wp-content/uploads/2026/01/1.jpeg"
            alt="Preventive wellbeing support illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="light" className="pt-0">
        <div className="space-y-8">
          <h2>The Three-Stage Model</h2>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-8 bottom-8 w-px bg-line/70 lg:hidden" />
            <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-line/70 lg:block" />
            <div className="pointer-events-none absolute left-0 right-0 top-8 hidden items-center justify-between lg:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-panel text-xs font-semibold text-text shadow-float">
                1
              </span>
              <span className="text-xs font-semibold text-muted">→</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-panel text-xs font-semibold text-text shadow-float">
                2
              </span>
              <span className="text-xs font-semibold text-muted">→</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-panel text-xs font-semibold text-text shadow-float">
                3
              </span>
            </div>
            <div className="grid gap-6 pl-6 lg:grid-cols-3 lg:pl-0">
            <Card>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <IconContainer>
                    <span className="text-sm font-semibold text-accent">1</span>
                  </IconContainer>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Stage 1
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-text">
                      Early Support
                    </h3>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">Purpose:</p>
                  <p>
                    Build basic coping and resilience before distress escalates.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">What this includes:</p>
                  <ul className="space-y-2">
                    <li>Stress and emotional regulation skills</li>
                    <li>Coping with uncertainty and shock</li>
                    <li>Decision-making under pressure</li>
                    <li>Adaptive problem-solving</li>
                  </ul>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">Delivery formats:</p>
                  <ul className="space-y-2">
                    <li>SMS and WhatsApp</li>
                    <li>Group-based or individual formats</li>
                    <li>Community-facilitated sessions</li>
                  </ul>
                </div>
                <div className="rounded-soft bg-soft px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float">
                  No diagnosis. No treatment.
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <IconContainer>
                    <span className="text-sm font-semibold text-accent">2</span>
                  </IconContainer>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Stage 2
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-text">
                      Behavioural Follow-Through
                    </h3>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">Purpose:</p>
                  <p>Help people apply skills consistently in real life.</p>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">What this includes:</p>
                  <ul className="space-y-2">
                    <li>Light-touch guidance and check-ins</li>
                    <li>Behavioural nudges and reminders</li>
                    <li>Structured reflection prompts</li>
                    <li>Peer or facilitator-supported reinforcement</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <IconContainer>
                    <span className="text-sm font-semibold text-accent">3</span>
                  </IconContainer>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Stage 3
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-text">
                      Escalation &amp; Referral Pathways
                    </h3>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">Purpose:</p>
                  <p>Ensure safety, ethics, and appropriate care.</p>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">What this includes:</p>
                  <ul className="space-y-2">
                    <li>Identification of red-flag indicators</li>
                    <li>Clear escalation protocols</li>
                    <li>
                      Referral to insurance-covered providers, EAPs, or public
                      health facilities
                    </li>
                  </ul>
                </div>
                <div className="space-y-3 text-sm text-muted">
                  <p className="font-semibold text-text">
                    What this does NOT include:
                  </p>
                  <ul className="space-y-2">
                    <li>Diagnosis</li>
                    <li>Treatment</li>
                    <li>Clinical case management</li>
                  </ul>
                </div>
              </div>
            </Card>
            </div>
          </div>
          <ButtonLink to="/ethics" variant="tertiary">
            Ethics &amp; Safeguarding Framework →
          </ButtonLink>
        </div>
      </SectionBackground>

      <SectionBackground variant="dark-soft">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2>Designed for Real-World Conditions</h2>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Akili Sawa is built for environments where bandwidth, access, and
              specialist care may be limited. Our model prioritises simplicity,
              accessibility, and cultural grounding — ensuring interventions
              remain usable, ethical, and effective at scale.
            </p>
          </div>
          <Card>
            <div className="space-y-3 text-sm text-muted">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Key features:
              </p>
              <ul className="space-y-2">
                <li>Low-bandwidth delivery (SMS, WhatsApp)</li>
                <li>Community-grounded facilitation</li>
                <li>Language and context adaptation</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="space-y-4">
          <h2>Evidence-Informed and Evaluation-Ready</h2>
          <p className="max-w-3xl text-base text-muted md:text-lg">
            Akili Sawa’s prevention model is informed by behavioural science and
            designed to support rigorous evaluation. We collaborate with
            partners to assess engagement, follow-through, and outcomes through
            ethical and appropriate methods, including randomized evaluations
            where relevant.
          </p>
          <ButtonLink to="/evidence-impact" variant="tertiary">
            Explore Evidence &amp; Impact →
          </ButtonLink>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="space-y-6">
          <h2>Clear Scope and Boundaries</h2>
          <ul className="space-y-3 text-sm text-muted">
            <li>Non-clinical preventive support</li>
            <li>No diagnosis or treatment</li>
            <li>Defined referral pathways</li>
            <li>Alignment with existing care systems</li>
          </ul>
          <p className="text-sm text-muted">
            This repetition is intentional. It reduces risk.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="gradient">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">
                Ready to operationalise prevention?
              </h2>
              <p className="text-sm text-muted">
                Partner with Akili Sawa to deploy scalable, ethical prevention
                programs.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/for-organisations">For Organisations</ButtonLink>
              <ButtonLink to="/pilots" variant="secondary">
                Pilots &amp; Partnerships
              </ButtonLink>
              <ButtonLink to="/contact" variant="tertiary">
                Contact Us
              </ButtonLink>
            </div>
          </div>
        </Card>
      </SectionBackground>
    </div>
  );
};

export default PreventionModel;
