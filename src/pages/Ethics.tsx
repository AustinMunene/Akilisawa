import SectionBackground from "../components/layout/SectionBackground";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import IconContainer from "../components/ui/IconContainer";
import ImagePanel from "../components/ui/ImagePanel";

const Ethics = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <div className="space-y-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
                Ethics &amp; Safeguarding
              </p>
              <h1 className="text-balance">Ethics &amp; Safeguarding</h1>
            </div>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Akili Sawa operates strictly within a preventive, non-clinical
              scope. Our responsibility is to support coping, resilience, and
              behavioural follow-through not to diagnose, treat, or replace
              professional mental health care. Ethical delivery requires knowing
              both what to do and when to stop. Our model is designed around this
              principle.
            </p>
            <div className="flex flex-wrap gap-3">
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
                  <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </IconContainer>
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
                  <path d="M4 12h16" />
                  <path d="M4 6h10" />
                  <path d="M10 18h10" />
                </svg>
              </IconContainer>
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
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </IconContainer>
            </div>
          </div>
          <ImagePanel
            src="/Safety.jpeg"
            alt="Safeguarding pathway illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl">What Akili Sawa Does</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>Provides structured, skills-based preventive support</li>
                <li>Supports stress management and emotional regulation</li>
                <li>Reinforces healthy coping behaviours</li>
                <li>Encourages engagement and follow-through</li>
                <li>Identifies indicators requiring escalation</li>
              </ul>
            </div>
          </Card>
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl">What Akili Sawa Does NOT Do</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>Diagnose mental health conditions</li>
                <li>Provide psychotherapy or psychiatric treatment</li>
                <li>Manage clinical cases</li>
                <li>Replace EAPs, clinicians, or public health services</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="light">
        <div className="space-y-8">
          <div>
            <h2>Safeguarding and Escalation</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Participant safety is prioritised through defined escalation
              pathways integrated into program delivery.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <Card>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Escalation triggers may include:
                </p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Expressions of acute distress</li>
                  <li>Indicators of harm to self or others</li>
                  <li>Repeated disengagement following distress signals</li>
                </ul>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  When escalation is triggered:
                </p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>The Akili Sawa intervention pauses</li>
                  <li>Participants are redirected to appropriate services</li>
                  <li>
                    Referrals align with partner systems (insurance, EAPs, public
                    health)
                  </li>
                </ul>
              </div>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-card bg-panel/95 p-6 shadow-float">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    Important
                  </p>
                  <p className="text-sm text-muted">
                    Akili Sawa does not retain participants within its system once
                    escalation thresholds are met.
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted"></div>
            </div>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2>Data Protection &amp; Confidentiality</h2>
            <p className="text-base text-muted md:text-lg">
              Key principles:
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Data minimisation</li>
              <li>Purpose-limited use</li>
              <li>Secure storage and access control</li>
              <li>Compliance with applicable data protection laws</li>
            </ul>
            <ButtonLink to="/privacy" variant="tertiary">
              Learn more about partnership data governance
            </ButtonLink>
          </div>
          <Card>
            <div className="space-y-3 text-sm text-muted">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Participant data is:
              </p>
              <ul className="space-y-2">
                <li>Used only for program delivery and evaluation</li>
                <li>Not shared beyond agreed partners</li>
                <li>Anonymised for research and reporting where applicable</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2>Ethical Delivery in Fragile Contexts</h2>
            <p className="text-base text-muted md:text-lg">
              Akili Sawa is designed for deployment in environments affected by
              economic stress, displacement, or conflict. Ethical delivery in
              these settings requires heightened care, including:
            </p>
          </div>
          <Card>
            <div className="space-y-3 text-sm text-muted">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Safeguards include:
              </p>
              <ul className="space-y-2">
                <li>Cultural and contextual adaptation</li>
                <li>Community-grounded facilitation</li>
                <li>Avoidance of coercive participation</li>
                <li>Clear consent and opt-out mechanisms</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>Governance &amp; Oversight</h2>
          <p className="max-w-3xl text-base text-muted md:text-lg">
            Akili Sawa’s ethical framework is informed by behavioural science,
            public health principles, and field experience. Program design and
            delivery are reviewed to ensure alignment with partner requirements,
            ethical standards, and safeguarding expectations. External advisors
            and research partners may support oversight on specific pilots.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="gradient">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">
                Ready to work within clear ethical boundaries?
              </h2>
              <p className="text-sm text-muted">
                Partner with Akili Sawa to deliver prevention programs that are
                ethical, accountable, and safe.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/prevention-model">
                Our Prevention Model
              </ButtonLink>
              <ButtonLink to="/pilots" variant="secondary">
                Pilots &amp; Partnerships
              </ButtonLink>
              <ButtonLink to="/for-organisations" variant="secondary">
                For Organisations
              </ButtonLink>
              <ButtonLink to="/contact" variant="tertiary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </Card>
      </SectionBackground>
    </div>
  );
};

export default Ethics;
