/**
 * Email sender.
 * Agar SMTP configured hai to real email bhejta hai,
 * warna development me link server console par print karta hai.
 *
 * KABHI THROW/HANG NAHI KARTA — hamesha { sent: true|false, error? } return karta
 * hai. Render production me Gmail SMTP kabhi-kabhi hang/jaldi fail ho sakta hai;
 * ye registration/login flow ko block hone se bachata hai.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n════════════ EMAIL (DEV MODE — SMTP not configured) ════════════');
    console.log(`To      : ${to}`);
    console.log(`Subject : ${subject}`);
    console.log(text);
    console.log('════════════════════════════════════════════════════════════════\n');
    return { sent: false, dev: true };
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Production: SMTP connect/send hang na ho — 10s ke andar fail ho jao
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    timeout: 10000,
  });

  try {
    await transporter.sendMail({
      from: EMAIL_FROM || SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.log(`⚠️  Email delivery failed (to=${to}): ${err.message}`);
    return { sent: false, error: err };
  }
};

module.exports = sendEmail;
