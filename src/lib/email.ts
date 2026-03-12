import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

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

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "RestaurantCRM <noreply@restaurantcrm.com>",
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return { success: true, id: data?.id };
}
