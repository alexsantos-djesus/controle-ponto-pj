"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveToken } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-zinc-900 dark:text-zinc-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="mb-4 w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-zinc-900 dark:text-zinc-50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-zinc-900 dark:bg-zinc-50 px-4 py-2 font-medium text-white dark:text-black"
        >
          Entrar
        </button>

        {/* Link para cadastro */}
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
