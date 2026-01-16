"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type WorkLog = {
  id: string;
  startTime: string;
  endTime: string | null;
};

export default function DashboardPage() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function loadTodayLogs() {
    try {
      const data = await apiFetch<WorkLog[]>("/api/worklog/today");
      setLogs(data);
    } catch {
      // dashboard pode falhar silenciosamente
    }
  }

  useEffect(() => {
    loadTodayLogs();
  }, []);

  const hasOpenLog = logs.some((log) => !log.endTime);

  async function handleStart() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiFetch<void>("/api/worklog/start", { method: "POST" });
      setMessage("Entrada registrada com sucesso");
      await loadTodayLogs();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro inesperado");
      }
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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro inesperado");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Registro de Ponto</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={hasOpenLog ? handleEnd : handleStart} disabled={loading}>
        {hasOpenLog ? "Registrar Saída" : "Registrar Entrada"}
      </button>

      <h2>Registros de hoje</h2>

      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {new Date(log.startTime).toLocaleTimeString()} —{" "}
            {log.endTime
              ? new Date(log.endTime).toLocaleTimeString()
              : "Em andamento"}
          </li>
        ))}
      </ul>
    </div>
  );
}
