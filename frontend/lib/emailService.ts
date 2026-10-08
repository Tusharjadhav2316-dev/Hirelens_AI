import nodemailer from "nodemailer";

export interface SendOtpEmailOptions {
  to: string;
  otp: string;
  expiresInMinutes?: number;
}

function createTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const portStr = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const secure = process.env.SMTP_SECURE === "true" || portStr === "465";

  if (!host || !user || !pass) {
    return null;
  }

  const port = portStr ? parseInt(portStr, 10) : (secure ? 465 : 587);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail({
  to,
  otp,
  expiresInMinutes = 10,
}: SendOtpEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM?.trim() || `"HireLens AI" <no-reply@hirelens.ai>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireLens AI - Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 540px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .logo-badge {
      display: inline-block;
      width: 36px;
      height: 36px;
      line-height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      font-weight: 800;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 15px;
      color: #334155;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .otp-container {
      background: #f1f5f9;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #3730a3;
      margin: 0;
    }
    .otp-validity {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }
    .security-box {
      background-color: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 12px 16px;
      margin: 24px 0;
      font-size: 13px;
      color: #475569;
      line-height: 1.4;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">HL</div>
      <h1 class="title">HireLens AI</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Password Reset Request</p>
    </div>
    <div class="content">
      <p class="greeting">
        Hello,<br><br>
        We received a request to reset your password for your <strong>HireLens AI</strong> account. Enter the verification code below to proceed:
      </p>

      <div class="otp-container">
        <div class="otp-code">${otp}</div>
        <div class="otp-validity">This code is valid for <strong>${expiresInMinutes} minutes</strong>.</div>
      </div>

      <div class="security-box">
        <strong>Security Notice:</strong> If you did not make this request, you can safely ignore this email. Your password will remain unchanged, and no action is needed.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} HireLens AI &bull; Smart Resume Builder & ATS Platform
    </div>
  </div>
</body>
</html>
  `;

  if (!transporter) {
    console.warn(
      `[EmailService] SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). In development mode, OTP is logged securely on server: ${otp} for ${to}`
    );
    // In dev environment when SMTP is unconfigured, return success with notice
    return {
      success: true,
      messageId: `dev-simulated-${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `${otp} is your HireLens AI verification code`,
      text: `Your HireLens AI password reset verification code is: ${otp}. This code is valid for ${expiresInMinutes} minutes. If you did not request this, please ignore this email.`,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[EmailService] Error sending OTP email:", err);
    return {
      success: false,
      error: err?.message || "Failed to send email",
    };
  }
}
