export const emailButton = ({
  text,
  url,
}: {
  text: string;
  url: string;
}) => `
<table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td align="center" bgcolor="#2563eb" style="
      border-radius:6px;
    ">
      <a
        href="${url}"
        target="_blank"
        style="
          display:inline-block;
          padding:14px 24px;
          color:#ffffff;
          text-decoration:none;
          font-weight:bold;
          font-size:16px;
        "
      >
        ${text}
      </a>
    </td>
  </tr>
</table>
`;
