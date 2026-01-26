import SectionBackground from "../components/layout/SectionBackground";
import Badge from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import IconContainer from "../components/ui/IconContainer";
import ImagePanel from "../components/ui/ImagePanel";
import { images } from "../lib/images";

const Home = () => {
  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge>Non-clinical</Badge>
              <Badge>Preventive</Badge>
              <Badge>Scalable</Badge>
              <Badge>Ethically delivered</Badge>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Working with insurers, financial institutions, employers,
                researchers, and communities.
              </p>
              <h1 className="text-balance">
                Preventive Mental Well-being, Before Crisis
              </h1>
            </div>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              Strengthening resilience, improving behavioural follow-through, and
              reducing downstream risk — through non-clinical, scalable mental
              wellbeing support.
            </p>
            <p className="text-xs text-muted">
              Akili Sawa does not provide regulated clinical or medical services
              and does not replace licensed mental health care providers.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/for-organisations">For Organisations</ButtonLink>
              <ButtonLink to="/prevention-model" variant="secondary">
                Our Prevention Model
              </ButtonLink>
              <ButtonLink to="/ethics" variant="tertiary">
                Ethics &amp; Safeguarding
              </ButtonLink>
            </div>
          </div>
          <ImagePanel
            src="https://akilisawa.com/wp-content/uploads/2026/01/Mental-Health-Day-Digital-Art-PNG-SVG-_-Mindfulness-Brain-Clip-Art-_-World-Mental-Health-Day-Wall-Decor-Download.jpeg"
            alt="Mindfulness brain illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="space-y-8">
          <div>
            <h2>Who We Work With</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <div className="flex items-start gap-4">
                <IconContainer>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 10h18" />
                    <path d="M7 6h10" />
                    <path d="M7 14h6" />
                    <path d="M5 18h14" />
                  </svg>
                </IconContainer>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-text">
                    Insurance &amp; Financial Institutions
                  </h3>
                  <p className="text-sm text-muted">
                    Strengthen prevention pathways that reduce claims risk and
                    improve long-term resilience for member populations.
                  </p>
                  <ButtonLink to="/for-organisations" variant="tertiary">
                    Learn more →
                  </ButtonLink>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-4">
                <IconContainer>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M6 7v10" />
                    <path d="M18 7v10" />
                    <path d="M8 17h8" />
                  </svg>
                </IconContainer>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-text">
                    Employers &amp; Workforce Programs
                  </h3>
                  <p className="text-sm text-muted">
                    Build structured support that improves engagement,
                    follow-through, and retention across teams.
                  </p>
                  <ButtonLink to="/for-organisations" variant="tertiary">
                    Learn more →
                  </ButtonLink>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-4">
                <IconContainer>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16v16H4z" />
                    <path d="M8 8h8" />
                    <path d="M8 12h8" />
                    <path d="M8 16h5" />
                  </svg>
                </IconContainer>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-text">
                    Researchers &amp; Funders
                  </h3>
                  <p className="text-sm text-muted">
                    Partner on evidence-led pilots that capture behavioural
                    outcomes and scalable prevention insights.
                  </p>
                  <ButtonLink to="/for-organisations" variant="tertiary">
                    Learn more →
                  </ButtonLink>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-4">
                <IconContainer>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                </IconContainer>
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-text">
                    Communities
                  </h3>
                  <p className="text-sm text-muted">
                    Co-design support systems grounded in local leadership and
                    trusted community networks.
                  </p>
                  <ButtonLink to="/community" variant="tertiary">
                    See community approach →
                  </ButtonLink>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="soft">
        <div className="space-y-8">
          <div>
            <h2>Our Prevention Model</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card eyebrow="Stage 1" title="Early Support">
              Provide low-barrier, culturally aligned guidance that helps people
              identify challenges early and access practical tools.
            </Card>
            <Card eyebrow="Stage 2" title="Behavioural Follow-Through">
              Reinforce action through nudges, accountability, and community
              touchpoints that sustain healthy behaviours.
            </Card>
            <Card eyebrow="Stage 3" title="Escalation &amp; Referral">
              Maintain clear referral pathways to clinical or specialist care
              when risk indicators require escalation.
            </Card>
          </div>
          <div>
            <ButtonLink to="/prevention-model" variant="tertiary">
              Explore the Prevention Model →
            </ButtonLink>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="dark-soft" className="py-18">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <h2>Ethical by Design</h2>
            <ul className="space-y-3 text-sm text-muted">
              <li>Non-clinical scope and clear boundaries</li>
              <li>Informed consent and data protection</li>
              <li>Do-no-harm principles</li>
              <li>Defined referral and escalation pathways</li>
            </ul>
            <ButtonLink to="/ethics" variant="tertiary">
              Our Ethics &amp; Safeguarding Framework →
            </ButtonLink>
          </div>
          <div className="space-y-6">
            <h2>Pilots, Partnerships &amp; Evidence</h2>
            <p className="max-w-2xl text-base text-muted md:text-lg">
              We co-design pilots with aligned partners to validate prevention
              outcomes, refine delivery in real settings, and build evidence that
              supports responsible scale.
            </p>
            <ButtonLink to="/pilots" variant="tertiary">
              Explore Pilots &amp; Partnerships →
            </ButtonLink>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="light">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h2>Grounded in Real Contexts</h2>
            <p className="max-w-xl text-base text-muted md:text-lg">
              We partner with local leaders and community networks to design
              support that reflects lived realities, not imported assumptions.
            </p>
            <ButtonLink to="/community" variant="tertiary">
              Our Community Approach →
            </ButtonLink>
          </div>
          <div className="flex items-center">
            <div className="w-full">
              <ImagePanel
                src="/grounded.jpeg"
                alt="Community landscape"
              />
            </div>
          </div>
        </div>
      </SectionBackground>

      <SectionBackground variant="mid">
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl">
                Interested in working with Akili Sawa?
              </h2>
              <p className="text-sm text-muted">
                Share your objectives and we will shape a scoped prevention
                partnership together.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink to="/contact?reason=scoping-conversation">
                Request a Scoping Conversation
              </ButtonLink>
            </div>
          </div>
        </Card>
      </SectionBackground>
    </div>
  );
};

export default Home;
