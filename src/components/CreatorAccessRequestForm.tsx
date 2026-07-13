"use client";

import { FormEvent, useState } from "react";

type AccessRequest = {
  name: string;
  email: string;
  roleDiscipline: string;
  portfolioLink: string;
  interestArea: string;
  message: string;
  submittedAt: string;
  status: "new";
};

const INITIAL_REQUEST: Omit<AccessRequest, "submittedAt" | "status"> = {
  name: "",
  email: "",
  roleDiscipline: "",
  portfolioLink: "",
  interestArea: "",
  message: "",
};

const FIELD_CLASS =
  "rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";

export default function CreatorAccessRequestForm() {
  const [request, setRequest] = useState(INITIAL_REQUEST);
  const [rightsAcknowledged, setRightsAcknowledged] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(field: keyof typeof INITIAL_REQUEST, value: string) {
    setRequest((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const record: AccessRequest = {
      ...request,
      submittedAt: new Date().toISOString(),
      status: "new",
    };
    const key = "crypticdesign.creator-access-review-queue";
    const existing = JSON.parse(
      localStorage.getItem(key) ?? "[]",
    ) as AccessRequest[];
    localStorage.setItem(key, JSON.stringify([...existing, record]));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-card border border-success/40 bg-surface p-6">
        <h2 className="font-medium text-foreground">Saved in this browser</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your application is saved in this browser. It has not been submitted
          to Cryptic Design, and no account or email was created.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Name
        <input
          required
          value={request.name}
          onChange={(e) => update("name", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Email
        <input
          required
          type="email"
          value={request.email}
          onChange={(e) => update("email", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Role / discipline
        <input
          required
          placeholder="e.g. musician, 3D artist, writer, developer"
          value={request.roleDiscipline}
          onChange={(e) => update("roleDiscipline", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Portfolio link (optional)
        <input
          type="url"
          placeholder="https://"
          value={request.portfolioLink}
          onChange={(e) => update("portfolioLink", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Interest area
        <input
          required
          placeholder="e.g. Singularis, Visual Studies, audio releases, tooling"
          value={request.interestArea}
          onChange={(e) => update("interestArea", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Message
        <textarea
          required
          rows={4}
          value={request.message}
          onChange={(e) => update("message", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          required
          checked={rightsAcknowledged}
          onChange={(e) => setRightsAcknowledged(e.target.checked)}
          className="mt-1"
        />
        I confirm that any material I share is my own work or work I have the
        rights to share. I understand this preview saves my application in
        this browser and does not submit it to Cryptic Design.
      </label>
      <button
        type="submit"
        className="w-fit rounded-control bg-accent-cyan px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
      >
        Save application
      </button>
    </form>
  );
}
