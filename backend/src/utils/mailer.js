import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    console.warn('MAIL_HOST/MAIL_USER/MAIL_PASS not set. Invitation emails will be logged only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
}

export async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log('[MAIL:FALLBACK]', { to, subject, html });
    return;
  }

  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  await t.sendMail({ from, to, subject, html });
}
