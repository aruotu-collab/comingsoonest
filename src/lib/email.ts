import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendAlertEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResend();
  const from = process.env.RESEND_FROM || "Coming Soonest <onboarding@resend.dev>";

  if (!resend) {
    console.info("[email:dev-fallback]", {
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    return { ok: true as const, mode: "log" as const };
  }

  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  if (error) {
    console.error("[email:error]", error);
    return { ok: false as const, mode: "resend" as const, error };
  }

  return { ok: true as const, mode: "resend" as const };
}
