"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Pagination,
} from "@heroui/react";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api-client";

type AnyUser = any;

function displayName(u: AnyUser) {
  const full = String(u?.full_name ?? "").trim();
  if (full) return full;

  const first = String(u?.first_name ?? "").trim();
  const last = String(u?.last_name ?? "").trim();
  const combined = `${first} ${last}`.trim();
  return combined || "—";
}

function normalizeResults(data: any) {
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return {
      count: typeof data.count === "number" ? data.count : null,
      results: data.results,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }
  if (Array.isArray(data)) {
    return { count: data.length, results: data, next: null, previous: null };
  }
  return { count: null, results: [], next: null, previous: null };
}

const roleColors: Record<string, string> = {
  A: 'primary',
  N: 'default',
  C: 'success',
  T: 'warning',
};

const roleLabels: Record<string, string> = {
  A: 'Admin',
  N: 'User',
  C: 'Care',
  T: 'Tech',
};

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AnyUser[]>([]);
  const [count, setCount] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(p: number) {
    setLoading(true);
    setErr(null);

    const r = await api(`/api/v1/users/?page=${p}&page_size=${pageSize}`, { method: "GET" });

    if (!r.ok) {
      setErr(r.status === 401 || r.status === 403 ? "Not allowed to list users." : "Failed to load users.");
      setRows([]);
      setCount(null);
      setLoading(false);
      return;
    }

    const norm = normalizeResults(r.data);
    setRows(norm.results);
    setCount(norm.count);
    setLoading(false);
  }

  useEffect(() => {
    load(page);
  }, [page]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((u) => {
      const name = displayName(u).toLowerCase();
      const email = String(u?.email ?? "").toLowerCase();
      const username = String(u?.username ?? "").toLowerCase();
      return name.includes(s) || email.includes(s) || username.includes(s);
    });
  }, [q, rows]);

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500 mt-1">
                  Manage and monitor all user accounts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Chip variant="flat" color="primary">
                {count !== null ? `${count} total` : 'Loading...'}
              </Chip>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <Input
              placeholder="Search by name, email, or username..."
              value={q}
              onValueChange={setQ}
              startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
              size="lg"
              classNames={{
                input: "text-base",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {err && (
          <Card className="rounded-2xl border-red-200 bg-red-50 mb-6">
            <CardBody>
              <p className="text-sm text-red-600">{err}</p>
            </CardBody>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-2xl">
                <CardBody className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {q ? 'Try adjusting your search' : 'No users available'}
            </p>
          </div>
        ) : (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filtered.map((user) => (
                <Card
                  key={user?.id ?? user?.email}
                  className="rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {displayName(user).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {displayName(user)}
                          </h3>
                          {user?.verified && (
                            <CheckBadgeIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{user?.email ?? "—"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Role</span>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={roleColors[user?.role] || 'default'}
                        >
                          {roleLabels[user?.role] || user?.role || "—"}
                        </Chip>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={user?.verified ? "success" : "warning"}
                          startContent={user?.verified ?
                            <CheckBadgeIcon className="h-3 w-3" /> :
                            <XCircleIcon className="h-3 w-3" />
                          }
                        >
                          {user?.verified ? "Verified" : "Pending"}
                        </Chip>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Joined</span>
                        <span className="text-gray-700 font-medium">
                          {user?.date_joined
                            ? new Date(user.date_joined).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                  color="primary"
                  size="lg"
                  classNames={{
                    wrapper: "gap-2",
                    item: "bg-white border border-gray-200",
                    cursor: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg",
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
