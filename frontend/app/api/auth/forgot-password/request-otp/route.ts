import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { sendOtpEmail } from "@/lib/emailService";

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

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address format." },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Check if account exists without revealing existence to attacker
    let userRecord = null;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (err: any) {
      if (err?.code !== "auth/user-not-found") {
        console.error("[RequestOTP] Error querying Firebase user:", err);
      }
    }

    // Generic response message to prevent account enumeration
    const genericResponse = {
      success: true,
      message: "If an account exists for this email, a verification code will be sent.",
      cooldownSeconds: 60,
    };

    if (!userRecord) {
      // Return 200 with generic response if user is not in database
      return NextResponse.json(genericResponse);
    }

    const docId = getEmailDocId(email);
    const otpDocRef = adminDb.collection("password_reset_otps").doc(docId);
    const existingSnap = await otpDocRef.get();

    const now = Date.now();

    if (existingSnap.exists) {
      const data = existingSnap.data();
      if (data?.resendAvailableAt && now < data.resendAvailableAt) {
        const remainingSec = Math.ceil((data.resendAvailableAt - now) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${remainingSec} seconds before requesting a new code.`,
            cooldownSeconds: remainingSec,
          },
          { status: 429 }
        );
      }
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otpNumber = crypto.randomInt(100000, 1000000);
    const otp = otpNumber.toString();
    const otpHashed = hashOtp(otp, email);

    const expiresInMinutes = 10;
    const expiresAt = now + expiresInMinutes * 60 * 1000;
    const resendAvailableAt = now + 60 * 1000; // 60s cooldown

    // Save challenge to Firestore (overwriting any previous OTP challenge)
    await otpDocRef.set({
      email,
      uid: userRecord.uid,
      otpHashed,
      expiresAt,
      resendAvailableAt,
      attemptsRemaining: 5,
      isUsed: false,
      resetToken: null,
      resetTokenExpiresAt: null,
      createdAt: now,
      updatedAt: now,
    });

    // Send email via transactional email service
    const emailResult = await sendOtpEmail({
      to: email,
      otp,
      expiresInMinutes,
    });

    if (!emailResult.success) {
      console.error("[RequestOTP] Failed to deliver email:", emailResult.error);
      return NextResponse.json(
        { error: "Unable to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(genericResponse);
  } catch (error: any) {
    console.error("[RequestOTP] Unhandled error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
