"use client";

import { FormEvent, useState } from "react";

type Inquiry = {
  name: string;
  email: string;
  organization: string;
  projectType: string;
  budgetTimeline: string;
  message: string;
  submittedAt: string;
  status: "new";
};

const INITIAL_INQUIRY: Omit<Inquiry, "submittedAt" | "status"> = {
  name: "",
  email: "",
  organization: "",
  projectType: "",
  budgetTimeline: "",
  message: "",
};

export default function ProfessionalInquiryForm() {
  const [inquiry, setInquiry] = useState(INITIAL_INQUIRY);
  const [consented, setConsented] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof typeof INITIAL_INQUIRY, value: string) {
    setInquiry((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const record: Inquiry = {
      ...inquiry,
      submittedAt: new Date().toISOString(),
      status: "new",
    };
    const key = "crypticdesign.professional-inquiry-review-queue";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as Inquiry[];
    localStorage.setItem(key, JSON.stringify([...existing, record]));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-card border border-success/40 bg-surface p-6">
        <h2 className="text-xl font-semibold text-foreground">Inquiry recorded</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This V1 placeholder stored your inquiry in this browser&apos;s local review queue. It did not send an email or contact anyone automatically.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-4">
      <label className="grid gap-1 text-sm text-foreground">
        Name
        <input required value={inquiry.name} onChange={(event) => update("name", event.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-foreground" />
      </label>
      <label className="grid gap-1 text-sm text-foreground">
        Email
        <input required type="email" value={inquiry.email} onChange={(event) => update("email", event.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-foreground" />
      </label>
      <label className="grid gap-1 text-sm text-foreground">
        Organization
        <input value={inquiry.organization} onChange={(event) => update("organization", event.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-foreground" />
      </label>
      <label className="grid gap-1 text-sm text-foreground">
        Project type
        <input required value={inquiry.projectType} onChange={(event) => update("projectType", event.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-foreground" />
      </label>
      <label className="grid gap-1 text-sm text-foreground">
        Budget or timeline (optional)
        <input value={inquiry.budgetTimeline} onChange={(event) => update("budgetTimeline", event.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-foreground" />
      </label>
      <label className="grid gap-1 text-sm text-foreground">
        Message
        <textarea required rows={5} value={inquiry.message} onChange={(event) => update("message", event.target.value)} className="rounded-control border border-border bg-surface px-3 py-2 text-foreground" />
      </label>
      <label className="flex gap-2 text-sm text-muted-foreground">
        <input required type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} />
        I understand this V1 form is a local review-queue placeholder and does not send an email automatically.
      </label>
      <button type="submit" className="w-fit rounded-control bg-accent-blue px-5 py-2.5 text-sm font-medium text-black">
        Submit inquiry
      </button>
    </form>
  );
}
