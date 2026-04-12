import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return { success: true, mock: true };
  }

  const resend = getResend();
  if (!resend) return { success: true, mock: true };

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Nexial <noreply@nexial.pt>",
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return { success: true, id: data?.id };
}
