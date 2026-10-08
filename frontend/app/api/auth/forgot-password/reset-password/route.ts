import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

function getEmailDocId(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

function validatePasswordPolicy(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character." };
  }
  return { isValid: true };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const rawResetToken = body?.resetToken;
    const rawPassword = body?.newPassword;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!rawResetToken || typeof rawResetToken !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing reset authorization token." },
        { status: 400 }
      );
    }

    if (!rawPassword || typeof rawPassword !== "string") {
      return NextResponse.json(
        { error: "A new password is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    const resetToken = rawResetToken.trim();
    const newPassword = rawPassword;

    // Validate password policy server-side
    const policyResult = validatePasswordPolicy(newPassword);
    if (!policyResult.isValid) {
      return NextResponse.json(
        { error: policyResult.message },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    const docId = getEmailDocId(email);
    const otpDocRef = adminDb.collection("password_reset_otps").doc(docId);
    const snap = await otpDocRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Reset session not found. Please start the password reset process again." },
        { status: 400 }
      );
    }

    const data = snap.data();
    const now = Date.now();

    if (data?.isUsed) {
      return NextResponse.json(
        { error: "This password reset authorization has already been used. Please request a new code." },
        { status: 400 }
      );
    }

    if (!data?.resetToken || data.resetToken !== resetToken) {
      return NextResponse.json(
        { error: "Invalid reset authorization token. Please restart the verification process." },
        { status: 403 }
      );
    }

    if (!data?.resetTokenExpiresAt || now > data.resetTokenExpiresAt) {
      return NextResponse.json(
        { error: "Password reset authorization has expired. Please restart the process." },
        { status: 400 }
      );
    }

    const uid = data.uid;
    if (!uid) {
      return NextResponse.json(
        { error: "Account identifier not found for this session." },
        { status: 400 }
      );
    }

    // Update password in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    // Revoke all existing refresh tokens for security
    try {
      await adminAuth.revokeRefreshTokens(uid);
    } catch (revokeErr) {
      console.warn("[ResetPassword] Notice: could not revoke refresh tokens:", revokeErr);
    }

    // Invalidate reset authorization token immediately (single-use)
    await otpDocRef.update({
      isUsed: true,
      resetToken: null,
      resetTokenExpiresAt: null,
      completedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully updated. You can now sign in.",
    });
  } catch (error: any) {
    console.error("[ResetPassword] Unhandled error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}
