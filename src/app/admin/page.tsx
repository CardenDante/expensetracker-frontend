"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Chip, Button } from "@heroui/react";
import { api } from "@/lib/api-client";

type AnyUser = any;

function normalizeUsers(data: any): AnyUser[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function fmt(n: number | null) {
  if (n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat().format(n);
}

export default function AdminHome() {
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // range tabs (UI-only for now)
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await api("/api/v1/users/?page_size=200", { method: "GET" });
      console.log("[Dashboard] users:", r.status, r.data);

      if (r.ok) {
        const list = normalizeUsers(r.data);
        setUsers(list);

        const c =
          typeof r.data?.count === "number" ? r.data.count : Array.isArray(list) ? list.length : null;

        setCount(c);
      }

      setLoading(false);
    })();
  }, []);

  const now = Date.now();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 36500;

  const withinRange = useMemo(() => {
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return users.filter((u) => {
      const dt = u?.date_joined ? new Date(u.date_joined).getTime() : 0;
      return range === "all" ? true : dt >= cutoff;
    });
  }, [users, range, now, days]);

  const verifiedCount = useMemo(() => withinRange.filter((u) => !!u?.verified).length, [withinRange]);
  const adminCount = useMemo(() => withinRange.filter((u) => u?.role === "A").length, [withinRange]);
  const newUsers = useMemo(() => withinRange.length, [withinRange]);

  const recentUsers = useMemo(() => {
    return [...withinRange]
      .sort((a, b) => new Date(b?.date_joined ?? 0).getTime() - new Date(a?.date_joined ?? 0).getTime())
      .slice(0, 8);
  }, [withinRange]);

  // "Recent activity" table: use recent signups as activity until we wire real transactions
  const recentActivity = useMemo(() => {
    return recentUsers.map((u, i) => ({
      id: u?.id ?? i,
      title: "User signup",
      subtitle: u?.email ?? u?.username ?? "—",
      status: u?.verified ? "Verified" : "Pending",
      role: u?.role ?? "—",
      when: u?.date_joined ?? null,
    }));
  }, [recentUsers]);

  return (
    <div className="space-y-10">
      {/* Secondary header */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-base font-semibold text-zinc-900">Admin Dashboard</h1>

        <div className="flex items-center gap-2 rounded-xl bg-white border px-2 py-1">
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

        <div className="ml-auto">
          <Button color="primary" variant="solid" onPress={() => (window.location.href = "/admin/users")}>
            View users
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border rounded-2xl overflow-hidden">
        <StatCell title="Total users" value={fmt(count)} change={loading ? "Loading…" : `${range}`} />
        <StatCell title="New users" value={fmt(newUsers)} change={range === "all" ? "All-time" : `In range`} />
        <StatCell title="Admins" value={fmt(adminCount)} change="role=A" />
        <StatCell title="Verified" value={fmt(verifiedCount)} change="verified=true" />
      </div>

      {/* Recent activity table */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Recent activity</h2>
          <a href="/admin/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all users
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
                <tr>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3 hidden sm:table-cell">User</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-zinc-500" colSpan={4}>
                      No activity yet.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((a) => (
                    <tr key={a.id} className="text-sm">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">{a.title}</div>
                        <div className="text-xs text-zinc-500">Role: {a.role}</div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-zinc-700">{a.subtitle}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            a.status === "Verified"
                              ? "text-green-700 bg-green-50 ring-green-600/20"
                              : "text-amber-700 bg-amber-50 ring-amber-600/20"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-600">
                        {a.when ? new Date(a.when).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent users cards */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Recent users</h2>
          <a href="/admin/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all
          </a>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {recentUsers.map((u) => (
            <li key={u?.id ?? u?.email} className="overflow-hidden rounded-2xl border bg-white">
              <div className="flex items-center gap-3 border-b bg-zinc-50 p-5">
                <div className="size-10 rounded-xl bg-white border grid place-items-center text-sm font-semibold">
                  {(u?.email ?? "U").slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 truncate">{u?.email ?? "—"}</div>
                  <div className="text-xs text-zinc-500 truncate">{u?.username ?? "—"}</div>
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
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">Joined</dt>
                    <dd className="text-zinc-700">
                      {u?.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">Referral code</dt>
                    <dd className="text-zinc-700">{u?.referral_code ?? "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">Available</dt>
                    <dd className="text-zinc-700">{String(u?.available ?? "—")}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCell({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t px-6 py-8 sm:border-l sm:border-t-0">
      <div className="text-sm font-medium text-zinc-500">{title}</div>
      <div className="text-xs font-medium text-zinc-600">{change}</div>
      <div className="w-full text-3xl font-semibold tracking-tight text-zinc-900">{value}</div>
    </div>
  );
}
