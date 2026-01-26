import { Link } from "react-router-dom";
import SectionBackground from "../components/layout/SectionBackground";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import ImagePanel from "../components/ui/ImagePanel";

const Insights = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            Insights
          </p>
          <h1 className="text-balance">Insights</h1>
          <p className="text-base text-muted md:text-lg">
            Analytical perspectives informing Akili Sawa’s preventive mental
            wellbeing approach.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-3xl space-y-4 text-base text-muted md:text-lg">
            <p>
              The Insights section presents Akili Sawa’s analytical perspectives on
              preventive mental wellbeing, behaviourally informed delivery, and
              ethical intervention at scale.
            </p>
            <p>
              These pieces are written to support institutional partners, research
              collaborators, and system designers seeking to understand how
              preventive mental wellbeing can be delivered responsibly, before
              crisis, and within clearly defined boundaries.
            </p>
            <p>
              Insights are not intended as clinical guidance, individual advice, or
              crisis support.
            </p>
          </div>
          <ImagePanel
            src="https://akilisawa.com/wp-content/uploads/2026/01/not-given.jpeg"
            alt="Insights illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="light" className="pt-0">
        <div className="space-y-8">
          <h2>Core Insights</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text">
                  Preventive Mental Wellbeing as a Distinct Layer of Care
                </h3>
                <p className="text-sm text-muted">
                  An examination of prevention as a separate category of mental
                  wellbeing support, distinct from therapy, diagnosis, and crisis
                  response. This insight outlines how prevention functions within
                  systems such as insurance, employment, education, and public
                  programmes.
                </p>
                <ButtonLink
                  to="/insights/preventive-layer-of-care"
                  variant="tertiary"
                >
                  Read insight →
                </ButtonLink>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text">
                  Behavioural Follow-Through in Low-Intensity Interventions
                </h3>
                <p className="text-sm text-muted">
                  A practical look at why many wellbeing interventions fail to
                  translate intention into action, and how behaviourally informed
                  design can improve engagement, continuity, and outcomes in
                  low-cost, scalable programmes.
                </p>
                <ButtonLink
                  to="/insights/behavioural-follow-through"
                  variant="tertiary"
                >
                  Read insight →
                </ButtonLink>
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text">
                  Ethical Delivery in Fragile and Low-Resource Contexts
                </h3>
                <p className="text-sm text-muted">
                  A discussion of ethical boundaries, safeguards, and escalation
                  pathways required when delivering preventive mental wellbeing
                  support in contexts marked by economic stress, displacement,
                  conflict exposure, or limited access to formal care.
                </p>
                <ButtonLink
                  to="/insights/ethical-delivery-fragile-contexts"
                  variant="tertiary"
                >
                  Read insight →
                </ButtonLink>
              </div>
            </Card>
          </div>
          <p className="text-xs text-muted">
            Insights are not clinical guidance, individual advice, or crisis
            support.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-4">
            <h2>How to Read These Insights</h2>
            <p className="text-sm text-muted">
              Insights are developed selectively, informed by learning from
              pilots, research collaborations, and system design work.
            </p>
            <p className="text-sm text-muted">They are intended to:</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Clarify Akili Sawa’s prevention-first positioning</li>
              <li>Support informed partnership discussions</li>
              <li>Provide shared language for institutional decision-making</li>
            </ul>
            <p className="text-sm text-muted">
              Insights are updated intentionally rather than frequently, and are
              designed to remain relevant over time.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Related
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/prevention-model"
                className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
              >
                Our Prevention Model
              </Link>
              <Link
                to="/evidence-impact"
                className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
              >
                Evidence &amp; Impact
              </Link>
              <Link
                to="/ethics"
                className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
              >
                Ethics &amp; Safeguarding
              </Link>
            </div>
          </div>
        </div>
      </SectionBackground>
    </div>
  );
};

export default Insights;
