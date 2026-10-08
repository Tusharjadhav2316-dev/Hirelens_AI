import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";

function hashOtp(otp: string, salt: string = ""): string {
  return crypto
    .createHash("sha256")
    .update(`${otp}:${salt}:${process.env.INTERNAL_AGENT_JWT_SECRET || "hirelens_salt"}`)
    .digest("hex");
}

function getEmailDocId(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const rawOtp = body?.otp;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!rawOtp || typeof rawOtp !== "string" || !/^\d{6}$/.test(rawOtp.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    const otp = rawOtp.trim();

    const adminDb = getAdminDb();
    const docId = getEmailDocId(email);
    const otpDocRef = adminDb.collection("password_reset_otps").doc(docId);
    const snap = await otpDocRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Invalid or expired verification session. Please request a new code." },
        { status: 400 }
      );
    }

    const data = snap.data();
    const now = Date.now();

    if (data?.isUsed) {
      return NextResponse.json(
        { error: "This verification session has already been completed. Please request a new code." },
        { status: 400 }
      );
    }

    if (!data?.expiresAt || now > data.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    const attemptsRemaining = typeof data?.attemptsRemaining === "number" ? data.attemptsRemaining : 0;
    if (attemptsRemaining <= 0) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. For your security, please request a new code." },
        { status: 400 }
      );
    }

    const inputHash = hashOtp(otp, email);

    if (inputHash !== data?.otpHashed) {
      const newAttempts = attemptsRemaining - 1;
      await otpDocRef.update({
        attemptsRemaining: newAttempts,
        updatedAt: now,
      });

      if (newAttempts <= 0) {
        return NextResponse.json(
          { error: "Too many incorrect attempts. Please request a new code." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Incorrect verification code. ${newAttempts} attempt${newAttempts === 1 ? "" : "s"} remaining.`,
          attemptsRemaining: newAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is correct. Generate a high-entropy single-use reset authorization token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Invalidate the OTP immediately so it cannot be reused
    await otpDocRef.update({
      otpHashed: null, // Wipe OTP hash
      attemptsRemaining: 0,
      resetToken,
      resetTokenExpiresAt,
      verifiedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      resetToken,
      message: "Code verified successfully.",
    });
  } catch (error: any) {
    console.error("[VerifyOTP] Unhandled error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
