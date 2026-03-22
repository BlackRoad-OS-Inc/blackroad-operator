"use client";

import { FormEvent, useState } from "react";
import { Button } from "@br/ui";
import { contactConfig } from "../site-config";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    console.debug("[contact-form]", data);
    setStatus("submitted");
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Contact</h1>
        <p className="mt-4 text-slate-600">{contactConfig.intro}</p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">Direct line</p>
          <p className="text-slate-600">{contactConfig.email}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <fieldset className="flex flex-col gap-4" disabled={status === "submitted"}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              required
              name="name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              name="email"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Message</span>
            <textarea
              required
              name="message"
              rows={4}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <Button type="submit">{status === "submitted" ? "Message sent" : "Send message"}</Button>
          {status === "submitted" ? (
            <p className="text-xs text-slate-500">Thank you. A team member will respond shortly.</p>
          ) : null}
        </fieldset>
      </form>
    </div>
  );
}
