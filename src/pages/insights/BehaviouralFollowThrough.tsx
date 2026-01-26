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
            Many mental wellbeing programmes succeed in raising awareness but
            struggle to translate intention into sustained action. Behavioural
            follow-through is often the limiting factor for outcomes, especially
            in low-intensity, low-cost interventions.
          </p>
          <p>
            Akili Sawa’s prevention model is designed to reduce friction between
            intent and action by applying behaviourally informed design patterns,
            reinforcement loops, and simple decision prompts.
          </p>
          <p>
            Effective follow-through support prioritises continuity, clarity,
            and low-burden engagement, ensuring that participants can apply
            skills in real contexts without requiring clinical infrastructure.
          </p>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="max-w-3xl space-y-4">
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
      </SectionBackground>
    </div>
  );
};

export default BehaviouralFollowThrough;
