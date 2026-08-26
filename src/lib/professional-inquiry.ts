export const inquiryEmail = "robert.croft@crypticdesign.net";
export const supportOptions = ["Product Strategy", "UX & Interaction", "Interface Systems", "Creative Technology", "Audit / Assessment", "Fractional / Embedded Leadership", "Not Sure Yet"] as const;
export const initialInquiry = { name: "", email: "", organization: "", message: "", stage: "", support: "", timing: "", budget: "", link: "" };
export type ProfessionalInquiry = typeof initialInquiry;

export function buildInquiryMailto(inquiry: ProfessionalInquiry): string {
  const value = (field: string) => field.trim() || "Not provided";
  const subject = "Professional inquiry — " + (inquiry.support || "Not Sure Yet") + " — " + inquiry.organization.trim();
  const body = [
    "Name: " + value(inquiry.name), "Email: " + value(inquiry.email),
    "Organization / Project: " + value(inquiry.organization),
    "Product / Project Stage: " + value(inquiry.stage), "Type of Support: " + value(inquiry.support),
    "Target Timing: " + value(inquiry.timing), "Budget / Engagement Context: " + value(inquiry.budget),
    "Supporting Link: " + value(inquiry.link), "", "Problem or Opportunity:", value(inquiry.message),
  ].join("\n");
  return "mailto:" + inquiryEmail + "?subject=" + encodeURIComponent(subject.replace(/[\r\n]+/g, " ")) + "&body=" + encodeURIComponent(body);
}
