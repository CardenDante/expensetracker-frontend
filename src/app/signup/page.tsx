"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Input, Button } from "@heroui/react";
import { auth } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_BASE!;

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signup() {
    setErr(null);
    setLoading(true);

    try {
      // API docs show email + password required for signup 
      const payload: any = {
        email,
        password,
      };

      // If your API expects "full_name" (common), send it.
      // If it expects first_name/last_name instead, we can adjust.
      if (fullName.trim()) payload.full_name = fullName.trim();

      const r = await fetch(`${API}/api/v1/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        // DRF errors often return field-level messages
        const msg =
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.detail ||
          "Signup failed";
        throw new Error(msg);
      }

      // Docs say response includes token object 
      const token =
        data?.token?.access_token ||
        data?.access_token ||
        data?.token?.token;

      if (token) auth.set(token);

      // Go to admin/dashboard
      router.push("/admin");
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-b from-zinc-50 to-white">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="gap-4 p-8">
          <div>
            <h1 className="text-2xl font-semibold">Create account</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sign up to access the dashboard.
            </p>
          </div>

          <Input
            label="Full name"
            value={fullName}
            onValueChange={setFullName}
            placeholder="John Doe"
          />

          <Input
            label="Email"
            value={email}
            onValueChange={setEmail}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onValueChange={setPassword}
            placeholder="••••••••"
          />

          {err && <p className="text-sm text-red-500">{err}</p>}

          <Button
            color="primary"
            isLoading={loading}
            onPress={signup}
            className="w-full"
          >
            Create account
          </Button>

          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <a className="text-blue-600 hover:underline" href="/login">
              Login
            </a>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
