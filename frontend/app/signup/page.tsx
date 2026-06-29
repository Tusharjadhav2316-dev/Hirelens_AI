"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: SignupFormValues) => {
        setError(null);
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // 2. Update Auth profile with name
            await updateProfile(user, { displayName: data.name });

            // 3. Save additional info in Firestore per Database Schema requirement
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: data.name,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });

            router.push("/dashboard");
        } catch (error: unknown) {
            const err = error as any;
            console.error("Signup error:", err);
            // Simplify Firebase error messages
            if (err?.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please log in instead.");
            } else {
                setError("Failed to create account. Please try again later.");
            }
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
                        Start Building Your Future Career Today
                    </h1>
                    <ul className="space-y-4 text-blue-100 text-lg">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Intelligent ATS compatibility scoring
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            AI-powered content optimization
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Job description keyword matching
                        </li>
                    </ul>
                </div>

                <div className="relative z-10 text-blue-200 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                    © 2026 HireLens AI. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-y-auto">
                <div className="w-full max-w-[400px] space-y-8 my-auto">
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
                            Create an account
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Enter your details below to get started
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-2xl p-6 sm:p-8 transition-all duration-300">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    {...register("name")}
                                    className={`h-11 rounded-lg bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <p className="text-sm font-medium text-red-500">{errors.name.message}</p>
                                )}
                            </div>

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
                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
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

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                    className={`h-11 rounded-lg bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    disabled={isSubmitting}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm font-medium text-red-500">{errors.confirmPassword.message}</p>
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
                                        Creating account...
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Create account
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </div>

                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Sign in to your account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
