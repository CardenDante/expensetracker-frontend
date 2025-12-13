"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
} from "@heroui/react";
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

function getQueryParam(url: string, name: string) {
  try {
    const u = new URL(url);
    return u.searchParams.get(name);
  } catch {
    return null;
  }
}

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AnyUser[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(p: number) {
    setLoading(true);
    setErr(null);

    const r = await api(`/api/v1/users/?page=${p}&page_size=${pageSize}`, { method: "GET" });
    console.log("[UsersPage] page:", p, "status:", r.status, "data:", r.data);

    if (!r.ok) {
      setErr(r.status === 401 || r.status === 403 ? "Not allowed to list users." : "Failed to load users.");
      setRows([]);
      setCount(null);
      setNextUrl(null);
      setPrevUrl(null);
      setLoading(false);
      return;
    }

    const norm = normalizeResults(r.data);
    setRows(norm.results);
    setCount(norm.count);
    setNextUrl(norm.next);
    setPrevUrl(norm.previous);
    setLoading(false);
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const totalPages = count ? Math.ceil(count / pageSize) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Showing {rows.length} users (page {page}
            {totalPages ? ` of ${totalPages}` : ""})
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="flat" onPress={() => (window.location.href = "/admin")}>
            Back
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardBody className="gap-4">
          <Input label="Search" value={q} onValueChange={setQ} placeholder="Search by name, email, username…" />

          {err && <p className="text-sm text-red-600">{err}</p>}

          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>VERIFIED</TableColumn>
              <TableColumn>JOINED</TableColumn>
            </TableHeader>

            <TableBody isLoading={loading} emptyContent={loading ? "Loading…" : "No users found"} items={filtered}>
              {(u: AnyUser) => (
                <TableRow key={u?.id ?? u?.email ?? u?.username}>
                  <TableCell>{displayName(u)}</TableCell>
                  <TableCell>{u?.email ?? "—"}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {u?.role ?? "—"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={u?.verified ? "success" : "warning"}>
                      {u?.verified ? "Yes" : "No"}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {u?.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="flat"
              isDisabled={!prevUrl || page <= 1 || loading}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="text-xs text-zinc-500">
              {count !== null ? `${count} total users` : "—"}
            </div>

            <Button
              color="primary"
              variant="flat"
              isDisabled={!nextUrl || loading}
              onPress={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
