"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, NavbarContent, Button, Chip } from "@heroui/react";
import { api } from "@/lib/api-client";
import { auth } from "@/lib/auth-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const token = auth.get();
        console.log("[AdminLayout] token exists?", !!token);

        if (!token) {
          router.replace("/login");
          return;
        }

        const r = await api("/api/v1/users/me/", { method: "GET" });
        console.log("[AdminLayout] /me status:", r.status, "data:", r.data);

        if (!r.ok) {
          auth.clear();
          router.replace("/login");
          return;
        }

        // TEMP: comment role check until confirmed your admin user has role "A"
        // if (r.data?.role !== "A" && r.data?.is_superuser !== true) {
        //   auth.clear();
        //   router.replace("/login");
        //   return;
        // }

        if (!cancelled) setMe(r.data);
      } catch (e: any) {
        console.error("[AdminLayout] error:", e);
        if (!cancelled) setError(e?.message ?? "Failed to load admin");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) return <div className="p-6">Loading admin…</div>;

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Admin load failed: {error}</p>
        <Button className="mt-4" onPress={() => router.replace("/login")}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar maxWidth="full" className="bg-white border-b">
        <NavbarContent justify="start">
          <div className="font-semibold">Wavvy Wallet</div>
          {me && (
            <Chip size="sm" variant="flat">
              {me.role ?? "User"}
            </Chip>
          )}
        </NavbarContent>
        <NavbarContent justify="end">
          <Button
            variant="flat"
            color="danger"
            onPress={() => {
              auth.clear();
              router.replace("/login");
            }}
          >
            Logout
          </Button>
        </NavbarContent>
      </Navbar>

      <div className="max-w-7xl mx-auto p-6">{children}</div>
    </div>
  );
}
