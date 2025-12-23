import { baseEmailTemplate } from "./base-email-template";
import { emailButton } from "./email-button";

export const verifyEmailTemplate = (verifyUrl: string) =>
  baseEmailTemplate({
    title: "Verify your email",
    body: `
      <p>Hi</p>

      <p>
        Thanks for signing up to <strong>Synchro Desk</strong>.
        Please verify your email address to continue.
      </p>

      ${emailButton({
        text: "Verify Email",
        url: verifyUrl,
      })}

      <p style="margin-top:24px;">
        If you didn’t create this account, you can safely ignore this email.
      </p>
    `,
  });
