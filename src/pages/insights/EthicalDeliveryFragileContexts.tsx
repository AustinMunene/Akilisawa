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
            Preventive mental wellbeing delivery in fragile or low-resource
            settings requires heightened ethical safeguards. These contexts are
            often shaped by economic stress, displacement, conflict exposure, or
            limited access to formal care.
          </p>
          <p>
            Akili Sawa’s model emphasises consent, low-burden participation, and
            clear escalation pathways that align with local systems where
            available. Programs are designed to avoid coercive participation and
            do not require disclosure of sensitive or clinical information.
          </p>
          <p>
            Ethical delivery is inseparable from practical delivery. Clear
            boundaries, transparent scope, and referral protocols are essential
            to maintain trust and protect participants.
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

export default EthicalDeliveryFragileContexts;
