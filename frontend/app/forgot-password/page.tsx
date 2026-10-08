"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Check,
  X,
  FileText,
  BarChart2,
  Briefcase,
  Target,
} from "lucide-react";

import AuthSplitLayout, { BenefitItem } from "@/components/public/AuthSplitLayout";
import AuthCollageSignIn from "@/components/public/AuthCollageSignIn";
import TrustRow from "@/components/public/TrustRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotPasswordBenefits: BenefitItem[] = [
  {
    icon: ShieldCheck,
    variant: "indigo",
    title: "Secure Verification",
    description: "Multi-layered encrypted protection",
  },
  {
    icon: FileText,
    variant: "blue",
    title: "Preserved Progress",
    description: "Keep all your resume drafts safe",
  },
  {
    icon: BarChart2,
    variant: "violet",
    title: "Real ATS Insights",
    description: "Instant access upon login",
  },
  {
    icon: Target,
    variant: "emerald",
    title: "Uninterrupted Career",
    description: "Quick recovery in seconds",
  },
];

type ResetStep = "email" | "otp" | "password" | "success";

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Current Step
  const [step, setStep] = useState<ResetStep>("email");

  // Form States
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend OTP Cooldown Timer
  const [cooldown, setCooldown] = useState<number>(0);

  // OTP Input slot refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Password Policy Checks
  const passwordRequirements: PasswordRequirement[] = [
    { id: "length", label: "At least 8 characters", met: newPassword.length >= 8 },
    { id: "uppercase", label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { id: "lowercase", label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { id: "number", label: "At least one number (0-9)", met: /[0-9]/.test(newPassword) },
    {
      id: "special",
      label: "At least one special character (!@#$%...)",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword),
    },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Calculate Password Strength Score (0 to 100)
  const strengthScore = (() => {
    if (!newPassword) return 0;
    const metCount = passwordRequirements.filter((r) => r.met).length;
    return Math.round((metCount / passwordRequirements.length) * 100);
  })();

  // -------------------------------------------------------------
  // Step 1: Send OTP to Email
  // -------------------------------------------------------------
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        if (data.cooldownSeconds) {
          setCooldown(data.cooldownSeconds);
        }
        return;
      }

      setCooldown(data.cooldownSeconds || 60);
      setSuccessMessage(data.message || "A 6-digit verification code was sent to your email.");
      setStep("otp");
      // Clear previous OTP digits
      setOtpDigits(["", "", "", "", "", ""]);
      // Focus first OTP field after transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 2: Handle OTP Input Slots & Verify OTP
  // -------------------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    // Keep only numbers
    const cleanVal = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // User pasted into slot or auto-filled
      const pastedChars = cleanVal.slice(0, 6).split("");
      pastedChars.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + pastedChars.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      newDigits[index] = cleanVal;
      setOtpDigits(newDigits);
      if (cleanVal && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    pasted.split("").forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setOtpDigits(newDigits);
    const focusTarget = Math.min(pasted.length, 5);
    otpInputRefs.current[focusTarget]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
        return;
      }

      setResetToken(data.resetToken);
      setSuccessMessage("Email verified successfully! Please set your new password.");
      setStep("password");
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 3: Save New Password
  // -------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!allRequirementsMet) {
      setError("Please ensure your password meets all the security requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    if (!resetToken) {
      setError("Session expired. Please restart the password reset process.");
      setStep("email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }

      setSuccessMessage(data.message || "Password updated successfully!");
      setStep("success");
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError("Unable to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      headerRightAction="signInPrompt"
      title="Secure Account Recovery"
      accentWord="Secure"
      subtitle="Easily reset your password and restore access to your HireLens AI career workspace."
      benefits={forgotPasswordBenefits}
      marketingCollage={<AuthCollageSignIn />}
      statGrowthLabel="Guaranteed Career Privacy"
    >
      {/* Centered Recovery Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step Indicator */}
        {step !== "success" && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === "email"
                    ? "bg-indigo-600 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {step === "email" ? "1" : <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email
              </span>
            </div>

            <div
              className={`h-0.5 flex-1 mx-2 rounded-full ${
                step === "otp" || step === "password"
                  ? "bg-indigo-600 dark:bg-indigo-500"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === "otp"
                    ? "bg-indigo-600 text-white"
                    : step === "password"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {step === "password" ? <Check className="w-3.5 h-3.5" /> : "2"}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === "otp" || step === "password"
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                Verify OTP
              </span>
            </div>

            <div
              className={`h-0.5 flex-1 mx-2 rounded-full ${
                step === "password"
                  ? "bg-indigo-600 dark:bg-indigo-500"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === "password"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === "password"
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                Password
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: ENTER EMAIL                                          */}
        {/* ============================================================ */}
        {step === "email" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Don&apos;t worry! Enter your registered email address and we&apos;ll send you a verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="reset-email"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: VERIFY OTP                                           */}
        {/* ============================================================ */}
        {step === "otp" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Verify Your Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Enter the 6-digit verification code sent to{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {email}
                </span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* 6-Digit Slot Input */}
              <div className="flex justify-center gap-2 sm:gap-2.5 my-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600/20 text-slate-900 dark:text-white transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && !error && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || otpDigits.join("").length !== 6}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Resend & Change Email Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("email");
                }}
                className="font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Change Email
              </button>

              <div className="flex items-center gap-1.5">
                {cooldown > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Resend code in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: CREATE NEW PASSWORD                                  */}
        {/* ============================================================ */}
        {step === "password" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your email has been verified. Set a strong new password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new strong password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Strength:</span>
                      <span
                        className={`font-bold ${
                          strengthScore < 50
                            ? "text-red-500"
                            : strengthScore < 80
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {strengthScore < 50 ? "Weak" : strengthScore < 80 ? "Medium" : "Strong"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          strengthScore < 50
                            ? "bg-red-500 w-1/3"
                            : strengthScore < 80
                            ? "bg-amber-500 w-2/3"
                            : "bg-emerald-500 w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-new-password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] font-medium text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Requirement Checklist */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Requirements:
                </span>
                {passwordRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                      req.met
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {req.met ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !allRequirementsMet || !passwordsMatch}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS                                              */}
        {/* ============================================================ */}
        {step === "success" && (
          <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/25 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                Password Reset Successful!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your password has been updated. You can now sign in using your new credentials.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Trust Row */}
        <TrustRow />
      </div>
    </AuthSplitLayout>
  );
}
