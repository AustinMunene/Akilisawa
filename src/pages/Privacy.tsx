import Section from "../components/ui/Section";

const Privacy = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            Data Protection &amp; Privacy
          </p>
          <h1 className="text-balance">Data Protection &amp; Privacy</h1>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4 text-base text-muted md:text-lg">
          <p>
            Akili Sawa is committed to protecting the privacy, dignity, and
            personal data of individuals and organisations that engage with our
            preventive mental wellbeing services.
          </p>
          <p>
            Our approach to data protection is guided by three principles: data
            minimisation, purpose limitation, and ethical use. We design our
            systems to collect only what is necessary, use data responsibly, and
            avoid unnecessary sensitivity or intrusion.
          </p>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-4">
          <h2>Scope of data collected</h2>
          <p className="text-sm text-muted">
            Depending on the nature of engagement, Akili Sawa may collect
            limited data such as:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              Basic demographic or contextual information (e.g. age range, role,
              or region)
            </li>
            <li>
              Programme engagement data (e.g. participation, completion, or
              usage patterns)
            </li>
            <li>
              Non-clinical self-reported indicators used to assess engagement or
              general wellbeing trends
            </li>
          </ul>
          <p className="text-sm text-muted">Akili Sawa does not collect:</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Clinical or medical records</li>
            <li>Diagnostic information</li>
            <li>Therapy notes or counselling records</li>
            <li>Emergency or crisis-related data</li>
          </ul>
        </div>
      </Section>

      <Section variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>Purpose of data use</h2>
          <p className="text-sm text-muted">
            Data collected by Akili Sawa is used solely to:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Deliver preventive mental wellbeing programmes</li>
            <li>Monitor engagement and programme effectiveness</li>
            <li>Support learning, evaluation, and improvement</li>
            <li>
              Meet agreed reporting requirements with institutional or research
              partners, where applicable
            </li>
          </ul>
          <p className="text-sm text-muted">
            Where reporting is required, data is shared in aggregated or
            anonymised form.
          </p>
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="space-y-4">
          <h2>Data storage and security</h2>
          <p className="text-sm text-muted">
            Akili Sawa applies appropriate technical and organisational measures
            to protect data, including:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Secure data storage</li>
            <li>Restricted access to authorised personnel only</li>
            <li>
              Use of trusted technology providers under confidentiality
              agreements
            </li>
          </ul>
          <p className="text-sm text-muted">
            Where feasible, personal data is anonymised or de-identified to
            reduce risk.
          </p>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4">
          <h2>Data sharing and third parties</h2>
          <p className="text-sm text-muted">
            Akili Sawa does not sell personal data.
          </p>
          <p className="text-sm text-muted">Data may be shared with:</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              Institutional or research partners in anonymised or aggregated form
            </li>
            <li>
              Technology providers supporting programme delivery, under strict
              data protection and confidentiality obligations
            </li>
          </ul>
          <p className="text-sm text-muted">
            Any data sharing is limited to what is necessary for the stated
            purpose.
          </p>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-4">
          <h2>User rights and choice</h2>
          <p className="text-sm text-muted">Participants and partners have the right to:</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Request access to their personal data</li>
            <li>Request correction or deletion of data where applicable</li>
            <li>Withdraw from programmes without penalty</li>
          </ul>
          <p className="text-sm text-muted">
            Participation in Akili Sawa programmes is voluntary, and consent is
            respected throughout engagement.
          </p>
        </div>
      </Section>

      <Section variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>Compliance and ethics</h2>
          <p className="text-sm text-muted">
            Akili Sawa aligns its data practices with applicable data protection
            laws and ethical standards relevant to the jurisdictions in which it
            operates, including Kenya and international research collaborations.
          </p>
          <p className="text-sm text-muted">
            We regularly review our data practices to ensure they remain
            appropriate as our programmes evolve.
          </p>
          <p className="text-sm text-muted">
            For questions regarding data protection or privacy, please contact
            us through the Contact page.
          </p>
        </div>
      </Section>
    </div>
  );
};

export default Privacy;
