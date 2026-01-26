import SectionBackground from "../components/layout/SectionBackground";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import IconContainer from "../components/ui/IconContainer";
import ImagePanel from "../components/ui/ImagePanel";

const Pilots = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <div className="space-y-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
                Evidence-driven. Ethically bounded. Purpose-built for scale.
              </p>
              <h1 className="text-balance">
                Pilots, Partnerships, and Learning Collaborations
              </h1>
            </div>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Akili Sawa partners with insurers, employers, researchers, and
              institutions to design, test, and scale preventive mental wellbeing
              interventions.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="#partnership-pathways">
                Explore Partnership Pathways
              </ButtonLink>
              <ButtonLink to="/contact" variant="secondary">
                Contact Us
              </ButtonLink>
            </div>
          </div>
          <ImagePanel
            src="public/Partnerships.jpeg"
            alt="Partnerships and collaborations illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2>What We Mean by Pilots</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Pilots are structured, time-bound collaborations designed to test
              preventive mental wellbeing interventions in real-world settings.
              They allow partners to assess feasibility, engagement, behavioural
              outcomes, and ethical delivery — before broader rollout.
            </p>
          </div>
          <Card>
            <div className="space-y-3 text-sm text-muted">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Key characteristics:
              </p>
              <ul className="space-y-2">
                <li>Defined scope and duration</li>
                <li>Clear success metrics</li>
                <li>Non-clinical, preventive focus</li>
                <li>Alignment with existing systems</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="space-y-8">
          <h2>Current &amp; Recent Collaborations</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <IconContainer>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7h18" />
                      <path d="M7 7v10" />
                      <path d="M17 7v10" />
                      <path d="M5 17h14" />
                    </svg>
                  </IconContainer>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Research Collaboration
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-text">
                      Academic &amp; Research Partnerships
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  Akili Sawa collaborates with academic institutions on
                  preventive mental wellbeing research, including behavioural
                  interventions delivered via low-bandwidth digital channels.
                  These collaborations focus on engagement, follow-through, and
                  outcomes — with appropriate ethical approvals and safeguarding
                  protocols.
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Active collaboration (details shared under NDA)
                </p>
              </div>
            </Card>

            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <IconContainer>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 10h16" />
                      <path d="M6 6h12" />
                      <path d="M8 14h8" />
                      <path d="M5 18h14" />
                    </svg>
                  </IconContainer>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      Insurance &amp; Financial Services Pilots
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-text">
                      Insurance &amp; Financial Institution Pilots
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  Akili Sawa is engaged in paid pilots with insurance and
                  financial institutions exploring prevention-led approaches to
                  member wellbeing, claims mitigation, and engagement.
                </p>
                <div className="space-y-3 text-sm text-muted">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    Focus areas include:
                  </p>
                  <ul className="space-y-2">
                    <li>Early support before escalation</li>
                    <li>Behavioural adherence and engagement</li>
                    <li>Claims-adjacent prevention pathways</li>
                  </ul>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Pilot phase (partner names confidential)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="dark-soft" className="py-18">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2>Transparency with Boundaries</h2>
            <p className="text-sm text-muted">What we can share publicly:</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>General partnership types</li>
              <li>Intervention design principles</li>
              <li>Ethical and safeguarding frameworks</li>
              <li>Aggregated learnings and insights</li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted">What is shared only under NDA:</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Partner identities</li>
              <li>Operational details</li>
              <li>Data, outcomes, and metrics</li>
              <li>Commercial terms</li>
            </ul>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="light" className="pt-0" id="partnership-pathways">
        <div className="space-y-8">
          <h2>Partnership Pathways</h2>
          <div className="grid gap-4 lg:grid-cols-4">
            <Card eyebrow="Step 1" title="Initial Conversation">
              A short exploratory discussion to assess alignment, scope, and
              objectives.
            </Card>
            <Card eyebrow="Step 2" title="Scoping &amp; Design">
              Definition of pilot structure, delivery format, safeguards, and
              success measures.
            </Card>
            <Card eyebrow="Step 3" title="Agreement &amp; Governance">
              NDA (where required), ethical alignment, and implementation
              planning.
            </Card>
            <Card eyebrow="Step 4" title="Pilot Delivery &amp; Learning">
              Deployment, monitoring, and shared learning.
            </Card>
          </div>
          <ButtonLink to="/contact" variant="tertiary">
            Request a Scoping Conversation
          </ButtonLink>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl">Who This Page Is For</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  An insurer or financial institution exploring prevention-led
                  wellbeing
                </li>
                <li>An employer seeking early-support solutions</li>
                <li>A researcher or donor funding preventive interventions</li>
                <li>
                  A public or development institution operating in fragile
                  contexts
                </li>
              </ul>
            </div>
          </Card>
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl">This Page Is Not For</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>Individual therapy seekers</li>
                <li>Clinical service procurement</li>
                <li>Crisis or emergency services</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="gradient">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">
                Ready to scope a pilot?
              </h2>
              <p className="text-sm text-muted">
                Start with a structured, ethical, prevention-first pilot.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/contact">Request a Scoping Conversation</ButtonLink>
              <ButtonLink to="/prevention-model" variant="secondary">
                Our Prevention Model
              </ButtonLink>
              <ButtonLink to="/ethics" variant="secondary">
                Ethics &amp; Safeguarding
              </ButtonLink>
              <ButtonLink to="/for-organisations" variant="secondary">
                For Organisations
              </ButtonLink>
            </div>
          </div>
        </Card>
      </SectionBackground>
    </div>
  );
};

export default Pilots;
