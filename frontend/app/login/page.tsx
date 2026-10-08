"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
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
import AuthCollageSignIn from "@/components/public/AuthCollageSignIn";
import SocialAuthButtons from "@/components/public/SocialAuthButtons";
import TrustRow from "@/components/public/TrustRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginBenefits: BenefitItem[] = [
  {
    icon: FileText,
    variant: "blue",
    title: "Smarter Resumes",
    description: "Create and optimize with AI",
  },
  {
    icon: BarChart2,
    variant: "violet",
    title: "Real ATS Insights",
    description: "Know what to improve",
  },
  {
    icon: Briefcase,
    variant: "emerald",
    title: "Find Better Opportunities",
    description: "Match with jobs that fit you",
  },
  {
    icon: Target,
    variant: "amber",
    title: "Achieve Your Goals",
    description: "Get step-by-step guidance",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/dashboard/agent");
    } catch (err: any) {
      console.error("Login error:", err);
      if (
        err?.code === "auth/invalid-credential" || 
        err?.code === "auth/user-not-found" || 
        err?.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again in a few minutes.");
      } else {
        setError(err?.message || "Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <AuthSplitLayout
      headerRightAction="backToHome"
      title="Your Career, Intelligently Guided."
      accentWord="Intelligently"
      subtitle="Sign in to access your personalized career workspace — build better resumes, get real insights, and move closer to your dream opportunities with the power of AI."
      benefits={loginBenefits}
      marketingCollage={<AuthCollageSignIn />}
      statGrowthLabel="Report Career Growth"
    >
      {/* Centered White Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Card Header with Centered Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
              HL
            </div>
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              HireLens
            </span>
          </div>

          <h2 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to continue your career journey.
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
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
                className={`pl-10 h-11 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 ${
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
          <div className="space-y-1.5">
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
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password")}
                className={`pl-10 pr-10 h-11 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 ${
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

          {/* Utility Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900"
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </Link>
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
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
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign up
          </Link>
        </p>

        {/* Trust Badges */}
        <TrustRow />
      </div>
    </AuthSplitLayout>
  );
}
