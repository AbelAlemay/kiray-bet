import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 print:hidden border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-sm text-muted">
        <p className="font-semibold text-foreground">
          {site.name} · {site.nameLatin}
        </p>
        <p>
          <strong>Your privacy comes first.</strong> We never ask for your phone number, your email is
          never shown to other users, and exact addresses are shared only with the host&apos;s approval.
        </p>
        <p>
          <strong>Equal Housing Opportunity.</strong> All listings on {site.nameLatin} are open to
          everyone. Hosts may not state a preference based on race, color, national origin,
          religion, sex, familial status, disability, or any other class protected under the Fair
          Housing Act and state and local fair housing laws.
        </p>
        <p>© {site.nameLatin}</p>
      </div>
    </footer>
  );
}
