import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function transporter(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cached;
}

export interface SendArgs {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const t = transporter();
  if (!t) return { ok: false, error: "SMTP not configured" };
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  try {
    const info = await t.sendMail({
      from,
      to: Array.isArray(args.to) ? args.to.join(",") : args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
      replyTo: args.replyTo,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email] send failed", msg);
    return { ok: false, error: msg };
  }
}
