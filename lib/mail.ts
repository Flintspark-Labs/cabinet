import { Resend } from "resend";

// Transactional mail via Resend (Article VII.1). Without a key, log instead so local dev works.
export async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[mail] to=${to} subject=${subject}\n${text}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: process.env.MAIL_FROM ?? "The Cabinet <onboarding@resend.dev>", to, subject, text });
  if (error) throw new Error(`mail failed: ${error.message}`);
}
