// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Input, Button, Card, CardBody, Link } from "@heroui/react";
// import { EyeIcon, EyeSlashIcon, CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";

// const API = process.env.NEXT_PUBLIC_API_BASE!;

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   // Password strength validation
//   const passwordStrength = {
//     hasLength: password.length >= 8,
//     hasUpper: /[A-Z]/.test(password),
//     hasLower: /[a-z]/.test(password),
//     hasNumber: /[0-9]/.test(password),
//   };

//   const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

//   useEffect(() => {
//     if (!token) {
//       setErr("Invalid or missing reset token. Please request a new password reset.");
//     }
//   }, [token]);

//   async function resetPassword() {
//     setErr(null);

//     if (!password) {
//       setErr("Please enter a new password.");
//       return;
//     }

//     if (!isPasswordStrong) {
//       setErr("Password doesn't meet all requirements.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setErr("Passwords do not match.");
//       return;
//     }

//     if (!token) {
//       setErr("Invalid reset token.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const r = await fetch(`${API}/api/v1/users/reset-password`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           token,
//           password,
//         }),
//       });

//       const data = await r.json().catch(() => ({}));

//       if (!r.ok) {
//         const msg = data?.detail || data?.message || "Failed to reset password.";
//         throw new Error(msg);
//       }

//       setSuccess(true);
//       setTimeout(() => {
//         router.push("/login");
//       }, 3000);
//     } catch (e: any) {
//       setErr(e?.message ?? "Failed to reset password");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !loading) {
//       resetPassword();
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex h-16 w-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
//             <LockClosedIcon className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
//           <p className="text-gray-600 mt-2">
//             Create a new secure password for your account
//           </p>
//         </div>

//         <Card className="rounded-2xl shadow-xl border border-gray-100">
//           <CardBody className="p-8">
//             {!success ? (
//               <div className="space-y-5">
//                 <div>
//                   <Input
//                     label="New Password"
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onValueChange={setPassword}
//                     placeholder="Create a strong password"
//                     isDisabled={loading || !token}
//                     onKeyPress={handleKeyPress}
//                     size="lg"
//                     classNames={{
//                       input: "text-base",
//                       label: "font-medium"
//                     }}
//                     endContent={
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="focus:outline-none"
//                       >
//                         {showPassword ? (
//                           <EyeSlashIcon className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <EyeIcon className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
//                     }
//                   />

//                   {/* Password strength indicators */}
//                   {password && (
//                     <div className="mt-3 space-y-2">
//                       <p className="text-xs font-medium text-gray-700">Password must contain:</p>
//                       <div className="grid grid-cols-2 gap-2 text-xs">
//                         <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-400'}`}>
//                           <CheckCircleIcon className="h-4 w-4" />
//                           <span>At least 8 characters</span>
//                         </div>
//                         <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
//                           <CheckCircleIcon className="h-4 w-4" />
//                           <span>Uppercase letter</span>
//                         </div>
//                         <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-600' : 'text-gray-400'}`}>
//                           <CheckCircleIcon className="h-4 w-4" />
//                           <span>Lowercase letter</span>
//                         </div>
//                         <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
//                           <CheckCircleIcon className="h-4 w-4" />
//                           <span>Number</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <Input
//                     label="Confirm Password"
//                     type={showConfirmPassword ? "text" : "password"}
//                     value={confirmPassword}
//                     onValueChange={setConfirmPassword}
//                     placeholder="Confirm your new password"
//                     isDisabled={loading || !token}
//                     onKeyPress={handleKeyPress}
//                     size="lg"
//                     classNames={{
//                       input: "text-base",
//                       label: "font-medium"
//                     }}
//                     endContent={
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         className="focus:outline-none"
//                       >
//                         {showConfirmPassword ? (
//                           <EyeSlashIcon className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <EyeIcon className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
//                     }
//                   />
//                   {confirmPassword && password !== confirmPassword && (
//                     <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
//                   )}
//                   {confirmPassword && password === confirmPassword && (
//                     <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
//                       <CheckCircleIcon className="h-4 w-4" />
//                       Passwords match
//                     </p>
//                   )}
//                 </div>

//                 {err && (
//                   <div className="p-3 rounded-lg bg-red-50 border border-red-200">
//                     <p className="text-sm text-red-600">{err}</p>
//                   </div>
//                 )}

//                 <Button
//                   color="primary"
//                   size="lg"
//                   className="w-full font-semibold text-base"
//                   isLoading={loading}
//                   onPress={resetPassword}
//                   isDisabled={!isPasswordStrong || password !== confirmPassword || !token}
//                 >
//                   {loading ? "Resetting..." : "Reset Password"}
//                 </Button>

//                 <div className="text-center">
//                   <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
//                     Back to login
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center space-y-4">
//                 <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-2">
//                   <CheckCircleIcon className="h-10 w-10 text-green-600" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-900">Password Reset Successful!</h3>
//                 <p className="text-gray-600">
//                   Your password has been reset successfully.
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Redirecting you to login page...
//                 </p>
//                 <div className="pt-4">
//                   <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
//                     Go to login now
//                   </Link>
//                 </div>
//               </div>
//             )}
//           </CardBody>
//         </Card>

//         {!success && (
//           <p className="mt-6 text-center text-xs text-gray-500">
//             Password must be at least 8 characters with uppercase, lowercase, and numbers
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
