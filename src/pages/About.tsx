import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";

const About = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
              Built for insurers, financial institutions, employers, researchers,
              and communities operating at scale.
            </p>
            <h1 className="text-balance">
              Preventive Mental Wellbeing, Ethically Delivered
            </h1>
          </div>
          <p className="max-w-2xl text-base text-muted md:text-lg">
            Akili Sawa is a preventive mental wellbeing platform providing
            scalable, non-clinical support to strengthen resilience, improve
            behavioural follow-through, and reduce downstream risk.
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
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Mission">
            To deliver non-clinical, preventive mental wellbeing support that
            strengthens individual and community resilience, while maintaining
            clear boundaries and referral pathways to formal care.
          </Card>
          <Card title="Vision">
            A world where mental distress is prevented before it escalates,
            communities are empowered, and organisations can deploy scalable,
            ethical mental wellbeing solutions.
          </Card>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-6">
          <h2>Core Values</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Prevention First">
              Intervene early, before distress escalates into crisis.
            </Card>
            <Card title="Ethical Delivery">
              Protect participants, partners, and communities.
            </Card>
            <Card title="Evidence &amp; Learning">
              All programs are research-informed and designed for rigorous
              evaluation.
            </Card>
            <Card title="Scalable &amp; Accessible">
              Solutions work across low-resource, fragile, and distributed
              contexts.
            </Card>
          </div>
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h2>Team &amp; Leadership</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg"></p>
            <ButtonLink to="/prevention-model" variant="tertiary">
              Explore Our Prevention Model
            </ButtonLink>
          </div>
          <div className="space-y-4">
            <h2>How We Deliver Impact</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Akili Sawa combines behaviourally informed design, low-bandwidth
              delivery, and community grounding to provide preventive mental
              wellbeing solutions. Ethical delivery, clear referral pathways, and
              scalable methods are embedded in every program.
            </p>
            <ButtonLink to="/pilots" variant="tertiary">
              Pilots &amp; Partnerships
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section variant="mid">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">Why Partners Trust Us</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>Institutional pilots underway</li>
                <li>Research collaborations</li>
                <li>Scalable, evidence-informed methodology</li>
              </ul>
            </div>
            <ButtonLink to="/contact">Request a Scoping Conversation</ButtonLink>
          </div>
        </Card>
      </Section>
    </div>
  );
};

export default About;
