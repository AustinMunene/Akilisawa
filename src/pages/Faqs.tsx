import Section from "../components/ui/Section";

const Faqs = () => {
  return (
    <div>
      <Section variant="light" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            FAQs
          </p>
          <h1 className="text-balance">Frequently Asked Questions</h1>
          <p className="text-base text-muted md:text-lg">
            Quick answers for partners, communities, and prospective
            collaborators.
          </p>
        </div>
      </Section>

      <Section variant="mid" className="pt-0">
        <div className="space-y-10 faq-panel">
          <div className="space-y-4">
            <h2>General &amp; Scope</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What is Akili Sawa?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>
                  Akili Sawa is a preventive mental wellbeing platform that
                  provides non-clinical, skills-based support designed to
                  strengthen coping, resilience, and behavioural follow-through.
                </p>
                <p>
                  Our work focuses on early support and prevention, with clear
                  referral pathways when additional care is required.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Is Akili Sawa a therapy or counselling service?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>No.</p>
                <p>
                  Akili Sawa does not provide therapy, counselling, diagnosis, or
                  clinical treatment.
                </p>
                <p>
                  We operate strictly within a preventive, non-clinical scope
                  and do not replace professional mental health services.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Who is Akili Sawa designed for?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Akili Sawa works with:</p>
                <ul className="space-y-2">
                  <li>Insurance and financial institutions</li>
                  <li>Employers and workforce programs</li>
                  <li>Researchers, donors, and academic institutions</li>
                  <li>
                    Public and development organisations working with
                    communities
                  </li>
                </ul>
                <p>
                  We do not provide services directly to individuals seeking
                  therapy or crisis support.
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-4">
            <h2>Prevention Model &amp; Delivery</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What does “preventive mental wellbeing” mean in practice?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>
                  Preventive mental wellbeing focuses on supporting individuals
                  before distress escalates into crisis or clinical need.
                </p>
                <p>This includes:</p>
                <ul className="space-y-2">
                  <li>Skills for coping with stress and uncertainty</li>
                  <li>Behavioural tools that support follow-through</li>
                  <li>Accessible, early support delivered at scale</li>
                </ul>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                How are Akili Sawa programs delivered?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Programs may be delivered through:</p>
                <ul className="space-y-2">
                  <li>
                    Low-bandwidth digital channels (e.g. SMS, WhatsApp)
                  </li>
                  <li>Group-based or facilitated formats</li>
                  <li>Community-grounded delivery models</li>
                </ul>
                <p>
                  Delivery methods are adapted to context, infrastructure, and
                  participant needs.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Does Akili Sawa work in low-resource or fragile contexts?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Yes.</p>
                <p>
                  Akili Sawa is intentionally designed for environments where
                  access to specialist care, connectivity, or infrastructure may
                  be limited.
                </p>
                <p>
                  Ethical safeguards, consent, and referral pathways are
                  prioritised in all contexts.
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-4">
            <h2>Ethics, Safeguarding &amp; Risk</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What happens if a participant shows signs of acute distress?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Akili Sawa has clear escalation and safeguarding protocols.</p>
                <p>When escalation thresholds are met:</p>
                <ul className="space-y-2">
                  <li>The preventive intervention pauses</li>
                  <li>Participants are redirected to appropriate external services</li>
                  <li>
                    Referrals align with partner systems (e.g. insurance, EAPs,
                    public health)
                  </li>
                </ul>
                <p>
                  Akili Sawa does not retain participants within its system once
                  escalation is triggered.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Does Akili Sawa provide crisis support?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>No.</p>
                <p>
                  Akili Sawa does not offer crisis intervention or emergency
                  services.
                </p>
                <p>
                  Participants requiring urgent support are directed to
                  appropriate local or partner-provided services.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                How is consent handled, especially in community programs?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Participation is:</p>
                <ul className="space-y-2">
                  <li>Voluntary</li>
                  <li>Based on clear, upfront information</li>
                  <li>Free to withdraw from at any time</li>
                </ul>
                <p>
                  No penalties are applied for non-participation or withdrawal.
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-4">
            <h2>Data, Privacy &amp; Confidentiality</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What data does Akili Sawa collect?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Akili Sawa follows data minimisation principles.</p>
                <p>Data collected is limited to what is necessary for:</p>
                <ul className="space-y-2">
                  <li>Program delivery</li>
                  <li>Engagement and learning</li>
                  <li>Ethical evaluation (where applicable)</li>
                </ul>
                <p>
                  Personal or clinical disclosures are not required to
                  participate.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                How is participant data protected?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Data is:</p>
                <ul className="space-y-2">
                  <li>Stored securely</li>
                  <li>Used only for agreed purposes</li>
                  <li>Shared only with authorised partners</li>
                  <li>
                    Anonymised or aggregated for research and reporting where
                    appropriate
                  </li>
                </ul>
                <p>
                  Akili Sawa complies with applicable data protection laws and
                  partner governance requirements.
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-4">
            <h2>Partnerships &amp; Pilots</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What does a typical pilot involve?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Pilots are:</p>
                <ul className="space-y-2">
                  <li>Time-bound</li>
                  <li>Clearly scoped</li>
                  <li>Designed to test feasibility, engagement, and outcomes</li>
                  <li>Aligned with ethical and safeguarding frameworks</li>
                </ul>
                <p>Details vary by partner and context.</p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Are pilots paid?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>
                  Many pilots are paid engagements, particularly with
                  institutional partners.
                </p>
                <p>
                  Commercial terms are discussed during scoping and shared under
                  appropriate confidentiality arrangements.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Why aren’t partner names or results publicly listed?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>
                  Akili Sawa works with partners under varying confidentiality
                  and governance requirements.
                </p>
                <p>
                  Specific partner details, operational data, and results are
                  shared selectively and under NDA, where appropriate.
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-4">
            <h2>Research &amp; Evidence</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Is Akili Sawa evidence-based?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>
                  Akili Sawa’s work is informed by behavioural science and
                  public health principles and designed to support rigorous
                  evaluation.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                Does Akili Sawa support research and RCTs?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Yes.</p>
                <p>
                  Akili Sawa collaborates with academic and research partners on
                  preventive mental wellbeing interventions and is
                  evaluation-ready, including for randomized controlled trials
                  (RCTs) where appropriate.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What outcomes does Akili Sawa measure?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>
                  Akili Sawa focuses on non-clinical, preventive indicators,
                  such as:
                </p>
                <ul className="space-y-2">
                  <li>Engagement and participation</li>
                  <li>Behavioural follow-through</li>
                  <li>Self-reported coping indicators</li>
                  <li>Program feasibility and acceptability</li>
                </ul>
                <p>Akili Sawa does not claim clinical outcomes.</p>
              </div>
            </details>
          </div>

          <div className="space-y-4">
            <h2>Getting in Touch</h2>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                How can my organisation engage with Akili Sawa?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Organisations can get in touch via the Contact page to request:</p>
                <ul className="space-y-2">
                  <li>A scoping conversation</li>
                  <li>A pilot or partnership discussion</li>
                  <li>A research collaboration</li>
                </ul>
                <p>
                  All enquiries are reviewed to ensure alignment with Akili
                  Sawa’s scope and approach.
                </p>
              </div>
            </details>
            <details className="rounded-card border border-line bg-surface p-5">
              <summary className="cursor-pointer text-sm font-semibold text-text">
                What types of enquiries are not appropriate?
              </summary>
              <div className="mt-3 space-y-3 text-sm text-muted">
                <p>Akili Sawa does not respond to:</p>
                <ul className="space-y-2">
                  <li>Requests for individual therapy or counselling</li>
                  <li>Crisis or emergency support enquiries</li>
                  <li>Clinical service procurement</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Faqs;
