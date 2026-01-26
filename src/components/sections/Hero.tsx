import { ButtonLink } from "../ui/Button";
import Section from "../ui/Section";
import Badge from "../ui/Badge";

const Hero = () => {
  return (
    <Section className="pt-22 md:pt-26">
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap gap-3">
          <Badge>Non-clinical</Badge>
          <Badge>Preventive</Badge>
          <Badge>Scalable</Badge>
          <Badge>Ethically delivered</Badge>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Prevention-first mental health infrastructure
          </p>
          <h1 className="mt-4 text-balance">
            Calm, confident systems that help organisations care well at scale.
          </h1>
        </div>
        <p className="max-w-2xl text-base text-muted md:text-lg">
          Akili Sawa blends climate-resilient delivery, ethical governance, and
          community-informed programs so partners can build sustainable mental
          health support across Kenya and beyond.
        </p>
        <div className="flex flex-wrap gap-4">
          <ButtonLink to="/for-organisations">Partner with us</ButtonLink>
          <ButtonLink to="/prevention-model" variant="secondary">
            Explore the model
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
};

export default Hero;
