import Section from "../components/ui/Section";

const SafeguardingFramework = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            Safeguarding Framework
          </p>
          <h1 className="text-balance">Safeguarding Framework</h1>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4 text-base text-muted md:text-lg">
          <p>
            Akili Sawa is committed to delivering preventive mental wellbeing
            support in a way that is ethical, responsible, and appropriate to
            the contexts in which we operate.
          </p>
          <p>
            Our safeguarding approach recognises that mental wellbeing
            interventions, even when non-clinical, must be designed with clear
            boundaries, risk awareness, and escalation pathways — particularly
            when working with diverse, low-resource, or fragile settings.
          </p>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-4">
          <h2>Scope of support</h2>
          <p className="text-sm text-muted">
            Akili Sawa provides non-clinical, preventive mental wellbeing
            support. Our services do not include:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Therapy or counselling</li>
            <li>Clinical assessment or diagnosis</li>
            <li>Crisis or emergency response</li>
            <li>Management of acute mental health conditions</li>
          </ul>
          <p className="text-sm text-muted">
            All programmes are designed to operate before crisis and are not a
            substitute for professional mental health or medical services.
          </p>
        </div>
      </Section>

      <Section variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>Design principles</h2>
          <p className="text-sm text-muted">
            Safeguarding is embedded at the design stage of all Akili Sawa
            programmes. This includes:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Use of light-touch, skills-based content</li>
            <li>
              Avoidance of content that encourages disclosure of traumatic
              experiences
            </li>
            <li>Clear communication of programme scope and limitations</li>
            <li>Respect for participant autonomy and consent</li>
          </ul>
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="space-y-4">
          <h2>Identification of elevated risk</h2>
          <p className="text-sm text-muted">
            While Akili Sawa does not actively assess or diagnose mental health
            conditions, we recognise that some participants may experience
            heightened vulnerability. Our systems are designed to:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Minimise emotional risk through preventive framing</li>
            <li>Monitor non-clinical engagement signals where appropriate</li>
            <li>Avoid probing for sensitive or traumatic information</li>
          </ul>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4">
          <h2>Escalation and referral</h2>
          <p className="text-sm text-muted">
            Where indicators suggest that a participant may require higher-level
            or immediate support:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              Participants are provided with guidance to seek appropriate
              professional or emergency services
            </li>
            <li>
              Escalation pathways are aligned with local, institutional, or
              partner-provided support systems
            </li>
            <li>Akili Sawa does not attempt to manage crisis situations internally</li>
          </ul>
          <p className="text-sm text-muted">
            Referral mechanisms are adapted to context and developed in
            collaboration with partners.
          </p>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-4">
          <h2>Vulnerable and fragile contexts</h2>
          <p className="text-sm text-muted">
            For programmes involving:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Young people</li>
            <li>Conflict-affected or displacement-affected communities</li>
            <li>Economically or socially vulnerable populations</li>
          </ul>
          <p className="text-sm text-muted">
            Additional safeguards are applied, including:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Context-specific risk assessments</li>
            <li>Partner alignment on safeguarding responsibilities</li>
            <li>Ethical oversight where required</li>
          </ul>
        </div>
      </Section>

      <Section variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>Staff and partner responsibilities</h2>
          <p className="text-sm text-muted">
            All staff and delivery partners are expected to:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Operate strictly within the defined scope of services</li>
            <li>Adhere to safeguarding and ethical guidelines</li>
            <li>Escalate concerns in line with agreed protocols</li>
            <li>Respect confidentiality and participant dignity</li>
          </ul>
          <p className="text-sm text-muted">
            Safeguarding responsibilities are shared and clearly defined in all
            partnerships.
          </p>
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="space-y-4">
          <h2>Review and accountability</h2>
          <p className="text-sm text-muted">
            The Safeguarding Framework is reviewed periodically to ensure it
            remains appropriate as programmes evolve, contexts change, and new
            partnerships are formed.
          </p>
          <p className="text-sm text-muted">
            Feedback from partners and participants is used to strengthen
            safeguarding practices over time.
          </p>
          <p className="text-sm text-muted">
            For safeguarding-related questions or concerns, please contact us
            through the Contact page.
          </p>
        </div>
      </Section>
    </div>
  );
};

export default SafeguardingFramework;
