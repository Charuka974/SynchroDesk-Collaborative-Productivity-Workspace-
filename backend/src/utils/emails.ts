import nodemailer, { Transporter } from "nodemailer";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be set in .env");
}

export const emailTransporter: Transporter = nodemailer.createTransport({
  host: EMAIL_HOST || "smtp.gmail.com",
  port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
  secure: false, // true for port 465
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Verify SMTP connection on startup
 */
emailTransporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    // console.log("Email transporter is ready");
  }
});

/**
 * Send email helper
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) => {
  return emailTransporter.sendMail({
    from: EMAIL_FROM || `"Synchro Desk" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};
