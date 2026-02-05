export const EmailFooters = {
  welcome: `<p class="footer-text"><strong>Welcome to CredPal</strong><br>Start your financial journey...</p>`,
  verification: `<p class="footer-text"><strong>Verify Your Account</strong><br>Email verification is the first step...</p>`,
  reset: `<p class="footer-text"><strong>Secure Your CredPal Account</strong><br>Your password is the key...</p>`,
  default: `<p class="footer-text"><strong>CredPal: Intelligent Business Credit Made Simple</strong><br>Grow, access, and thrive.</p>`,
};

export function getEmailFooter(
  type: keyof typeof EmailFooters = 'default',
): string {
  return EmailFooters[type] || EmailFooters.default;
}

export function defaultTemplate(
  content: string,
  action: string,
  user: string,
  title: string,
  link: string,
  isAction: boolean,
  footerType: keyof typeof EmailFooters = 'default',
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title} | CredPal</title>
</head>
<body>
<div>
<h2>Hi ${user},</h2>
<div>${content}</div>

${
  isAction
    ? `<a href="${link}">${action}</a>
<p>If button doesn't work: ${link}</p>`
    : ''
}

<footer>
${getEmailFooter(footerType)}
<p>&copy; ${new Date().getFullYear()} CredPal</p>
</footer>
</div>
</body>
</html>`;
}
