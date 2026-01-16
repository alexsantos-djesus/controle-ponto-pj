"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type DayReport = {
  date: string;
  hours: number;
};

type MonthReport = {
  days: DayReport[];
  total: number;
};

export default function ReportsPage() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState<MonthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch(
        `/api/reports/monthly?year=${year}&month=${month}`
      );
      setReport(data);
    } catch (err: any) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [month, year]);

  return (
    <div>
      <h1>Relatório Mensal</h1>

      {/* Seleção de mês */}
      <div style={{ marginBottom: 16 }}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ marginLeft: 8 }}
        />
      </div>

      {/* Estados */}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Tabela */}
      {report && (
        <>
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horas trabalhadas</th>
              </tr>
            </thead>
            <tbody>
              {report.days.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 16 }}>Total do mês: {report.total} horas</h2>
        </>
      )}
    </div>
  );
}
