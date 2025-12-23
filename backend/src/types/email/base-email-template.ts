type BaseTemplateProps = {
  title: string;
  body: string;
};

export const baseEmailTemplate = ({ title, body }: BaseTemplateProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="
  margin:0;
  padding:0;
  background-color:#f4f6f8;
  font-family:Arial, Helvetica, sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        
        <table width="600" cellpadding="0" cellspacing="0" style="
          background:#ffffff;
          border-radius:8px;
          overflow:hidden;
        ">
          
          <!-- Header -->
          <tr>
            <td style="
              background:#0f172a;
              color:#ffffff;
              padding:20px;
              text-align:center;
              font-size:20px;
              font-weight:bold;
            ">
              Synchro Desk
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px; color:#111827; font-size:16px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background:#f9fafb;
              padding:20px;
              text-align:center;
              font-size:12px;
              color:#6b7280;
            ">
              © ${new Date().getFullYear()} Synchro Desk. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
