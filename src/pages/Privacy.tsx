import SawaPrivacySection from "../components/sawa/SawaPrivacySection";
import Section from "../components/ui/Section";

const Privacy = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div id="privacy-notice" className="max-w-3xl scroll-mt-24 space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-dark dark:text-brand">
            Data Protection &amp; Privacy
          </p>
          <h1 className="text-balance">Data Protection &amp; Privacy</h1>
        </div>
        <div className="mt-8 max-w-3xl rounded-3xl border border-brand-line bg-brand-soft/60 p-6 dark:bg-panel/70">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark dark:text-brand">
            Registered data controller
          </p>
          <p className="mt-3 text-base text-text md:text-lg">
            Akili Sawa is a registered data controller with the Office of the
            Data Protection Commissioner.
          </p>
          <p className="mt-3 text-sm text-muted">
            Our certificate of registration, issued under the Data Protection
            Act, 2019, records Akili Sawa in the category of data controller and
            confirms that personal data is processed lawfully, fairly and
            securely. The certificate can be shared with partners, participants
            and regulators on request.
          </p>
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
            <p className="text-sm text-muted">
              Through this website, Akili Sawa does not create:
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Clinical or medical records</li>
              <li>Diagnostic records</li>
              <li>Therapy or counselling notes</li>
            </ul>
            <p className="text-sm text-muted">
              Sawa AI messages are not clinical records, but you choose what to
              share. Do not share information you would not want processed by the
              configured AI provider.
            </p>
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
              For Sawa AI, the conversation transcript is held in this browser
              tab, not in an Akili Sawa account. Messages sent to the configured
              AI provider, and any flagged excerpt sent to the support inbox, are
              handled under the relevant provider or inbox terms.
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Access is restricted to authorised personnel</li>
              <li>
                Technology providers are selected for each service, subject to
                their applicable terms
              </li>
              <li>
                Technical and organisational measures are reviewed as the service
                changes
              </li>
            </ul>
            <p className="text-sm text-muted">
              No system can guarantee absolute security. Where feasible, personal
              data is anonymised or de-identified to reduce risk.
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
              For Sawa AI, the current message and recent conversation history
              are sent to the AI provider configured for the service so that it
              can generate a reply. A high-severity safety concern may also send
              the flagged message to the designated support inbox. The full
              conversation is not sent there.
            </p>
            <p className="text-sm text-muted">
              Provider terms, processing location and retention periods vary.
              Akili Sawa does not control how a provider retains data under its
              own terms. Current provider details are available on request.
            </p>
          </div>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <SawaPrivacySection />
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
              Akili Sawa is a registered data controller with the Office of the
              Data Protection Commissioner, the independent regulator established
              under Kenya&apos;s Data Protection Act, 2019. Our certificate of
              registration records Akili Sawa in the category of data
              controller and is available on request.
            </p>
            <p className="text-sm text-muted">
              Beyond registration, we align our data practices with applicable
              data protection laws and ethical standards relevant to the
              jurisdictions in which we operate, including Kenya and
              international research collaborations.
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
