"use client";

import { useState } from "react";
import { Input, Button, Card, CardBody, Link } from "@heroui/react";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const API = process.env.NEXT_PUBLIC_API_BASE!;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function requestReset() {
    setErr(null);
    setSuccess(false);

    if (!email.trim()) {
      setErr("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const r = await fetch(`${API}/api/v1/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        const msg = data?.detail || data?.message || "Failed to send reset email.";
        throw new Error(msg);
      }

      setSuccess(true);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      requestReset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <Card className="rounded-2xl shadow-xl border border-gray-100">
          <CardBody className="p-8">
            {!success ? (
              <div className="space-y-5">
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onValueChange={setEmail}
                    placeholder="Enter your email"
                    isDisabled={loading}
                    onKeyPress={handleKeyPress}
                    size="lg"
                    classNames={{
                      input: "text-base",
                      label: "font-medium"
                    }}
                    startContent={
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    }
                  />
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
                  onPress={requestReset}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-2">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Check your email</h3>
                <p className="text-gray-600">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    try again
                  </button>
                </p>
                <div className="pt-4">
                  <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500">
          This is a secure password recovery system
        </p>
      </div>
    </div>
  );
}
