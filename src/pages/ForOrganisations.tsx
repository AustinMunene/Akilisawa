import SectionBackground from "../components/layout/SectionBackground";
import Badge from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import ImagePanel from "../components/ui/ImagePanel";

const ForOrganisations = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge>Non-clinical</Badge>
              <Badge>Preventive</Badge>
              <Badge>Scalable</Badge>
              <Badge>Ethically delivered</Badge>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Built for insurers, financial institutions, employers,
                researchers, and public programs operating at scale.
              </p>
              <h1 className="text-balance">
                Preventive Mental Wellbeing for Organisations
              </h1>
            </div>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Scalable, non-clinical mental wellbeing support designed to reduce
              risk, improve behavioural follow-through, and strengthen outcomes —
              without expanding clinical liability.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/pilots">Explore Pilots &amp; Partnerships</ButtonLink>
              <ButtonLink to="/prevention-model" variant="secondary">
                Our Prevention Model
              </ButtonLink>
              <ButtonLink to="/ethics" variant="tertiary">
                Ethics &amp; Safeguarding
              </ButtonLink>
            </div>
          </div>
          <ImagePanel
            src="https://akilisawa.com/wp-content/uploads/2026/01/Collectively-Tangled-%E2%80%94-Therapy-for-Entrepreneurs-Business-Owners-and-Leaders-%E2%80%94Entrepreneurs-and-business-owners-have-mental-health-too.jpeg"
            alt="Entrepreneurs and business owners wellbeing illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <h2>The Gap Between Prevention and Care</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Most organisations encounter mental distress only after it has
              become costly — through claims, absenteeism, disengagement, or crisis
              response. Akili Sawa operates before this point, providing
              structured, preventive support that strengthens coping and
              follow-through while maintaining clear boundaries to formal clinical
              care.
            </p>
          </div>
          <ImagePanel
            src="https://akilisawa.com/wp-content/uploads/2026/01/The-Importance-of-Employee-Wellbeing_-How-Technology-Supports-Mental-Health-Initiatives.jpeg"
            alt="Employee wellbeing and technology support illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="space-y-8">
          <div>
            <h2>Who This Page Is For</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Insurance &amp; Financial Institutions">
              <p className="text-sm text-muted">
                Akili Sawa functions as a prevention and navigation layer
                adjacent to claims, benefits, and care pathways. We help partners
                reduce escalation to high-cost care, improve member engagement,
                and strengthen early identification — without assuming clinical
                responsibility.
              </p>
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Typical use cases:
                </p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Claims-adjacent prevention pilots</li>
                  <li>Member resilience programs</li>
                  <li>Low-bandwidth outreach to rural or informal populations</li>
                </ul>
              </div>
              <div className="mt-4">
                <ButtonLink to="/pilots" variant="tertiary">
                  Explore Insurance Pilots →
                </ButtonLink>
              </div>
            </Card>
            <Card title="Employers &amp; Workforce Programs">
              <p className="text-sm text-muted">
                We support employers to address mental wellbeing before burnout,
                absenteeism, and disengagement escalate, through stigma-free,
                non-clinical early support.
              </p>
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Outcomes employers value:
                </p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Improved productivity and retention</li>
                  <li>Reduced sick leave and presenteeism</li>
                  <li>Clear escalation pathways to EAPs or covered care</li>
                </ul>
              </div>
              <div className="mt-4">
                <ButtonLink to="/contact" variant="tertiary">
                  Discuss a Workforce Pilot →
                </ButtonLink>
              </div>
            </Card>
            <Card title="Researchers, Donors &amp; Public Institutions">
              <p className="text-sm text-muted">
                Akili Sawa is an implementation partner for preventive mental
                wellbeing research and programs, offering RCT-ready
                interventions delivered with strong ethical safeguards.
              </p>
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  What we offer:
                </p>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Non-clinical, scalable interventions</li>
                  <li>Field-tested delivery in fragile contexts</li>
                  <li>Collaboration on learning and evidence generation</li>
                </ul>
              </div>
              <div className="mt-4">
                <ButtonLink to="/evidence-impact" variant="tertiary">
                  Explore Evidence &amp; Impact →
                </ButtonLink>
              </div>
            </Card>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="light">
        <div className="space-y-8">
          <div>
            <h2>How Partnerships Work</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            <Card eyebrow="Step 1" title="Scoping &amp; Alignment">
              Define objectives, operating context, and impact outcomes.
            </Card>
            <Card eyebrow="Step 2" title="Pilot Design">
              Establish delivery scope, measurement, and stakeholder roles.
            </Card>
            <Card eyebrow="Step 3" title="Ethical Review &amp; Delivery">
              Run pilots with safeguarding protocols and transparent reporting.
            </Card>
            <Card eyebrow="Step 4" title="Learning &amp; Scale Decisions">
              Translate findings into scalable, sustainable programs.
            </Card>
          </div>
          <ButtonLink to="/contact" variant="tertiary">
            Request a Scoping Conversation →
          </ButtonLink>
        </div>
      </SectionBackground>

      <SectionBackground variant="dark-soft" className="py-18">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <h2>Clear Scope. Clear Boundaries.</h2>
            <ul className="space-y-3 text-sm text-muted">
              <li>Non-clinical preventive support only</li>
              <li>No diagnosis or treatment</li>
              <li>Defined escalation and referral protocols</li>
              <li>Alignment with insurance, employer, or public systems</li>
            </ul>
            <ButtonLink to="/ethics" variant="tertiary">
              Ethics &amp; Safeguarding →
            </ButtonLink>
          </div>
          <div className="space-y-6">
            <h2>Pilots &amp; Partnerships</h2>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              We co-design pilots in confidence, with clear privacy expectations
              for partners, participants, and data handling to protect all
              stakeholders.
            </p>
            <ButtonLink to="/pilots" variant="tertiary">
              Explore Pilots &amp; Partnerships →
            </ButtonLink>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">
                Interested in working with Akili Sawa?
              </h2>
              <p className="text-sm text-muted">
                Share your objectives and we will shape a scoped prevention
                partnership together.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/contact">
                Request a Scoping Conversation
              </ButtonLink>
            </div>
          </div>
        </Card>
      </SectionBackground>
    </div>
  );
};

export default ForOrganisations;
