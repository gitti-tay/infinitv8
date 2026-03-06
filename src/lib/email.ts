import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "INFINITV8 <noreply@infinitv8.com>";

export async function sendVerificationCode(email: string, code: string) {
  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "INFINITV8 — Verify Your Email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 900; color: white;">&infin;</div>
          <h1 style="font-size: 22px; font-weight: 800; color: #111; margin: 12px 0 4px;">INFINITV8</h1>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; color: #111; text-align: center; margin-bottom: 8px;">
          Verify Your Email
        </h2>
        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 28px;">
          Enter the code below to activate your account.
        </p>

        <div style="background: #f4f6f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111; font-family: monospace;">${code}</span>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center; margin-bottom: 32px;">
          This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 16px;" />
        <p style="font-size: 11px; color: #aaa; text-align: center;">
          &copy; 2026 INFINITV8. All rights reserved.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://infinitv8.com";
  const resetUrl = `${baseUrl}/auth/forgot-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "INFINITV8 — Reset Your Password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 900; color: white;">&infin;</div>
          <h1 style="font-size: 22px; font-weight: 800; color: #111; margin: 12px 0 4px;">INFINITV8</h1>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; color: #111; text-align: center; margin-bottom: 8px;">
          Reset Your Password
        </h2>
        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 28px;">
          Click the button below to set a new password for your account.
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px;">Reset Password</a>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center; margin-bottom: 8px;">
          This link expires in <strong>30 minutes</strong>. If you didn't request this, please ignore this email.
        </p>
        <p style="font-size: 12px; color: #aaa; text-align: center; margin-bottom: 32px; word-break: break-all;">
          ${resetUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 16px;" />
        <p style="font-size: 11px; color: #aaa; text-align: center;">
          &copy; 2026 INFINITV8. All rights reserved.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
