"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SocialAuthButtonsProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (errMessage: string) => void;
}

export default function SocialAuthButtons({
  className = "",
  onSuccess,
  onError,
}: SocialAuthButtonsProps) {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingProvider("google");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/agent");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      const msg =
        err?.code === "auth/popup-closed-by-user"
          ? "Sign-in cancelled."
          : err?.message || "Failed to sign in with Google.";
      if (onError) onError(msg);
      else toast.error(msg);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleMockSocial = (name: string) => {
    toast.info(`${name} login is in preview mode. Please use Google or Email.`);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loadingProvider !== null}
        className="flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Sign in with Google"
      >
        {loadingProvider === "google" ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          <Image
            src="/icons/google.svg"
            alt="Google"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        )}
        <span className="hidden xs:inline">Google</span>
      </button>

      {/* GitHub Sign In */}
      <button
        type="button"
        onClick={() => handleMockSocial("GitHub")}
        disabled={loadingProvider !== null}
        className="flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98] disabled:opacity-60"
        aria-label="Sign in with GitHub"
      >
        <Image
          src="/icons/github.svg"
          alt="GitHub"
          width={16}
          height={16}
          className="w-4 h-4 dark:invert"
        />
        <span className="hidden xs:inline">GitHub</span>
      </button>

      {/* LinkedIn Sign In */}
      <button
        type="button"
        onClick={() => handleMockSocial("LinkedIn")}
        disabled={loadingProvider !== null}
        className="flex items-center justify-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98] disabled:opacity-60"
        aria-label="Sign in with LinkedIn"
      >
        <Image
          src="/icons/linkedin.svg"
          alt="LinkedIn"
          width={16}
          height={16}
          className="w-4 h-4"
        />
        <span className="hidden xs:inline">LinkedIn</span>
      </button>
    </div>
  );
}
