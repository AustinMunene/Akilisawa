import { Link } from "react-router-dom";
import SectionBackground from "../../components/layout/SectionBackground";

const PreventiveLayerOfCare = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            INSIGHT
          </p>
          <h1 className="text-balance">
            Preventive Mental Wellbeing as a Distinct Layer of Care
          </h1>
          <Link to="/insights" className="text-sm text-accent">
            Back to Insights →
          </Link>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="max-w-3xl space-y-6 text-sm text-muted md:text-base leading-relaxed">
          <p>
            Mental health support systems are commonly structured around clinical
            diagnosis and crisis response. Funding, service delivery, and
            evaluation metrics tend to focus on outcomes after distress has
            already reached a level that requires professional or medical
            intervention.
          </p>
          <p>
            Preventive mental wellbeing operates at an earlier stage. It focuses
            on supporting individuals before distress escalates to a level that
            requires clinical care, with the aim of reducing the frequency,
            intensity, or duration of future mental health challenges.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Prevention as a separate intervention category
          </h2>
          <p>
            Preventive mental wellbeing should be understood as a separate category
            of intervention, distinct from both clinical treatment and emergency
            response.
          </p>
          <p>
            It does not involve diagnosis, treatment, or therapeutic relationships.
            Instead, it focuses on:
          </p>
          <ul className="space-y-2">
            <li>Skills development related to stress management and emotional regulation</li>
            <li>Awareness of early warning signals</li>
            <li>Behavioural practices that support coping and problem-solving</li>
            <li>Normalisation of early help-seeking and self-regulation</li>
          </ul>
          <p>
            These interventions can be delivered without positioning participants
            as patients and without requiring clinical infrastructure.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Limitations of crisis-led delivery models
          </h2>
          <p>
            Crisis-led models are essential for individuals in acute need. However,
            when they function as the primary entry point into mental health
            support systems, several limitations emerge:
          </p>
          <ul className="space-y-2">
            <li>Engagement occurs late, after functional impairment is already present</li>
            <li>Interventions are higher-cost and resource-intensive</li>
            <li>System capacity is often constrained</li>
            <li>Opportunities for early risk mitigation are limited</li>
          </ul>
          <p>
            From an institutional perspective, these models tend to address
            consequences rather than contributing factors.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Prevention as risk mitigation
          </h2>
          <p>
            Preventive mental wellbeing aligns with risk mitigation frameworks
            commonly used in insurance, employment, and public policy contexts.
          </p>
          <p>
            Rather than categorising individuals by diagnosis, prevention addresses
            mental wellbeing as a dynamic condition influenced by:
          </p>
          <ul className="space-y-2">
            <li>Exposure to stressors</li>
            <li>Environmental and economic uncertainty</li>
            <li>Work and livelihood pressures</li>
            <li>Social and contextual factors</li>
          </ul>
          <p>
            The objective is not to eliminate distress, but to reduce the
            likelihood that stressors escalate into more severe or persistent
            impairment.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Relevance to institutional delivery
          </h2>
          <p>For organisations operating at scale, preventive approaches offer:</p>
          <ul className="space-y-2">
            <li>Lower per-participant delivery costs</li>
            <li>Earlier engagement with at-risk populations</li>
            <li>Reduced reliance on specialist services</li>
            <li>Compatibility with existing health, insurance, or workforce systems</li>
          </ul>
          <p>
            Preventive interventions can be layered alongside clinical and
            insurance-based services without replacing them.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Boundaries and safeguards
          </h2>
          <p>
            Preventive mental wellbeing requires clearly defined boundaries to
            remain ethical and effective.
          </p>
          <p>It does not include:</p>
          <ul className="space-y-2">
            <li>Clinical assessment or diagnosis</li>
            <li>Crisis intervention or emergency response</li>
            <li>Substitution for licensed mental health services</li>
          </ul>
          <p>Effective preventive systems must also include:</p>
          <ul className="space-y-2">
            <li>Clear referral pathways to higher levels of care</li>
            <li>Protocols for risk escalation</li>
            <li>Transparency about scope and limitations</li>
          </ul>

          <h2 className="text-lg font-semibold text-text">
            Implications for system design
          </h2>
          <p>
            When preventive mental wellbeing is treated as a distinct intervention
            layer, it allows systems to:
          </p>
          <ul className="space-y-2">
            <li>Allocate resources more efficiently</li>
            <li>Reduce pressure on crisis services</li>
            <li>Support broader populations without medicalisation</li>
            <li>Evaluate impact using appropriate, non-clinical metrics</li>
          </ul>
          <p>
            This framing enables preventive mental wellbeing to be integrated
            responsibly into institutional settings without overextending its
            mandate.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="max-w-3xl space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Next
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/prevention-model"
              className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
            >
              Our Prevention Model
            </Link>
            <Link
              to="/insights/behavioural-follow-through"
              className="rounded-full bg-panel/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-float"
            >
              Why Behavioural Follow-Through Matters
            </Link>
          </div>
        </div>
      </SectionBackground>
    </div>
  );
};

export default PreventiveLayerOfCare;
