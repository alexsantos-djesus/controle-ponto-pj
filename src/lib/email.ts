import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  await resend.emails.send({
    from: "Controle de Ponto <no-reply@seudominio.com>",
    to: email,
    subject: "Redefinição de senha",
    html: `
      <p>Você solicitou a redefinição de senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Este link expira em 1 hora.</p>
    `,
  });
}
