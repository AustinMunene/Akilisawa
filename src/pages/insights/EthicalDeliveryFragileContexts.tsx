import { Link } from "react-router-dom";
import SectionBackground from "../../components/layout/SectionBackground";

const EthicalDeliveryFragileContexts = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            INSIGHT
          </p>
          <h1 className="text-balance">
            Ethical Delivery in Fragile and Low-Resource Contexts
          </h1>
          <Link to="/insights" className="text-sm text-accent">
            Back to Insights →
          </Link>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="max-w-3xl space-y-6 text-sm text-muted md:text-base leading-relaxed">
          <p>
            Preventive mental wellbeing interventions are increasingly delivered
            in contexts marked by economic stress, displacement, conflict
            exposure, and limited access to formal health systems. While
            prevention-oriented approaches can offer meaningful support in such
            settings, they also carry specific ethical risks if not carefully
            designed and governed.
          </p>
          <p>
            Ethical delivery in these contexts requires clear boundaries,
            appropriate safeguards, and realistic escalation pathways that
            reflect local constraints.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Contextual risk considerations
          </h2>
          <p>Fragile and low-resource contexts are often characterised by:</p>
          <ul className="space-y-2">
            <li>High exposure to chronic stressors</li>
            <li>Limited availability of clinical or emergency mental health services</li>
            <li>Power asymmetries between providers and participants</li>
            <li>
              Elevated vulnerability due to displacement, insecurity, or economic
              instability
            </li>
          </ul>
          <p>
            In these environments, even non-clinical interventions can have
            unintended consequences if they overreach or create expectations that
            cannot be safely met.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Defining ethical scope boundaries
          </h2>
          <p>
            A central ethical requirement is clarity of scope. Preventive mental
            wellbeing support must be clearly distinguished from:
          </p>
          <ul className="space-y-2">
            <li>Therapy or counselling</li>
            <li>Clinical assessment or diagnosis</li>
            <li>Crisis or trauma response</li>
          </ul>
          <p>
            Participants should understand what the intervention can and cannot
            provide. Ambiguity increases the risk of harm, particularly where
            alternative support options are limited.
          </p>
          <p>Ethical delivery prioritises transparency over perceived completeness.</p>

          <h2 className="text-lg font-semibold text-text">
            Avoiding extraction and over-instrumentation
          </h2>
          <p>
            In research-informed or data-driven programmes, there is a risk of
            extracting information from participants without proportional
            benefit.
          </p>
          <p>Ethical preventive delivery requires:</p>
          <ul className="space-y-2">
            <li>Minimising data collection to what is necessary</li>
            <li>Avoiding probing for traumatic experiences</li>
            <li>Ensuring that participation does not require emotional disclosure</li>
          </ul>
          <p>
            Interventions should focus on skills, awareness, and behaviour, rather
            than narrative or exposure-based approaches that may retraumatise or
            burden participants.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Safeguards and escalation pathways
          </h2>
          <p>
            Even preventive programmes must anticipate the possibility of
            elevated distress. Ethical delivery includes:
          </p>
          <ul className="space-y-2">
            <li>Clear guidance on when participants should seek additional support</li>
            <li>
              Context-appropriate referral pathways aligned with local services or
              institutional partners
            </li>
            <li>Explicit acknowledgement of limits where services are unavailable</li>
          </ul>
          <p>
            Importantly, preventive systems should not attempt to substitute for
            absent clinical infrastructure. Where escalation options are limited,
            design choices must err on the side of caution and non-intrusion.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Partner alignment and shared responsibility
          </h2>
          <p>
            In fragile contexts, no single organisation can hold full
            safeguarding responsibility. Ethical delivery requires:
          </p>
          <ul className="space-y-2">
            <li>Alignment with local partners, institutions, or community structures</li>
            <li>Clear allocation of safeguarding and referral roles</li>
            <li>Agreement on escalation protocols before programme launch</li>
          </ul>
          <p>
            This shared responsibility model reduces risk and improves contextual
            appropriateness.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Implications for scalable prevention
          </h2>
          <p>
            Ethical restraint is not a barrier to scale. In fact, it enables it.
            Preventive mental wellbeing interventions that:
          </p>
          <ul className="space-y-2">
            <li>Respect scope boundaries</li>
            <li>Minimise risk exposure</li>
            <li>Adapt to contextual realities</li>
          </ul>
          <p>
            are more likely to be sustainable, trusted, and appropriate across
            diverse settings.
          </p>
          <p>
            Ethical delivery is therefore not an add-on, but a core design
            requirement for preventive mental wellbeing at scale.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="max-w-3xl space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Cross-links
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/prevention-model"
              className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
            >
              Our Prevention Model
            </Link>
            <Link
              to="/safeguarding-framework"
              className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
            >
              Safeguarding Framework
            </Link>
            <Link
              to="/evidence-impact"
              className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
            >
              Evidence &amp; Impact
            </Link>
          </div>
        </div>
      </SectionBackground>
    </div>
  );
};

export default EthicalDeliveryFragileContexts;
