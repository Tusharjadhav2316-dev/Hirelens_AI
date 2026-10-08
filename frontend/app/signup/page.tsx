"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  FileText,
  BarChart2,
  Briefcase,
  Target
} from "lucide-react";

import AuthSplitLayout, { BenefitItem } from "@/components/public/AuthSplitLayout";
import AuthCollageSignUp from "@/components/public/AuthCollageSignUp";
import AuthProcessTimeline from "@/components/public/AuthProcessTimeline";
import SocialAuthButtons from "@/components/public/SocialAuthButtons";
import TrustRow from "@/components/public/TrustRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z
  .object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const signupBenefits: BenefitItem[] = [
  {
    icon: FileText,
    variant: "blue",
    title: "Build & Optimize",
    description: "Create standout resumes with AI",
  },
  {
    icon: BarChart2,
    variant: "violet",
    title: "Get Real Insights",
    description: "Check ATS score and improve",
  },
  {
    icon: Briefcase,
    variant: "emerald",
    title: "Match Opportunities",
    description: "Find jobs that fit your skills",
  },
  {
    icon: Target,
    variant: "amber",
    title: "Grow Your Career",
    description: "Get personalized guidance",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: true,
    },
  });

  const termsAccepted = watch("termsAccepted");

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Save display name to Firebase user profile
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.fullName,
        });
      }

      router.push("/dashboard/agent");
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err?.code === "auth/email-already-in-use") {
        setError("This email address is already registered. Please sign in.");
      } else if (err?.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err?.message || "Failed to create account. Please try again.");
      }
    }
  };

  return (
    <AuthSplitLayout
      headerRightAction="signInPrompt"
      title="Create Your Future With HireLens"
      accentWord="HireLens"
      subtitle="Join a platform trusted by 500K+ students and professionals to build better resumes, get real insights, and unlock new opportunities with the power of AI."
      benefits={signupBenefits}
      marketingCollage={
        <div className="space-y-3">
          <AuthCollageSignUp />
          <AuthProcessTimeline />
        </div>
      }
      statGrowthLabel="Achieve Career Growth"
    >
      {/* Centered White Card (Identical Geometry & Light Styling to Sign In) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        {/* Card Header with Centered Logo */}
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
              HL
            </div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              HireLens
            </span>
          </div>

          <h2 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create an account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start your journey towards a brighter career.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Full Name Field */}
          <div className="space-y-1">
            <Label
              htmlFor="fullName"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Full Name
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Rivera"
                autoComplete="name"
                {...register("fullName")}
                className={`pl-10 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                className={`pl-10 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                {...register("password")}
                className={`pl-10 pr-10 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`pl-10 pr-10 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Legal Terms Checkbox */}
          <div className="space-y-1 pt-0.5">
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setValue("termsAccepted", e.target.checked, { shouldValidate: true })}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-[11px] text-slate-600 dark:text-slate-400 select-none cursor-pointer leading-tight"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Submit Button: Gradient Indigo */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Social Authentication Row */}
        <div className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400">
              or continue with
            </span>
          </div>

          <SocialAuthButtons
            onSuccess={() => router.push("/dashboard/agent")}
            onError={(msg) => setError(msg)}
          />
        </div>

        {/* Footer Link */}
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in
          </Link>
        </p>

        {/* Trust Badges */}
        <TrustRow />
      </div>
    </AuthSplitLayout>
  );
}
