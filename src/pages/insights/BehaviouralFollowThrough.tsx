import { Link } from "react-router-dom";
import SectionBackground from "../../components/layout/SectionBackground";

const BehaviouralFollowThrough = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
            INSIGHT
          </p>
          <h1 className="text-balance">
            Behavioural Follow-Through in Low-Intensity Interventions
          </h1>
          <Link to="/insights" className="text-sm text-accent">
            Back to Insights →
          </Link>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="max-w-3xl space-y-6 text-sm text-muted md:text-base leading-relaxed">
          <p>
            Preventive mental wellbeing interventions are often designed with
            sound intentions but limited impact. A common challenge is not
            awareness or motivation, but sustained follow-through. Participants
            may understand recommended practices, agree with their value, and
            initially engage, yet fail to maintain consistent participation over
            time.
          </p>
          <p>
            This gap between intention and action is particularly pronounced in
            low-intensity, scalable interventions that operate outside clinical
            settings.
          </p>

          <h2 className="text-lg font-semibold text-text">The follow-through problem</h2>
          <p>Low-intensity interventions typically rely on:</p>
          <ul className="space-y-2">
            <li>Self-guided engagement</li>
            <li>Limited human facilitation</li>
            <li>Short, modular content</li>
            <li>Remote or asynchronous delivery</li>
          </ul>
          <p>
            While these features enable scale and cost-efficiency, they also
            increase reliance on individual self-regulation. Without deliberate
            design for follow-through, engagement often declines rapidly after
            initial exposure.
          </p>
          <p>
            In preventive mental wellbeing, reduced engagement does not
            necessarily indicate lack of need. It more often reflects competing
            priorities, cognitive load, environmental stressors, or limited
            behavioural reinforcement.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Behavioural design as a delivery requirement
          </h2>
          <p>
            Behavioural follow-through should be treated as a core delivery
            requirement rather than an optional enhancement.
          </p>
          <p>Behaviourally informed interventions account for:</p>
          <ul className="space-y-2">
            <li>Limited attention and time</li>
            <li>Habit formation challenges</li>
            <li>Inconsistent motivation</li>
            <li>Environmental constraints</li>
          </ul>
          <p>
            Rather than assuming rational, consistent engagement, these
            interventions are designed around how people actually behave in
            real-world conditions.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Practical design considerations
          </h2>
          <p>
            In preventive mental wellbeing programmes, behavioural follow-through
            can be supported through:
          </p>
          <ul className="space-y-2">
            <li>Short, structured interactions that reduce cognitive burden</li>
            <li>Clear sequencing that guides participants step-by-step</li>
            <li>Repetition and reinforcement of key practices</li>
            <li>Timely prompts aligned with daily routines</li>
            <li>Friction reduction in access and participation</li>
          </ul>
          <p>
            These elements are particularly important in low-resource or
            high-stress contexts, where sustained attention and discretionary
            time are limited.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Measuring engagement meaningfully
          </h2>
          <p>
            Traditional success metrics often focus on enrolment or initial
            uptake. In preventive interventions, these metrics are insufficient.
          </p>
          <p>More meaningful indicators include:</p>
          <ul className="space-y-2">
            <li>Consistency of participation over time</li>
            <li>Completion of key programme components</li>
            <li>Return engagement after interruptions</li>
            <li>Behavioural signals associated with habit formation</li>
          </ul>
          <p>
            These measures provide better insight into whether an intervention is
            likely to influence longer-term outcomes.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Relevance to scalable delivery
          </h2>
          <p>
            For institutions such as insurers, employers, universities, and
            public systems, behavioural follow-through directly affects return on
            investment.
          </p>
          <p>Interventions that fail to account for follow-through may:</p>
          <ul className="space-y-2">
            <li>Show low sustained engagement</li>
            <li>Deliver limited downstream impact</li>
            <li>Underperform despite strong content</li>
          </ul>
          <p>
            Designing for behavioural continuity improves the likelihood that
            preventive programmes translate into measurable value, even at low
            per-participant cost.
          </p>

          <h2 className="text-lg font-semibold text-text">
            Implications for preventive mental wellbeing systems
          </h2>
          <p>
            Low-intensity delivery does not imply low design rigour. On the
            contrary, scalable preventive mental wellbeing requires:
          </p>
          <ul className="space-y-2">
            <li>Careful attention to behavioural constraints</li>
            <li>Iterative testing and refinement</li>
            <li>Alignment between content, delivery channel, and context</li>
          </ul>
          <p>
            By treating follow-through as a central design challenge, preventive
            interventions can remain both scalable and effective without
            increasing clinical intensity.
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
      </SectionBackground>
    </div>
  );
};

export default BehaviouralFollowThrough;
