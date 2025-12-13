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

function normalizeUsers(data: any): AnyUser[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function displayName(u: AnyUser) {
  const full = String(u?.full_name ?? "").trim();
  if (full) return full;

  const first = String(u?.first_name ?? "").trim();
  const last = String(u?.last_name ?? "").trim();
  const combined = `${first} ${last}`.trim();
  return combined || "—";
}

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AnyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const r = await api("/api/v1/users/?page_size=200", { method: "GET" });
      console.log("[UsersPage] status:", r.status);
      console.log("[UsersPage] data:", r.data);

      if (!r.ok) {
        setErr(r.status === 401 || r.status === 403 ? "Not allowed to list users." : "Failed to load users.");
        setRows([]);
        setLoading(false);
        return;
      }

      setRows(normalizeUsers(r.data));
      setLoading(false);
    })();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage registered users.</p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="flat" onPress={() => (window.location.href = "/admin")}>
            Back
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardBody className="gap-4">
          <Input
            label="Search"
            value={q}
            onValueChange={setQ}
            placeholder="Search by name, email, username…"
          />

          {err && <p className="text-sm text-red-600">{err}</p>}

          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>VERIFIED</TableColumn>
              <TableColumn>JOINED</TableColumn>
            </TableHeader>

            <TableBody
              isLoading={loading}
              emptyContent={loading ? "Loading…" : "No users found"}
              items={filtered}
            >
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
        </CardBody>
      </Card>
    </div>
  );
}
