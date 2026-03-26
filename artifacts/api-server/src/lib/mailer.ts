import nodemailer from "nodemailer";

// Lazily create a transporter. If real SMTP credentials are not provided,
// fall back to an ephemeral Ethereal test account so emails are still sent
// during local development/testing.
let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (process.env["SMTP_USER"] && process.env["SMTP_PASS"]) {
        const port = parseInt(process.env["SMTP_PORT"] || "587", 10);
        const secure = process.env["SMTP_SECURE"] === "true" || port === 465;
        return nodemailer.createTransport({
          host: process.env["SMTP_HOST"] || "smtp.ethereal.email",
          port,
          secure,
          auth: {
            user: process.env["SMTP_USER"]!,
            pass: process.env["SMTP_PASS"]!,
          },
        });
      }

      // No credentials configured: create a throwaway Ethereal account.
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    })();
  }

  return transporterPromise;
}

export async function sendRegistrationEmail(email: string, name: string): Promise<void> {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"SkillElevate" <noreply@skillelevate.com>',
    to: email,
    subject: "Welcome to SkillElevate!",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering at SkillElevate. Your account has been created successfully.</p>
      <p>Start exploring our courses and enroll in one today!</p>
      <p>Happy Learning!<br/>SkillElevate Team</p>
    `,
  });

  // Print preview URL when using Ethereal to help with local debugging.
  if (!process.env["SMTP_USER"]) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`Registration email preview: ${preview}`);
  }
}

export async function sendPaymentEmail(
  email: string,
  courseName: string,
  transactionId: string
): Promise<void> {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"SkillElevate" <noreply@skillelevate.com>',
    to: email,
    subject: "Payment Successful - Enrollment Confirmed! (SkillElevate)",
    html: `
      <h1>Payment Successful!</h1>
      <p>Your payment has been received and you are now enrolled in <strong>${courseName}</strong>.</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p>Visit your dashboard to start learning!</p>
      <p>Happy Learning!<br/>SkillElevate Team</p>
    `,
  });

  if (!process.env["SMTP_USER"]) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`Payment email preview: ${preview}`);
  }
}
