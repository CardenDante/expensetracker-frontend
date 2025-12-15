"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Divider, Link } from "@heroui/react";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { auth } from "@/lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_BASE!;

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Password strength validation
  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  async function signup() {
    setErr(null);

    if (!fullName.trim()) {
      setErr("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErr("Please enter your email address.");
      return;
    }

    if (!password) {
      setErr("Please enter a password.");
      return;
    }

    if (!isPasswordStrong) {
      setErr("Password doesn't meet all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        email: email.trim(),
        password,
      };

      if (fullName.trim()) payload.full_name = fullName.trim();

      const r = await fetch(`${API}/api/v1/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg =
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.detail ||
          "Signup failed. Please try again.";
        throw new Error(msg);
      }

      const token =
        data?.token?.access_token ||
        data?.access_token ||
        data?.token?.token;

      if (token) auth.set(token);

      router.push("/admin");
    } catch (e: any) {
      setErr(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      signup();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Left side - Signup form */}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
              <p className="text-gray-600">
                Get started with your admin dashboard today
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <Input
                  label="Full Name"
                  labelPlacement="outside"
                  value={fullName}
                  onValueChange={setFullName}
                  placeholder="John Doe"
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
                  label="Email"
                  labelPlacement="outside"
                  type="email"
                  value={email}
                  onValueChange={setEmail}
                  placeholder="you@example.com"
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
                  placeholder="Create a strong password"
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

                {/* Password strength indicators */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Input
                  label="Confirm Password"
                  labelPlacement="outside"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  placeholder="Confirm your password"
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  }
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    Passwords match
                  </p>
                )}
              </div>

              {err && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{err}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                  Privacy Policy
                </Link>
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full font-semibold text-base"
                isLoading={loading}
                onPress={signup}
                isDisabled={!isPasswordStrong || password !== confirmPassword}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </div>

            <Divider className="my-6" />

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Secure registration with email verification
          </p>
        </div>
      </div>

      {/* Right side - Brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
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
            Start managing<br />your expenses today
          </h1>
          <p className="text-purple-100 text-lg max-w-md">
            Join thousands of users who trust our platform for comprehensive expense tracking and analytics.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Complete Control</h3>
              <p className="text-purple-200 text-sm">Manage every aspect of your expenses with our intuitive dashboard</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Advanced Analytics</h3>
              <p className="text-purple-200 text-sm">Get insights into your spending patterns with detailed reports</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Bank-Level Security</h3>
              <p className="text-purple-200 text-sm">Your data is encrypted and protected with industry-standard security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}