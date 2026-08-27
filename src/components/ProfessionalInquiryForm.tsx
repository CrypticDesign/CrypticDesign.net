"use client";

import { FormEvent, useState } from "react";
import { buildInquiryMailto, initialInquiry, inquiryEmail, supportOptions } from "@/lib/professional-inquiry";

export default function ProfessionalInquiryForm() {
  const [inquiry, setInquiry] = useState(initialInquiry);
  const update = (field: keyof typeof initialInquiry, value: string) => setInquiry(current => ({ ...current, [field]: value }));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = buildInquiryMailto(inquiry);
  }
  const control = "professional-inquiry-control";
  return <form onSubmit={submit} className="grid gap-5" aria-describedby="inquiry-handoff-note">
    <p className="m-0 text-sm text-[var(--muted)]">Name, email, organization/project, and problem or opportunity are required. All other fields are optional.</p>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">Name<input name="name" required autoComplete="name" value={inquiry.name} onChange={event => update("name", event.target.value)} className={control} /></label>
      <label className="grid gap-2 text-sm font-medium">Email<input name="email" required type="email" autoComplete="email" value={inquiry.email} onChange={event => update("email", event.target.value)} className={control} /></label>
    </div>
    <label className="grid gap-2 text-sm font-medium">Organization / Project<input name="organization" required autoComplete="organization" value={inquiry.organization} onChange={event => update("organization", event.target.value)} className={control} /></label>
    <label className="grid gap-2 text-sm font-medium">Problem or Opportunity<textarea name="message" required rows={6} value={inquiry.message} onChange={event => update("message", event.target.value)} className={control} /></label>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">Product / Project Stage (optional)<input name="stage" value={inquiry.stage} onChange={event => update("stage", event.target.value)} className={control} /></label>
      <label className="grid gap-2 text-sm font-medium">Type of Support (optional)<select name="support" value={inquiry.support} onChange={event => update("support", event.target.value)} className={control}><option value="">Select support</option>{supportOptions.map(option => <option key={option}>{option}</option>)}</select></label>
      <label className="grid gap-2 text-sm font-medium">Target Timing (optional)<input name="timing" value={inquiry.timing} onChange={event => update("timing", event.target.value)} className={control} /></label>
      <label className="grid gap-2 text-sm font-medium">Budget / Engagement Context (optional)<input name="budget" value={inquiry.budget} onChange={event => update("budget", event.target.value)} className={control} /></label>
    </div>
    <label className="grid gap-2 text-sm font-medium">Supporting Link (optional)<input name="link" type="url" placeholder="https://" value={inquiry.link} onChange={event => update("link", event.target.value)} className={control} /></label>
    <p id="inquiry-handoff-note" className="m-0 text-sm leading-relaxed text-[var(--muted)]">Continue to email opens your email application with these details prepared. You can review and edit everything before sending; this site does not store the form or send the email.</p>
    <button type="submit" className="button w-fit">Continue to email</button>
    <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">If your email application does not open, email <a className="text-link break-all" href={"mailto:" + inquiryEmail}>{inquiryEmail}</a>. Your details remain here so you can copy them into your email.</p>
  </form>;
}
