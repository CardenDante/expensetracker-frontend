"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
  Spacer,
} from "@heroui/react";
import { auth } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_BASE;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null);

  const envOk = useMemo(() => {
    return !!API && !!CLIENT_ID;
  }, []);

  async function login() {
    setErr(null);
    setRaw(null);

    console.log("====== LOGIN DEBUG START ======");
    console.log("API:", API);
    console.log("CLIENT_ID:", CLIENT_ID);
    console.log("emailOrUsername:", emailOrUsername);
    console.log("password length:", password?.length);

    if (!API || !CLIENT_ID) {
      const msg = "Missing env vars: NEXT_PUBLIC_API_BASE or NEXT_PUBLIC_CLIENT_ID";
      console.error(msg);
      setErr(msg);
      return;
    }

    if (!emailOrUsername.trim() || !password) {
      const msg = "Please enter email/username and password.";
      console.warn(msg);
      setErr(msg);
      return;
    }

    setLoading(true);

    try {
      // OAuth2 Password Grant (form-encoded)
      const form = new URLSearchParams();
      form.set("grant_type", "password");
      form.set("username", emailOrUsername.trim()); // backend may treat email as username
      form.set("password", password);
      form.set("client_id", CLIENT_ID);

      console.log("POST:", `${API}/auth/token/`);
      console.log("FORM:", Object.fromEntries(form.entries()));

      const res = await fetch(`${API}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });

      const data = await res.json().catch(() => ({}));
      console.log("STATUS:", res.status);
      console.log("RESPONSE JSON:", data);
      setRaw(data);

      if (!res.ok) {
        const msg =
          data?.error_description ||
          data?.detail ||
          data?.message ||
          "Login failed (non-200). Check response JSON below.";
        throw new Error(msg);
      }

      // Most common is data.access_token
      const token =
        data?.access_token ||
        data?.token?.access_token ||
        data?.token ||
        null;

      console.log("EXTRACTED TOKEN:", token ? `${String(token).slice(0, 12)}…` : null);

      if (!token) {
        throw new Error("Login succeeded but no access token found in response.");
      }

      auth.set(String(token));
      console.log("SAVED TOKEN:", auth.get() ? "YES" : "NO");

      console.log("Redirecting to /admin …");
      router.replace("/admin");
    } catch (e: any) {
      console.error("LOGIN ERROR:", e);
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
      console.log("====== LOGIN DEBUG END ======");
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-zinc-50">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-md rounded-2xl">
          <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
            <h1 className="text-2xl font-semibold leading-tight">Admin Login</h1>
            <p className="text-sm text-zinc-500">
              Sign in to access the admin dashboard.
            </p>
          </CardHeader>

          <CardBody className="px-6 pb-6">
            {!envOk && (
              <div className="text-sm text-red-600">
                Missing env vars. Check:
                <div className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  NEXT_PUBLIC_API_BASE<br />
                  NEXT_PUBLIC_CLIENT_ID
                </div>
                <Spacer y={4} />
              </div>
            )}

            <Input
              label="Email / Username"
              value={emailOrUsername}
              onValueChange={setEmailOrUsername}
              placeholder="admin@example.com"
              isDisabled={loading}
            />

            <Spacer y={3} />

            <Input
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              placeholder="••••••••"
              isDisabled={loading}
            />

            <Spacer y={4} />

            <Button
              color="primary"
              className="w-full"
              isLoading={loading}
              onPress={login}
            >
              Sign in
            </Button>

            <Spacer y={4} />
            <Divider />
            <Spacer y={3} />

            {err && (
              <div className="text-sm text-red-600">
                {err}
              </div>
            )}

            {raw && (
              <div className="mt-3">
                <div className="text-xs text-zinc-500 mb-2">
                  Debug response (copy/paste this to me):
                </div>
                <pre className="text-xs overflow-auto rounded-xl bg-zinc-100 p-3 max-h-56">
                  {JSON.stringify(raw, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-4 text-sm text-zinc-500">
              No account?{" "}
              <a className="text-blue-600 hover:underline" href="/signup">
                Create one
              </a>
            </div>
          </CardBody>
        </Card>

        <div className="mt-4 text-xs text-zinc-500">
          Tip: open DevTools → Console to see full logs.
        </div>
      </div>
    </div>
  );
}
