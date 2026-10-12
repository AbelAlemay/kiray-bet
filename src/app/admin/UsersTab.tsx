import { formatDate } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { setBanned } from "./actions";
import { ConfirmButton } from "./ConfirmButton";

type Row = {
  id: string;
  display_name: string | null;
  role: "renter" | "host" | "admin";
  created_at: string;
  private_profiles: { email: string; banned: boolean } | null;
  listings: { count: number }[];
};

export async function UsersTab({ adminId }: { adminId: string }) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at, private_profiles(email, banned), listings(count)")
    .order("created_at", { ascending: false })
    .limit(500)
    .overrideTypes<Row[], { merge: false }>();
  const users = data ?? [];

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border text-xs text-muted">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Listings</th>
            <th className="p-3">Joined</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const banned = u.private_profiles?.banned ?? false;
            return (
              <tr key={u.id} className="border-b border-border last:border-0 align-top">
                <td className="p-3 font-semibold">
                  {u.display_name ?? "—"}
                  {banned && <span className="ml-2 rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">Banned</span>}
                </td>
                <td className="p-3">{u.private_profiles?.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.listings[0]?.count ?? 0}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(u.created_at.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className="p-3 text-right">
                  {u.id !== adminId &&
                    (banned ? (
                      <ConfirmButton
                        label="Unban"
                        question="Unban this user? Their listings stay down until they resubmit."
                        confirmLabel="Unban"
                        action={setBanned}
                        fields={{ userId: u.id, banned: "false", tab: "users" }}
                      />
                    ) : (
                      <ConfirmButton
                        label="Ban"
                        question="Ban this user? They can't post or message, and their listings are taken down."
                        confirmLabel="Ban"
                        action={setBanned}
                        fields={{ userId: u.id, banned: "true", tab: "users" }}
                        notePlaceholder="Reason (shown on their listings)"
                        danger
                      />
                    ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
