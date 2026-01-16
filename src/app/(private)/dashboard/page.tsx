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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTodayLogs() {
    try {
      const now = new Date();
      const data = await apiFetch(
        `/api/reports/monthly?year=${now.getFullYear()}&month=${
          now.getMonth() + 1
        }`
      );

      const today = now.toISOString().split("T")[0];
      const todayLogs = data.days?.find((d: any) => d.date === today);

      // logs detalhados não vêm no relatório,
      // então mantemos apenas estado simples aqui
      setLogs(todayLogs?.logs || []);
    } catch {
      // silêncio aqui, não é crítico
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
      await apiFetch("/api/worklog/start", { method: "POST" });
      setMessage("Entrada registrada com sucesso");
      await loadTodayLogs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiFetch("/api/worklog/end", { method: "POST" });
      setMessage("Saída registrada com sucesso");
      await loadTodayLogs();
    } catch (err: any) {
      setError(err.message);
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
