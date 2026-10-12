import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <p className="text-sm font-semibold text-brand">Contact · ያግኙን</p>
      <h1 className="mt-1 text-3xl font-bold">Contact us</h1>
      <p className="mb-6 mt-2 text-muted">
        Questions, problems, or something that looks like a scam? Send us a message and we&apos;ll
        get back to you by email.
      </p>
      <ContactForm />
      <p className="mt-4 text-xs text-muted">
        To reach a host about a home, use the &ldquo;Contact host&rdquo; button on the listing instead.
      </p>
    </div>
  );
}
