import Badge from "../components/ui/Badge";
import { Button, ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import IconContainer from "../components/ui/IconContainer";
import PageShell from "../components/layout/PageShell";
import Section from "../components/ui/Section";

const StyleGuide = () => {
  return (
    <div>
      <PageShell
        title="Style Guide"
        subtitle="Internal reference for Akili Sawa components, spacing, and typography."
        variant="light"
      >
        <div className="flex flex-wrap gap-3">
          <Badge>Non-clinical</Badge>
          <Badge>Preventive</Badge>
          <Badge>Scalable</Badge>
          <Badge>Ethically delivered</Badge>
        </div>
      </PageShell>

      <Section variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card title="Buttons" eyebrow="Components">
            <div className="flex flex-wrap gap-4">
              <Button>Primary action</Button>
              <Button variant="secondary">Secondary action</Button>
              <Button variant="tertiary">Tertiary action</Button>
              <ButtonLink to="/contact" variant="primary">
                Contact link
              </ButtonLink>
            </div>
          </Card>
          <Card title="Icon container" eyebrow="Components">
            <div className="flex items-center gap-4">
              <IconContainer>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12h7l2-3 2 6 2-3h3" />
                </svg>
              </IconContainer>
              <p className="text-sm text-muted">
                Use line icons only. Keep visuals abstract and infrastructure
                oriented.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      <Section variant="light" className="pt-0">
        <Card title="Who we work with" eyebrow="Cards">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-text">Employers</p>
              <p className="text-sm text-muted">
                Support workforce wellbeing with structured prevention programs.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Schools</p>
              <p className="text-sm text-muted">
                Build resilient, safe learning environments with early support.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Communities</p>
              <p className="text-sm text-muted">
                Strengthen local networks through community-owned initiatives.
              </p>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
};

export default StyleGuide;
