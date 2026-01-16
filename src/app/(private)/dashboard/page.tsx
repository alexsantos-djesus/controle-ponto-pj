"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type WorkLog = {
  id: string;
  startTime: string;
  endTime: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState<Date>(new Date());

  /* ===============================
     CARREGAR REGISTROS DE HOJE
  =============================== */
  async function loadTodayLogs() {
    try {
      const data = await apiFetch<WorkLog[]>("/api/worklog/today");
      setLogs(data);
    } catch {
      setError("Sessão expirada. Faça login novamente.");
    }
  }

  useEffect(() => {
    loadTodayLogs();
  }, []);

  /* ===============================
     RELÓGIO (BRASÍLIA)
  =============================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const brasiliaTime = useMemo(() => {
    return now.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [now]);

  /* ===============================
     STATUS ATUAL
  =============================== */
  const openLog = logs.find((log) => !log.endTime);
  const hasOpenLog = !!openLog;

  /* ===============================
     TEMPO DA SESSÃO ATUAL
  =============================== */
  const elapsedTime = useMemo(() => {
    if (!openLog) return null;

    const start = new Date(openLog.startTime).getTime();
    const diff = now.getTime() - start;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }, [openLog, now]);

  /* ===============================
     TOTAL TRABALHADO HOJE
  =============================== */
  const totalWorkedToday = useMemo(() => {
    let totalMs = 0;

    logs.forEach((log) => {
      const start = new Date(log.startTime).getTime();
      const end = log.endTime ? new Date(log.endTime).getTime() : now.getTime();

      totalMs += Math.max(end - start, 0);
    });

    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  }, [logs, now]);

  /* ===============================
     AÇÕES
  =============================== */
  async function handleStart() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiFetch<void>("/api/worklog/start", { method: "POST" });
      setMessage("Entrada registrada com sucesso");
      await loadTodayLogs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiFetch<void>("/api/worklog/end", { method: "POST" });
      setMessage("Saída registrada com sucesso");
      await loadTodayLogs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function formatDuration(start: string, end?: string | null) {
    const startMs = new Date(start).getTime();
    const endMs = end ? new Date(end).getTime() : Date.now();

    const diff = Math.max(endMs - startMs, 0);

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Controle de Ponto
          </h1>

          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Relatórios
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* BLOCO CENTRAL */}
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="text-sm text-zinc-500">Horário atual (Brasília)</p>

          <p className="mt-1 text-4xl font-mono text-zinc-900 dark:text-zinc-50">
            {brasiliaTime}
          </p>

          <p
            className={`mt-4 text-lg font-semibold ${
              hasOpenLog ? "text-green-600" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {hasOpenLog ? "Trabalhando agora" : "Fora do expediente"}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Total hoje:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {totalWorkedToday}
            </span>
          </p>

          {elapsedTime && (
            <p className="mt-3 text-2xl font-mono text-zinc-900 dark:text-zinc-50">
              Sessão atual: {elapsedTime}
            </p>
          )}
        </div>

        {/* Feedback */}
        {message && (
          <p className="mb-4 text-center text-sm text-green-600">{message}</p>
        )}
        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}

        {/* BOTÃO PRINCIPAL */}
        <div className="flex justify-center">
          <button
            onClick={hasOpenLog ? handleEnd : handleStart}
            disabled={loading}
            className={`mb-14 w-full max-w-md rounded-2xl px-8 py-4 text-lg font-semibold transition
              ${
                hasOpenLog
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black hover:opacity-90"
              }
              disabled:opacity-50`}
          >
            {hasOpenLog ? "Registrar Saída" : "Registrar Entrada"}
          </button>
        </div>

        {/* REGISTROS */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Registros de hoje
          </h2>

          {logs.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhum registro hoje</p>
          )}

          <ul className="space-y-3">
            {logs.map((log) => {
              const isOpen = !log.endTime;

              return (
                <li
                  key={log.id}
                  className={`flex items-center justify-between rounded-xl border px-6 py-4 transition
            ${
              isOpen
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            }
          `}
                >
                  {/* Horários */}
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span>
                      {new Date(log.startTime).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <span className="text-zinc-400">→</span>

                    <span>
                      {log.endTime
                        ? new Date(log.endTime).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Em andamento"}
                    </span>
                  </div>

                  {/* Duração */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500">
                      {formatDuration(log.startTime, log.endTime)}
                    </span>

                    {isOpen && (
                      <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        ATIVO
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
