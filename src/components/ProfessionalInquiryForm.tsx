"use client";

import { FormEvent, useState } from "react";

const initial = { name: "", email: "", organization: "", projectType: "", budgetTimeline: "", message: "" };

export default function ProfessionalInquiryForm() {
  const [inquiry, setInquiry] = useState(initial);
  const update = (field: keyof typeof initial, value: string) => setInquiry((current) => ({ ...current, [field]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `Professional inquiry — ${inquiry.projectType}`;
    const body = [`Name: ${inquiry.name}`, `Email: ${inquiry.email}`, `Organization: ${inquiry.organization || "Not provided"}`, `Project type: ${inquiry.projectType}`, `Budget / timeline: ${inquiry.budgetTimeline || "Not provided"}`, "", "Project context:", inquiry.message].join("\n");
    window.location.href = `mailto:robert.croft@crypticdesign.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const control = "min-h-12 rounded-control border border-[var(--border)] bg-[#07111a] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--cry-spectrum-magenta)] focus:shadow-[0_0_0_2px_rgba(237,0,168,.15)]";
  return (
    <form onSubmit={submit} className="grid gap-5" aria-describedby="inquiry-handoff-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Name<input required autoComplete="name" value={inquiry.name} onChange={(event) => update("name", event.target.value)} className={control} /></label>
        <label className="grid gap-2 text-sm font-medium">Email<input required type="email" autoComplete="email" value={inquiry.email} onChange={(event) => update("email", event.target.value)} className={control} /></label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Organization <span className="sr-only">optional</span><input autoComplete="organization" value={inquiry.organization} onChange={(event) => update("organization", event.target.value)} className={control} /></label>
        <label className="grid gap-2 text-sm font-medium">Project type<input required placeholder="Product, game, platform, research…" value={inquiry.projectType} onChange={(event) => update("projectType", event.target.value)} className={control} /></label>
      </div>
      <label className="grid gap-2 text-sm font-medium">Budget or timeline <span className="text-xs font-normal text-[var(--muted)]">Optional</span><input value={inquiry.budgetTimeline} onChange={(event) => update("budgetTimeline", event.target.value)} className={control} /></label>
      <label className="grid gap-2 text-sm font-medium">What are you trying to make, change, or understand?<textarea required rows={7} value={inquiry.message} onChange={(event) => update("message", event.target.value)} className={control} /></label>
      <p id="inquiry-handoff-note" className="m-0 text-xs leading-relaxed text-[var(--muted)]">Continue to email opens your email application with these details prepared. You can review and edit everything before sending; this site does not store the form.</p>
      <button type="submit" className="button w-fit">Continue to email</button>
    </form>
  );
}
