export type NavItem = {
  label: string;
  path: string;
};

export type FooterColumn = {
  title: string;
  links: NavItem[];
};

export const navLinks: NavItem[] = [
  { label: "For Organisations", path: "/for-organisations" },
  { label: "Our Prevention Model", path: "/prevention-model" },
  { label: "Insights", path: "/insights" },
  { label: "Ethics & Safeguarding", path: "/ethics" },
  { label: "Partnerships", path: "/partnerships" },
  { label: "Talk to Sawa AI", path: "/sawa-ai" },
  { label: "Contact", path: "/contact" },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Organisation",
    links: [
      { label: "About", path: "/about" },
      { label: "Prevention Model", path: "/prevention-model" },
      { label: "Evidence & Impact", path: "/evidence-impact" },
      { label: "Ethics & Safeguarding", path: "/ethics" },
      { label: "Talk to Sawa AI", path: "/sawa-ai" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "For Organisations", path: "/for-organisations" },
      { label: "Partnerships", path: "/partnerships" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Data Protection & Privacy", path: "/privacy" },
      { label: "Safeguarding Framework", path: "/safeguarding-framework" },
      { label: "Terms of Use", path: "/terms" },
      { label: "FAQs", path: "/faqs" },
    ],
  },
  {
    title: "Context",
    links: [
      { label: "Community", path: "/community" },
      { label: "Research-informed delivery", path: "/evidence-impact#research-informed" },
      {
        label: "Serving low-resource & fragile contexts",
        path: "/community#low-resource",
      },
    ],
  },
];
