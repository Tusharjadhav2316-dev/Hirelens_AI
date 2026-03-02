"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

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
            router.push("/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Left Panel - Branding & Value Proposition */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-blue-600 p-12 text-white relative overflow-hidden">
                {/* Abstract Premium Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white blur-3xl mix-blend-overlay" />
                    <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400 blur-3xl mix-blend-overlay" />
                </div>

                <div className="relative z-10 flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-600 font-bold text-xl">
                        HL
                    </div>
                    <span className="text-2xl font-bold tracking-tight">HireLens AI</span>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                        Create ATS-Optimized Resumes with AI Intelligence
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                        Transform your resume creation from a manual process into an intelligent, data-driven experience that gets you hired.
                    </p>
                </div>

                <div className="relative z-10 text-blue-200 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                    © 2026 HireLens AI. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative">
                <div className="w-full max-w-[400px] space-y-8">
                    {/* Mobile Header (Hidden on Desktop) */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                            HL
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            HireLens AI
                        </span>
                    </div>

                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Welcome back
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-2xl p-6 sm:p-8 transition-all duration-300">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    className={`h-11 rounded-lg bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={isSubmitting}
                                />
                                {errors.email && (
                                    <p className="text-sm font-medium text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
                                    <Link href="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className={`h-11 rounded-lg bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={isSubmitting}
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 flex items-start gap-2">
                                    <div className="mt-0.5 shrink-0">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                                    </div>
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 mt-2 font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Sign in to account
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </div>

                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
