import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import { ButtonLink } from "../components/ui/Button";

const NotFound = () => {
  return (
    <PageShell
      title="Page not found"
      subtitle="We could not locate that page. Use the navigation or return to the homepage."
      variant="light"
    >
      <div className="space-y-6">
        <Card title="Need direction?">
          Head back to the homepage or explore the prevention model to reorient.
        </Card>
        <ButtonLink to="/">Return home</ButtonLink>
      </div>
    </PageShell>
  );
};

export default NotFound;
