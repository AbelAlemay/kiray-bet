import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { leaseTitles } from "@/lib/leases/fields";
import { getLeaseTemplate } from "@/lib/leases/templates-server";
import type { ListingType } from "@/lib/site";
import { createServerSupabase } from "@/lib/supabase/server";
import { LeaseBuilder } from "./LeaseBuilder";

export const metadata: Metadata = {
  title: "Create a lease",
  robots: { index: false },
};

type Props = PageProps<"/listings/[id]/lease">;

// One year from the start date, minus a day: "2026-11-01" -> "2027-10-31".
function oneYearLater(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function Lease({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const user = await requireUser(`/listings/${id}/lease`);

  // Only the host's own listing (and its private address) is returned.
  const supabase = await createServerSupabase();
  const [{ data: listing }, { data: address }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, type, price, deposit, city, available_from, utilities_included, parking, pets_allowed")
      .eq("id", id)
      .eq("host_id", user.id)
      .maybeSingle(),
    supabase.from("listing_addresses").select("street_address, unit, zip").eq("listing_id", id).maybeSingle(),
  ]);
  if (!listing) notFound();

  const type = listing.type as ListingType;
  const template = await getLeaseTemplate(type);
  const money = (n: number) => n.toLocaleString("en-US");

  const initial = {
    landlord_name: "",
    tenant_names: "",
    other_occupants: "None",
    property_address: address ? `${address.street_address}${address.unit ? `, ${address.unit}` : ""}` : "",
    city: listing.city,
    zip: address?.zip ?? "",
    lease_start: listing.available_from,
    fixed_term: true,
    lease_end: oneYearLater(listing.available_from),
    monthly_rent: money(listing.price),
    rent_due_day: "1st",
    payment_method: "",
    security_deposit: money(listing.deposit),
    late_fee: "50",
    utilities_landlord: listing.utilities_included ? "All utilities" : "",
    utilities_tenant: listing.utilities_included ? "None" : "",
    parking: listing.parking,
    pets_allowed: listing.pets_allowed,
    pre_1978: false,
    furnished: type === "room",
  };

  const versionLabel =
    template.version === 0
      ? `${leaseTitles[type]} · KirayBet draft form (not reviewed by a lawyer) · kiraybet.org`
      : `${leaseTitles[type]} · Form version ${template.version}${template.lawyerReviewed && template.reviewNote ? ` · ${template.reviewNote}` : ""} · kiraybet.org`;

  return (
    <>
      <div className="mb-5 print:hidden">
        <p className="text-sm text-muted">{listing.title}</p>
        <h1 className="text-2xl font-bold sm:text-3xl">{leaseTitles[type]}</h1>
        <p className="mt-1 text-sm text-muted">
          A ready-made agreement for this {type === "room" ? "room" : type}, filled in from your listing. Print it, or save it
          as a PDF to sign. KirayBet provides the form only and does not give legal advice.
        </p>
      </div>
      <LeaseBuilder
        template={template.body}
        initial={initial}
        title={leaseTitles[type]}
        draftNotice={!template.lawyerReviewed}
        versionLabel={versionLabel}
      />
    </>
  );
}

export default function LeasePage({ params }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 print:max-w-none print:p-0">
      <Link href="/listings/mine" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground print:hidden">
        ← My listings
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-border/50" />}>
        <Lease params={params} />
      </Suspense>
    </div>
  );
}
