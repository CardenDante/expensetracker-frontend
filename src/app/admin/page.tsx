"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { api } from "@/lib/api-client";

type AnyUser = any;
type AnyActivity = any;

function normalizeResults(data: any) {
  // DRF style: { count, next, previous, results }
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return {
      count: typeof data.count === "number" ? data.count : null,
      results: data.results,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }
  // Non-paginated: []
  if (Array.isArray(data)) {
    return { count: data.length, results: data, next: null, previous: null };
  }
  return { count: null, results: [], next: null, previous: null };
}

function displayName(u: AnyUser) {
  const full = String(u?.full_name ?? "").trim();
  if (full) return full;

  const first = String(u?.first_name ?? "").trim();
  const last = String(u?.last_name ?? "").trim();
  const combined = `${first} ${last}`.trim();
  return combined || "—";
}

export default function AdminHome() {
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");

  const [usersLoading, setUsersLoading] = useState(true);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [usersErr, setUsersErr] = useState<string | null>(null);

  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activities, setActivities] = useState<AnyActivity[]>([]);
  const [activitiesErr, setActivitiesErr] = useState<string | null>(null);

  // Load users (real)
  useEffect(() => {
    (async () => {
      setUsersLoading(true);
      setUsersErr(null);

      // IMPORTANT: fetch more than 1, so UI shows at least 10
      const pageSize = 50;
      const r = await api(`/api/v1/users/?page_size=${pageSize}`, { method: "GET" });
      console.log("[Dashboard] users:", r.status, r.data);

      if (!r.ok) {
        setUsersErr(`Failed to load users (${r.status}).`);
        setUsersCount(null);
        setUsers([]);
        setUsersLoading(false);
        return;
      }

      const { count, results } = normalizeResults(r.data);
      setUsersCount(count);
      setUsers(results);
      setUsersLoading(false);
    })();
  }, []);

  // Load activities (real)
  useEffect(() => {
    (async () => {
      setActivitiesLoading(true);
      setActivitiesErr(null);

      const r = await api(`/api/v1/activities/?page_size=20`, { method: "GET" });
      console.log("[Dashboard] activities:", r.status, r.data);

      if (!r.ok) {
        setActivitiesErr(`Failed to load activities (${r.status}).`);
        setActivities([]);
        setActivitiesLoading(false);
        return;
      }

      const { results } = normalizeResults(r.data);
      setActivities(results);
      setActivitiesLoading(false);
    })();
  }, []);

  // Range filter applies to users/cards/activity if date fields exist
  const filteredUsers = useMemo(() => {
    if (range === "all") return users;

    const days = range === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return users.filter((u) => {
      const t = u?.date_joined ? new Date(u.date_joined).getTime() : 0;
      return t >= cutoff;
    });
  }, [users, range]);

  const stats = useMemo(() => {
    const admins = filteredUsers.filter((u) => u?.role === "A").length;
    const verified = filteredUsers.filter((u) => !!u?.verified).length;
    const totalInRange = filteredUsers.length;

    return {
      totalAll: usersCount, // this is REAL total from API pagination count
      totalInRange,
      admins,
      verified,
    };
  }, [filteredUsers, usersCount]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b?.date_joined ?? 0).getTime() - new Date(a?.date_joined ?? 0).getTime())
      .slice(0, 9);
  }, [users]);

  const recentActivities = useMemo(() => {
    // If activity has timestamp fields, sort; else show as-is
    return [...activities].slice(0, 20);
  }, [activities]);

  return (
    <div className="space-y-10">
      {/* Header + range tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-base font-semibold text-zinc-900">Cashflow</h1>

        <div className="order-last sm:order-none flex items-center gap-2 rounded-xl bg-white border px-2 py-1">
          <button
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${
              range === "7d" ? "text-indigo-600 bg-indigo-50" : "text-zinc-700 hover:bg-zinc-50"
            }`}
            onClick={() => setRange("7d")}
          >
            Last 7 days
          </button>
          <button
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${
              range === "30d" ? "text-indigo-600 bg-indigo-50" : "text-zinc-700 hover:bg-zinc-50"
            }`}
            onClick={() => setRange("30d")}
          >
            Last 30 days
          </button>
          <button
            className={`px-3 py-1 text-sm font-semibold rounded-lg ${
              range === "all" ? "text-indigo-600 bg-indigo-50" : "text-zinc-700 hover:bg-zinc-50"
            }`}
            onClick={() => setRange("all")}
          >
            All-time
          </button>
        </div>

        <a
          href="/admin/users"
          className="ml-auto inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          View users
        </a>
      </div>

      {/* Stats grid — REAL */}
      <div className="border rounded-2xl bg-white overflow-hidden">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCell
            title="Total users (all-time)"
            value={usersLoading ? "Loading…" : stats.totalAll?.toString() ?? "—"}
            change={usersErr ? "Error" : "From API count"}
            changeBad={!!usersErr}
          />
          <StatCell
            title={`Users (${range})`}
            value={usersLoading ? "Loading…" : stats.totalInRange.toString()}
            change="Computed from fetched users"
          />
          <StatCell
            title={`Admins (${range})`}
            value={usersLoading ? "Loading…" : stats.admins.toString()}
            change="role = A"
          />
          <StatCell
            title={`Verified (${range})`}
            value={usersLoading ? "Loading…" : stats.verified.toString()}
            change="verified = true"
          />
        </dl>
      </div>

      {/* Recent activity — REAL /api/v1/activities/ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Recent activity</h2>
          <Chip size="sm" variant="flat">
            /api/v1/activities/
          </Chip>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
                <tr>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Meta</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {activitiesLoading ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-zinc-500" colSpan={3}>
                      Loading activities…
                    </td>
                  </tr>
                ) : activitiesErr ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-red-600" colSpan={3}>
                      {activitiesErr}
                    </td>
                  </tr>
                ) : recentActivities.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-zinc-500" colSpan={3}>
                      No activity found.
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((a: AnyActivity, idx: number) => (
                    <tr key={a?.id ?? idx} className="text-sm">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">
                          {a?.title ?? a?.action ?? a?.name ?? "Activity"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {a?.description ?? a?.details ?? a?.message ?? ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-zinc-700">
                        {a?.user ?? a?.user_id ?? a?.email ?? a?.entity ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-600">
                        {a?.created_at
                          ? new Date(a.created_at).toLocaleString()
                          : a?.timestamp
                          ? new Date(a.timestamp).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent users — REAL */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Recent users</h2>
          <Button size="sm" variant="flat" onPress={() => (window.location.href = "/admin/users")}>
            View all
          </Button>
        </div>

        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {usersLoading ? (
            <li className="text-sm text-zinc-500">Loading users…</li>
          ) : usersErr ? (
            <li className="text-sm text-red-600">{usersErr}</li>
          ) : (
            recentUsers.map((u: AnyUser) => (
              <li key={u?.id ?? u?.email} className="overflow-hidden rounded-2xl border bg-white">
                <div className="flex items-center gap-x-4 border-b bg-zinc-50 p-5">
                  <div className="size-12 rounded-xl bg-white border grid place-items-center font-semibold">
                    {(u?.email ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate">{displayName(u)}</div>
                    <div className="text-xs text-zinc-500 truncate">{u?.email ?? u?.username ?? "—"}</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Chip size="sm" variant="flat">
                      {u?.role ?? "—"}
                    </Chip>
                    <Chip size="sm" variant="flat" color={u?.verified ? "success" : "warning"}>
                      {u?.verified ? "Verified" : "Pending"}
                    </Chip>
                  </div>
                </div>

                <div className="p-5 text-sm">
                  <div className="flex justify-between">
                    <div className="text-zinc-500">Joined</div>
                    <div className="text-zinc-700">
                      {u?.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function StatCell({
  title,
  value,
  change,
  changeBad,
}: {
  title: string;
  value: string;
  change: string;
  changeBad?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t px-6 py-8 sm:border-l sm:border-t-0">
      <dt className="text-sm font-medium text-zinc-500">{title}</dt>
      <dd className={`text-xs font-medium ${changeBad ? "text-rose-600" : "text-zinc-700"}`}>{change}</dd>
      <dd className="w-full text-3xl font-semibold tracking-tight text-zinc-900">{value}</dd>
    </div>
  );
}
