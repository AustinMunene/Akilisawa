import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import SectionBackground from "../components/layout/SectionBackground";
import { Button } from "../components/ui/Button";
import Card from "../components/ui/Card";
import ImagePanel from "../components/ui/ImagePanel";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    organisation: "",
    roleTitle: "",
    workEmail: "",
    countryRegion: "",
    reason: "",
    organisationType: "",
    researchInterest: "",
    mediaOutlet: "",
    message: "",
    companyWebsite: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const requiresOrgType = useMemo(
    () =>
      [
        "Pilot or Partnership Discussion",
        "Insurance / Financial Institution Collaboration",
        "Employer / Workforce Program",
        "General Organisational Enquiry",
      ].includes(formData.reason),
    [formData.reason]
  );

  const requiresResearch = formData.reason === "Research Collaboration";
  const requiresMedia = formData.reason === "Media / Speaking Request";

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!formData.organisation.trim())
      nextErrors.organisation = "Organisation is required.";
    if (!formData.roleTitle.trim()) nextErrors.roleTitle = "Role is required.";
    if (!formData.workEmail.trim())
      nextErrors.workEmail = "Work email is required.";
    if (formData.workEmail && !emailRegex.test(formData.workEmail))
      nextErrors.workEmail = "Enter a valid work email.";
    if (!formData.countryRegion.trim())
      nextErrors.countryRegion = "Country or region is required.";
    if (!formData.reason) nextErrors.reason = "Select a reason for contact.";
    if (requiresOrgType && !formData.organisationType)
      nextErrors.organisationType = "Select an organisation type.";
    if (requiresResearch && !formData.researchInterest.trim())
      nextErrors.researchInterest = "Please add a brief description.";
    if (requiresResearch && formData.researchInterest.length > 300)
      nextErrors.researchInterest = "Must be 300 characters or fewer.";
    if (requiresMedia && !formData.mediaOutlet.trim())
      nextErrors.mediaOutlet = "Outlet or event name is required.";
    if (!formData.message.trim())
      nextErrors.message = "Please describe your interest.";
    if (formData.message.length > 1000)
      nextErrors.message = "Message must be 1000 characters or fewer.";

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  const inputClass =
    "mt-2 w-full rounded-soft bg-white/85 px-3 py-2 text-sm text-text shadow-float outline-none transition focus:ring-2 focus:ring-accent/25 dark:bg-panel/85";
  const labelClass = "text-xs font-semibold uppercase tracking-[0.2em] text-muted";

  return (
    <div>
      <SectionBackground variant="gradient" className="pt-24 md:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl space-y-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted">
              Get in Touch
            </p>
            <h1 className="text-balance">Get in Touch</h1>
            <p className="text-base text-muted md:text-lg">
              We engage with organisations, researchers, and institutions
              interested in preventive mental wellbeing pilots, partnerships, and
              learning collaborations.
            </p>
            <p className="text-sm text-muted">
              Akili Sawa does not provide individual therapy, diagnosis, or crisis
              support.
            </p>
          </div>
          <ImagePanel
            src="https://akilisawa.com/wp-content/uploads/2026/01/I-case-of-any-Query-Contact-US.jpeg"
            alt="Contact and enquiries illustration"
          />
        </div>
      </SectionBackground>

      <SectionBackground variant="mid" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="h-full">
            {status === "success" ? (
              <div className="space-y-3 text-sm text-muted">
                <p className="text-text">Thank you for reaching out.</p>
                <p>Your message has been received and will be reviewed by our team.</p>
                <p>We prioritise organisational, research, and partnership-related enquiries.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Full Name</span>
                  <input
                    className={inputClass}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  {errors.fullName ? (
                    <p className="mt-2 text-xs text-red-600">{errors.fullName}</p>
                  ) : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Organisation</span>
                  <input
                    className={inputClass}
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleChange}
                    required
                  />
                  {errors.organisation ? (
                    <p className="mt-2 text-xs text-red-600">{errors.organisation}</p>
                  ) : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Role / Title</span>
                  <input
                    className={inputClass}
                    name="roleTitle"
                    value={formData.roleTitle}
                    onChange={handleChange}
                    required
                  />
                  {errors.roleTitle ? (
                    <p className="mt-2 text-xs text-red-600">{errors.roleTitle}</p>
                  ) : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Work Email</span>
                  <input
                    type="email"
                    className={inputClass}
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleChange}
                    required
                  />
                  {errors.workEmail ? (
                    <p className="mt-2 text-xs text-red-600">{errors.workEmail}</p>
                  ) : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Country / Region</span>
                  <input
                    className={inputClass}
                    name="countryRegion"
                    value={formData.countryRegion}
                    onChange={handleChange}
                    required
                  />
                  {errors.countryRegion ? (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.countryRegion}
                    </p>
                  ) : null}
                </label>
                <label className="block">
                  <span className={labelClass}>Reason for Contact</span>
                  <select
                    className={inputClass}
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select one</option>
                    <option>Pilot or Partnership Discussion</option>
                    <option>Insurance / Financial Institution Collaboration</option>
                    <option>Research Collaboration</option>
                    <option>Employer / Workforce Program</option>
                    <option>General Organisational Enquiry</option>
                    <option>Media / Speaking Request</option>
                  </select>
                  {errors.reason ? (
                    <p className="mt-2 text-xs text-red-600">{errors.reason}</p>
                  ) : null}
                </label>
              </div>

              {requiresOrgType ? (
                <label className="block">
                  <span className={labelClass}>Organisation Type</span>
                  <select
                    className={inputClass}
                    name="organisationType"
                    value={formData.organisationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select one</option>
                    <option>Insurer / Financial Institution</option>
                    <option>Employer</option>
                    <option>Research Institution</option>
                    <option>Donor / Foundation</option>
                    <option>Public or Development Agency</option>
                  </select>
                  {errors.organisationType ? (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.organisationType}
                    </p>
                  ) : null}
                </label>
              ) : null}

              {requiresResearch ? (
                <label className="block">
                  <span className={labelClass}>
                    Brief Description of Research or Evaluation Interest
                  </span>
                  <input
                    className={inputClass}
                    name="researchInterest"
                    value={formData.researchInterest}
                    onChange={handleChange}
                    maxLength={300}
                  />
                  {errors.researchInterest ? (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.researchInterest}
                    </p>
                  ) : null}
                </label>
              ) : null}

              {requiresMedia ? (
                <label className="block">
                  <span className={labelClass}>Outlet / Event Name</span>
                  <input
                    className={inputClass}
                    name="mediaOutlet"
                    value={formData.mediaOutlet}
                    onChange={handleChange}
                  />
                  {errors.mediaOutlet ? (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.mediaOutlet}
                    </p>
                  ) : null}
                </label>
              ) : null}

              <label className="block">
                <span className={labelClass}>Message</span>
                <textarea
                  className={`${inputClass} min-h-[140px]`}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={1000}
                  required
                />
                <p className="mt-2 text-xs text-muted">
                  Please describe your interest. Do not include personal or
                  clinical information.
                </p>
                {errors.message ? (
                  <p className="mt-2 text-xs text-red-600">{errors.message}</p>
                ) : null}
              </label>

              <label className="hidden">
                <span>Company Website</span>
                <input
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>

              {status === "error" ? (
                <p className="text-sm text-red-600">
                  We could not send your message. Please try again later.
                </p>
              ) : null}

                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted">
                    If you are seeking immediate help or experiencing a mental
                    health crisis, please contact local emergency services or a
                    trusted healthcare provider.
                  </p>
                  <Button type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
          <div className="space-y-6">
            <Card>
              <div className="space-y-3 text-sm text-muted">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Qualification Notice
                </p>
                <p>
                  We prioritise organisational, research, and partnership-related
                  enquiries.
                </p>
                <p>
                  Akili Sawa does not provide individual therapy, diagnosis, or crisis
                  support.
                </p>
              </div>
            </Card>
            <ImagePanel
              src="https://akilisawa.com/wp-content/uploads/2026/01/Working-diligently-to-continuously-refine-the-CustomerExperience-you-offer-as-a-company-can-go-a-long-way-towards-keeping-your-clients-loyal_.jpeg"
              alt="Customer experience collaboration illustration"
            />
          </div>
        </div>
      </SectionBackground>
    </div>
  );
};

export default Contact;
