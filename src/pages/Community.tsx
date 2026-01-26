import SectionBackground from "../components/layout/SectionBackground";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import ImagePanel from "../components/ui/ImagePanel";
import { images } from "../lib/images";

const Community = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
              Participation is voluntary. Support is non-clinical. Safety comes
              first.
            </p>
            <h1 className="text-balance">Community-Grounded by Design</h1>
          </div>
          <p className="max-w-2xl text-base text-muted md:text-lg">
            Akili Sawa works alongside communities to deliver preventive mental
            wellbeing support that is culturally grounded, accessible, and
            ethically delivered.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink to="/prevention-model">Our Prevention Model</ButtonLink>
            <ButtonLink to="/ethics" variant="secondary">
              Ethics &amp; Safeguarding
            </ButtonLink>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h2>What We Mean by Community</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Community, in the Akili Sawa context, refers to groups of people
              connected by shared geography, livelihood, workplace, or lived
              experience. Our work recognises that mental wellbeing is shaped not
              only by individuals, but by the social and economic environments in
              which they live.
            </p>
          </div>
          <div className="w-full">
            <ImagePanel src={images.communityGroup} alt="Community gathering" />
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="light" className="pt-0">
        <div className="space-y-8">
          <h2>How Community-Based Delivery Works</h2>
          <div className="grid gap-4 lg:grid-cols-4">
            <Card eyebrow="Step 1" title="Context &amp; Co-Design">
              Programs are adapted to local language, norms, and realities in
              collaboration with partners and community stakeholders.
            </Card>
            <Card eyebrow="Step 2" title="Accessible Delivery">
              Support is delivered through low-bandwidth channels such as SMS,
              WhatsApp, or facilitated group formats.
            </Card>
            <Card eyebrow="Step 3" title="Reinforcement &amp; Follow-Through">
              Light-touch prompts and structured activities encourage consistent
              engagement and application of skills.
            </Card>
            <Card eyebrow="Step 4" title="Safeguarding &amp; Referral">
              Clear escalation pathways ensure participants are supported
              appropriately when additional care is needed.
            </Card>
          </div>
          <ButtonLink to="/ethics" variant="tertiary">
            Ethics &amp; Safeguarding
          </ButtonLink>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2>Participation &amp; Consent</h2>
            <p className="text-sm text-muted">Key principles:</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Participation is voluntary</li>
              <li>Clear information is provided upfront</li>
              <li>Participants may opt out at any time</li>
              <li>No penalties for non-participation</li>
            </ul>
          </div>
          <Card>
            <p className="text-sm text-muted">
              Akili Sawa does not require disclosure of personal or clinical
              information to participate in preventive programs. This is
              extremely important for fragile contexts.
            </p>
          </Card>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft" className="pt-0" id="low-resource">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <h2>Working in Fragile &amp; Low-Resource Contexts</h2>
            <p className="max-w-3xl text-base text-muted md:text-lg">
              Akili Sawa is designed for environments affected by economic
              uncertainty, displacement, climate shocks, or limited access to
              formal care. Our community-based approach prioritises dignity,
              safety, and practicality — ensuring support remains usable and
              ethical in real-world conditions.
            </p>
          </div>
          <Card>
            <div className="space-y-3 text-sm text-muted">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Safeguards include:
              </p>
              <ul className="space-y-2">
                <li>Culturally grounded facilitation</li>
                <li>Clear escalation and referral pathways</li>
                <li>Consent-first participation practices</li>
                <li>Delivery that respects local realities</li>
              </ul>
            </div>
          </Card>
        </div>
      </SectionBackground>
    </div>
  );
};

export default Community;
