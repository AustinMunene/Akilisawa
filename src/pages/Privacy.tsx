import Section from "../components/ui/Section";

const Privacy = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-dark dark:text-brand">
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
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
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
              <li>Clinical or medical records through this website</li>
              <li>Diagnostic information as a clinical record</li>
              <li>Therapy notes or counselling records</li>
            </ul>
          </div>
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
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h2>Data storage and security</h2>
            <p className="text-sm text-muted">
              Akili Sawa works to apply technical and organisational measures
              appropriate to each service. Measures for the Sawa AI preview depend
              on the hosting and inference providers and must be confirmed before
              real-user conversations are enabled.
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Secure data storage</li>
              <li>Restricted access to authorised personnel only</li>
              <li>
                Technology providers selected for each service, subject to their
                applicable terms
              </li>
            </ul>
            <p className="text-sm text-muted">
              Where feasible, personal data is anonymised or de-identified to
              reduce risk.
            </p>
          </div>
          <div className="space-y-4">
            <h2>Data sharing and third parties</h2>
            <p className="text-sm text-muted">
              Akili Sawa does not sell personal data.
            </p>
            <p className="text-sm text-muted">
              Depending on the service used, data may be shared with:
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                Institutional or research partners in anonymised or aggregated form
              </li>
              <li>
                Technology providers supporting programme delivery, under their
                applicable privacy and data processing terms
              </li>
            </ul>
            <p className="text-sm text-muted">
              We aim to limit sharing to what is necessary for the stated purpose.
              Provider terms, processing location, and retention periods vary by
              service and will be disclosed for the Sawa AI preview before it is
              offered for real-user conversations.
            </p>
          </div>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="max-w-3xl space-y-4">
          <h2>Sawa AI preview</h2>
          <p className="text-sm text-muted">
            The conversation transcript is held in this browser tab. To generate a reply, the current message and recent conversation history are sent to the AI inference provider configured for the preview. The provider name, processing location and applicable retention terms must be confirmed and published before real-user conversations are enabled. Do not use the preview to share information you would not want processed by an external AI service.
          </p>
          <p className="text-sm text-muted">
            The age check is performed in your browser. Your date of birth is not sent to Akili Sawa or stored; this tab stores only that the age and consent steps were completed.
          </p>
          <p className="text-sm text-muted">
            If a high-severity safety concern is detected, the message that raised it may be sent to Akili Sawa's designated support inbox when that feature is configured. Email retention depends on that inbox's settings. The inbox is not monitored for emergencies and Akili Sawa cannot guarantee an immediate response. The full conversation is not sent.
          </p>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h2>User rights and choice</h2>
            <p className="text-sm text-muted">
              Participants and partners have the right to:
            </p>
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
        </div>
      </Section>
    </div>
  );
};

export default Privacy;
