"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Divider, Spacer, Link } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { auth } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_BASE;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const envOk = useMemo(() => {
    return !!API && !!CLIENT_ID;
  }, []);

  async function login() {
    setErr(null);

    if (!API || !CLIENT_ID) {
      const msg = "Missing env vars: NEXT_PUBLIC_API_BASE or NEXT_PUBLIC_CLIENT_ID";
      setErr(msg);
      return;
    }

    if (!emailOrUsername.trim() || !password) {
      const msg = "Please enter email/username and password.";
      setErr(msg);
      return;
    }

    setLoading(true);

    try {
      const form = new URLSearchParams();
      form.set("grant_type", "password");
      form.set("username", emailOrUsername.trim());
      form.set("password", password);
      form.set("client_id", CLIENT_ID);

      const res = await fetch(`${API}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.error_description ||
          data?.detail ||
          data?.message ||
          "Login failed. Please check your credentials.";
        throw new Error(msg);
      }

      const token =
        data?.access_token ||
        data?.token?.access_token ||
        data?.token ||
        null;

      if (!token) {
        throw new Error("Login succeeded but no access token found in response.");
      }

      auth.set(String(token));
      router.replace("/admin");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      login();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Left side - Image/Brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-xl">ET</span>
            </div>
            <span className="text-white font-bold text-2xl">Expense Tracker</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome back to<br />Admin Dashboard
          </h1>
          <p className="text-indigo-100 text-lg max-w-md">
            Manage your users, track activities, and monitor statistics all in one powerful dashboard.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Secure Authentication</h3>
              <p className="text-indigo-200 text-sm">OAuth2 powered login system</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Lightning Fast</h3>
              <p className="text-indigo-200 text-sm">Optimized for performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">ET</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Expense Tracker</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
              <p className="text-gray-600">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            {!envOk && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">Configuration Error</p>
                <p className="text-xs text-red-600">
                  Missing environment variables. Please check your .env file.
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <Input
                  label="Email / Username"
                  labelPlacement="outside"
                  value={emailOrUsername}
                  onValueChange={setEmailOrUsername}
                  placeholder="admin@example.com"
                  isDisabled={loading}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    label: "font-medium"
                  }}
                />
              </div>

              <div>
                <Input
                  label="Password"
                  labelPlacement="outside"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onValueChange={setPassword}
                  placeholder="Enter your password"
                  isDisabled={loading}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    label: "font-medium"
                  }}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {err && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{err}</p>
                </div>
              )}

              <Button
                color="primary"
                size="lg"
                className="w-full font-semibold text-base"
                isLoading={loading}
                onPress={login}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            <Divider className="my-6" />

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Protected by OAuth2 authentication
          </p>
        </div>
      </div>
    </div>
  );
}