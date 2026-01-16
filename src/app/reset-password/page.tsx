"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token inválido ou ausente");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao redefinir senha");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow"
      >
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Redefinir senha
        </h1>

        <p className="mb-4 text-sm text-zinc-500">
          Digite sua nova senha abaixo.
        </p>

        <input
          type="password"
          placeholder="Nova senha"
          className="mb-3 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          className="mb-3 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        {success && (
          <p className="mb-3 text-sm text-green-600">
            Senha alterada com sucesso! Redirecionando…
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-zinc-900 dark:bg-zinc-50 px-4 py-2 font-medium text-white dark:text-black disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Redefinir senha"}
        </button>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </div>
  );
}
