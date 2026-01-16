"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Informe seu e-mail");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar e-mail");
      }

      setSuccess(
        "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao solicitar redefinição de senha"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow"
      >
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Esqueci minha senha
        </h1>

        <p className="mb-6 text-sm text-zinc-500">
          Informe seu e-mail para receber as instruções de redefinição.
        </p>

        <input
          type="email"
          placeholder="Seu e-mail"
          className="mb-4 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-zinc-900 dark:text-zinc-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-zinc-900 dark:bg-zinc-50 px-4 py-2 font-medium text-white dark:text-black disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Enviar instruções"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="underline">
            Voltar para o login
          </Link>
        </p>
      </form>
    </div>
  );
}