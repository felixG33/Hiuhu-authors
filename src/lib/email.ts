export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || "console";
  const from = process.env.EMAIL_FROM || "HIUHU Press <press@hiuhu.org>";

  if (provider === "console") {
    console.log(`\n================== [HIUHU EMAIL DISPATCH] ==================`);
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`------------------------------------------------------------`);
    console.log(text || html.replace(/<[^>]*>?/gm, ""));
    console.log(`============================================================\n`);
    return true;
  }

  // Ready for Resend or Nodemailer SMTP integration
  // When EMAIL_PROVIDER is set to "smtp" or "resend", credentials can be connected here.
  return true;
}

export function getVerificationEmailHtml(name: string, verifyUrl: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #181c2a; background-color: #faf9f6; border: 1px solid #ebe6d8;">
      <h1 style="font-size: 26px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #ddd4bd; padding-bottom: 16px;">HIUHU</h1>
      <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>
      <p style="font-size: 16px; line-height: 1.6;">Welcome to HIUHU. Please verify your email address to activate your reader or author privileges.</p>
      <div style="margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #181c2a; color: #faf9f6; padding: 12px 28px; text-decoration: none; font-size: 14px; letter-spacing: 1px; display: inline-block;">VERIFY EMAIL ADDRESS</a>
      </div>
      <p style="font-size: 13px; color: #6373a0; line-height: 1.5;">If you did not request this account, you may safely ignore this message.</p>
      <p style="font-size: 13px; color: #6373a0; border-top: 1px solid #ebe6d8; padding-top: 16px; margin-top: 32px;">HIUHU Press — A Sanctuary for Discerning Voices</p>
    </div>
  `;
}

export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #181c2a; background-color: #faf9f6; border: 1px solid #ebe6d8;">
      <h1 style="font-size: 26px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; border-bottom: 1px solid #ddd4bd; padding-bottom: 16px;">HIUHU</h1>
      <p style="font-size: 16px; line-height: 1.6;">Hello ${name},</p>
      <p style="font-size: 16px; line-height: 1.6;">We received a request to reset the password for your HIUHU account. Click the link below to set a new password:</p>
      <div style="margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #181c2a; color: #faf9f6; padding: 12px 28px; text-decoration: none; font-size: 14px; letter-spacing: 1px; display: inline-block;">RESET YOUR PASSWORD</a>
      </div>
      <p style="font-size: 13px; color: #6373a0; line-height: 1.5;">This link will expire in 1 hour. If you didn't request a reset, no action is needed.</p>
      <p style="font-size: 13px; color: #6373a0; border-top: 1px solid #ebe6d8; padding-top: 16px; margin-top: 32px;">HIUHU Press</p>
    </div>
  `;
}
