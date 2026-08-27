"use client";

import { type FormEvent, useState } from "react";
import { buildRequestAccessMailto, requestAccessEmail, requestAccessInterests } from "@/lib/request-access";
import styles from "./RequestAccessForm.module.css";

export default function RequestAccessForm() {
  const [request, setRequest] = useState({ email: "", name: "", interest: "" });
  const [preparedMailto, setPreparedMailto] = useState("");
  const update = (field: keyof typeof request, value: string) => {
    setRequest(current => ({ ...current, [field]: value }));
    setPreparedMailto("");
  };

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mailto = buildRequestAccessMailto(request);
    setPreparedMailto(mailto);
    window.location.href = mailto;
  }

  return (
    <form onSubmit={prepare} className={`account-access-card ${styles.form}`} aria-labelledby="access-request-title" aria-describedby="access-request-note">
      <h2 id="access-request-title">Request future member access.</h2>
      <p>Requesting access does not create an account. Access is not guaranteed.</p>
      <label>Email <span>(required)</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" value={request.email} onChange={event => update("email", event.target.value)} />
      </label>
      <label>Name <span>(optional)</span>
        <input name="name" maxLength={80} autoComplete="name" value={request.name} onChange={event => update("name", event.target.value)} />
      </label>
      <label>Primary Interest <span>(optional)</span>
        <select name="interest" value={request.interest} onChange={event => update("interest", event.target.value)}>
          <option value="">Select an interest</option>
          {requestAccessInterests.map(interest => <option key={interest}>{interest}</option>)}
        </select>
      </label>
      <p id="access-request-note">Prepare Access Request opens your email application with these details. Review and send the prepared email yourself to complete your request. This site does not store your details or send the email.</p>
      <button type="submit" className="button">Prepare Access Request</button>
      <div role="status" aria-live="polite">
        {preparedMailto ? <p>Your email app should open with the request prepared. Review it and send it to complete your request. <a href={preparedMailto}>Reopen prepared email</a>.</p> : null}
      </div>
      <p>If your email application does not open, email <a href={`mailto:${requestAccessEmail}`}>{requestAccessEmail}</a>. Your details remain here so you can copy them into your email.</p>
    </form>
  );
}
