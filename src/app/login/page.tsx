"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveToken } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao fazer login");
      return;
    }

    saveToken(data.token);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow"
      >
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Login
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-zinc-900 dark:text-zinc-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Senha com olhinho */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 pr-10 text-zinc-900 dark:text-zinc-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 flex items-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              /* Olho fechado */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.956 9.956 0 012.293-6.364M6.227 6.227A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-4.134 8.09M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3l18 18"
                />
              </svg>
            ) : (
              /* Olho aberto */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Esqueci a senha */}
        <div className="mb-4 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-zinc-900 dark:bg-zinc-50 px-4 py-2 font-medium text-white dark:text-black"
        >
          Entrar
        </button>

        {/* Cadastro */}
        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 dark:text-zinc-50 underline"
          >
            Criar cadastro
          </Link>
        </p>
      </form>
    </div>
  );
}