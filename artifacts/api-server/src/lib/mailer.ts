import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env["SMTP_HOST"] || "smtp.ethereal.email",
  port: parseInt(process.env["SMTP_PORT"] || "587"),
  secure: false,
  auth: {
    user: process.env["SMTP_USER"] || "",
    pass: process.env["SMTP_PASS"] || "",
  },
});

export async function sendRegistrationEmail(email: string, name: string): Promise<void> {
  if (!process.env["SMTP_USER"]) return;
  await transporter.sendMail({
    from: '"EduLearn" <noreply@edulearn.com>',
    to: email,
    subject: "Welcome to EduLearn!",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering at EduLearn. Your account has been created successfully.</p>
      <p>Start exploring our courses and enroll in one today!</p>
      <p>Happy Learning!<br/>EduLearn Team</p>
    `,
  });
}

export async function sendPaymentEmail(
  email: string,
  courseName: string,
  transactionId: string
): Promise<void> {
  if (!process.env["SMTP_USER"]) return;
  await transporter.sendMail({
    from: '"EduLearn" <noreply@edulearn.com>',
    to: email,
    subject: "Payment Successful - Enrollment Confirmed!",
    html: `
      <h1>Payment Successful!</h1>
      <p>Your payment has been received and you are now enrolled in <strong>${courseName}</strong>.</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p>Visit your dashboard to start learning!</p>
      <p>Happy Learning!<br/>EduLearn Team</p>
    `,
  });
}
