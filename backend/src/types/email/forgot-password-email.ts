import { baseEmailTemplate } from "./base-email-template";
import { emailButton } from "./email-button";


export const forgotPasswordTemplate = ({
  name,
  resetUrl,
}: {
  name?: string;
  resetUrl: string;
}) =>
  baseEmailTemplate({
    title: "Reset your password",
    body: `
      <p style="font-size:16px;">
        Hi ${name ?? "there"},
      </p>

      <p style="font-size:16px; line-height:1.5;">
        We received a request to reset your password for your
        <strong>Synchro Desk</strong> account.
      </p>

      <p style="font-size:16px; line-height:1.5;">
        Click the button below to reset your password.
        This link will expire in <strong>15 minutes</strong>.
      </p>

      ${emailButton({
        text: "Reset Password",
        url: resetUrl,
      })}

      <p style="font-size:14px; color:#6b7280; margin-top:24px;">
        If you didn’t request a password reset, you can safely ignore this email.
        Your password will not be changed.
      </p>

      <p style="font-size:14px; color:#6b7280;">
        For security reasons, please do not share this link with anyone.
      </p>
    `,
  });
