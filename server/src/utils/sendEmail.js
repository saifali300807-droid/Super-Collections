/**
 * Email sender.
 * Agar SMTP configured hai to real email bhejta hai,
 * warna development me link server console par print karta hai.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n════════════ EMAIL (DEV MODE — SMTP not configured) ════════════');
    console.log(`To      : ${to}`);
    console.log(`Subject : ${subject}`);
    console.log(text);
    console.log('════════════════════════════════════════════════════════════════\n');
    return { sent: false };
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });
  return { sent: true };
};

module.exports = sendEmail;
