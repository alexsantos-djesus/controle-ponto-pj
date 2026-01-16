import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  await transporter.sendMail({
    from: `"Controle de Ponto" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinição de senha",
    html: `
      <h2>Redefinição de senha</h2>
      <p>Você solicitou a redefinição da sua senha.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <p>
        <a href="${resetLink}"
           style="
             display:inline-block;
             padding:12px 20px;
             background:#16a34a;
             color:#ffffff;
             text-decoration:none;
             border-radius:6px;
             font-weight:600;
           ">
          Redefinir senha
        </a>
      </p>
      <p>Este link expira em <strong>1 hora</strong>.</p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
  });
}
