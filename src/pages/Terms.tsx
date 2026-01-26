import Section from "../components/ui/Section";

const Terms = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            Terms of Use
          </p>
          <h1 className="text-balance">Terms of Use</h1>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4 text-base text-muted md:text-lg">
          <p>
            These Terms of Use govern access to and use of Akili Sawa’s website,
            content, platforms, and preventive mental wellbeing services.
          </p>
          <p>
            By accessing or using Akili Sawa services, you agree to these Terms.
          </p>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-4">
          <h2>Nature of Akili Sawa services</h2>
          <p className="text-sm text-muted">
            Akili Sawa provides non-clinical, preventive mental wellbeing
            support designed to support awareness, skills development, and
            behavioural practices related to everyday mental wellbeing.
          </p>
          <p className="text-sm text-muted">Akili Sawa services:</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Are preventive and educational in nature</li>
            <li>Do not involve diagnosis, treatment, or therapy</li>
            <li>Are not intended for crisis or emergency situations</li>
          </ul>
          <p className="text-sm text-muted">
            Akili Sawa does not provide medical, psychological, or psychiatric
            care.
          </p>
        </div>
      </Section>

      <Section variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>No professional or therapeutic relationship</h2>
          <p className="text-sm text-muted">
            Use of Akili Sawa services does not create:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>A therapist–client relationship</li>
            <li>A doctor–patient relationship</li>
            <li>Any form of clinical duty of care</li>
          </ul>
          <p className="text-sm text-muted">
            Information and content provided through Akili Sawa should not be
            relied upon as a substitute for professional medical or mental
            health advice, diagnosis, or treatment.
          </p>
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="space-y-4">
          <h2>User responsibilities</h2>
          <p className="text-sm text-muted">Users agree to:</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Use Akili Sawa services only for their intended preventive purpose</li>
            <li>
              Seek appropriate professional or emergency assistance when
              experiencing distress that requires clinical or urgent support
            </li>
            <li>
              Not rely on Akili Sawa services as a sole source of mental health
              care
            </li>
          </ul>
          <p className="text-sm text-muted">
            Akili Sawa is not responsible for outcomes arising from failure to
            seek appropriate professional support.
          </p>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4">
          <h2>Limitations of liability</h2>
          <p className="text-sm text-muted">
            To the extent permitted by law, Akili Sawa is not liable for:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Decisions or actions taken based on use of preventive content</li>
            <li>
              Outcomes arising from misuse or misinterpretation of information
            </li>
            <li>Any indirect, incidental, or consequential damages</li>
          </ul>
          <p className="text-sm text-muted">
            Use of Akili Sawa services is at the user’s own discretion and risk.
          </p>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <div className="space-y-4">
          <h2>Institutional and partner-based use</h2>
          <p className="text-sm text-muted">
            Where Akili Sawa services are accessed through:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            <li>Employers</li>
            <li>Insurers</li>
            <li>Universities</li>
            <li>Research or delivery partners</li>
          </ul>
          <p className="text-sm text-muted">
            Additional terms, safeguards, or data handling arrangements may
            apply. These will be communicated separately and take precedence
            where relevant.
          </p>
        </div>
      </Section>

      <Section variant="dark-soft" className="pt-0">
        <div className="space-y-4">
          <h2>Intellectual property</h2>
          <p className="text-sm text-muted">
            All content, materials, and intellectual property made available
            through Akili Sawa remain the property of Akili Sawa or its
            licensors, unless otherwise stated.
          </p>
          <p className="text-sm text-muted">
            Users may not reproduce, distribute, or modify content without prior
            written permission.
          </p>
        </div>
      </Section>

      <Section variant="soft" className="pt-0">
        <div className="space-y-4">
          <h2>Changes to services and terms</h2>
          <p className="text-sm text-muted">
            Akili Sawa may update its services or these Terms of Use from time
            to time to reflect changes in delivery, partnerships, or legal
            requirements.
          </p>
          <p className="text-sm text-muted">
            Continued use of the website or services after updates constitutes
            acceptance of the revised terms.
          </p>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-4">
          <h2>Governing law</h2>
          <p className="text-sm text-muted">
            These Terms of Use are governed by applicable laws in the
            jurisdictions in which Akili Sawa operates.
          </p>
          <p className="text-sm text-muted">
            For questions regarding these terms, please contact us through the
            Contact page.
          </p>
        </div>
      </Section>
    </div>
  );
};

export default Terms;
