import SectionBackground from "../components/layout/SectionBackground";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";

const EvidenceImpact = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-6">
          <div className="max-w-3xl space-y-6">
            <div className="space-y-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
                Measuring engagement, follow-through, and early support outcomes
                responsibly.
              </p>
              <h1 className="text-balance">
                Evidence-Informed. Evaluation-Ready. Impact-Oriented.
              </h1>
            </div>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Akili Sawa designs preventive mental wellbeing interventions
              grounded in behavioural science and built for rigorous evaluation
              without overstepping clinical boundaries.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/prevention-model">
                Explore Our Prevention Model
              </ButtonLink>
              <ButtonLink to="/pilots" variant="secondary">
                Pilots &amp; Partnerships
              </ButtonLink>
            </div>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0" id="research-informed">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <h2>Our Approach to Evidence</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Mental wellbeing interventions are often deployed without sufficient
              attention to evidence, context, or ethics. Akili Sawa takes a
              learning-first approach designing programs that are informed by
              behavioural science, grounded in real-world conditions, and
              structured to support evaluation without exposing participants or
              partners to undue risk.
            </p>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="light" className="pt-0">
        <div className="space-y-6">
          <h2>What We Measure</h2>
          <p className="text-sm text-muted">
            Akili Sawa focuses on early, preventive indicators, including:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Engagement">
              Participation rates, completion, responsiveness
            </Card>
            <Card title="Behavioural Follow-Through">
              Consistency of skill application, adherence to program steps
            </Card>
            <Card title="Self-Reported Coping &amp; Resilience Indicators">
              Non-diagnostic, context-appropriate measures
            </Card>
            <Card title="Program Feasibility &amp; Acceptability">
              Usability in low-resource and fragile contexts
            </Card>
          </div>
          <p className="text-sm text-muted">
            Akili Sawa does not measure or claim clinical outcomes.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h2>Evaluation &amp; Learning Methods</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Akili Sawa collaborates with partners to assess program
              effectiveness using methods appropriate to context and scale.
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Pilot evaluations</li>
              <li>Quasi-experimental designs</li>
              <li>Randomized Controlled Trials (RCTs), where appropriate</li>
              <li>Qualitative learning and implementation research</li>
            </ul>
            <p className="text-sm text-muted">
              Evaluation design is aligned with ethical approvals, partner
              governance, and participant protection.
            </p>
          </div>
          <div className="space-y-4">
            <h2>Research &amp; Learning Partnerships</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Akili Sawa works with academic institutions, donors, and public
              agencies to design and deliver preventive mental wellbeing
              interventions that can be rigorously evaluated.
            </p>
            <p className="text-sm text-muted">
              Active collaborations are underway. Details are shared selectively
              and under appropriate confidentiality arrangements.
            </p>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <h2>Early Impact Signals</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              As a growing platform, Akili Sawa’s impact is currently reflected in:
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                Successful deployment of preventive interventions in real-world
                settings
              </li>
              <li>Engagement across low-bandwidth digital channels</li>
              <li>
                Institutional uptake through paid pilots and research collaborations
              </li>
            </ul>
            <p className="text-sm text-muted">
              Comprehensive impact metrics will be shared as pilots mature and
              evaluations are completed.
            </p>
          </div>
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl">What We Do Not Claim</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>We do not claim to treat mental illness</li>
                <li>We do not replace clinical services</li>
                <li>We do not promise crisis prevention</li>
                <li>We do not overgeneralise early findings</li>
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
                Ready to design evidence-forward pilots?
              </h2>
              <p className="text-sm text-muted">
                Partner with Akili Sawa on evaluation-ready prevention programs.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/pilots">Pilots &amp; Partnerships</ButtonLink>
              <ButtonLink to="/ethics" variant="secondary">
                Ethics &amp; Safeguarding
              </ButtonLink>
              <ButtonLink to="/for-organisations" variant="secondary">
                For Organisations
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

export default EvidenceImpact;
