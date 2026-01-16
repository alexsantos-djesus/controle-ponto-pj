import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 🔒 Resposta genérica (segurança)
    if (!user) {
      return NextResponse.json({
        message:
          "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.",
      });
    }

    // 🔑 Token seguro
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // 🔥 Remove tokens antigos
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 💾 Cria novo token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // 📧 ENVIO REAL
    await sendResetPasswordEmail(user.email, resetLink);

    return NextResponse.json({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}