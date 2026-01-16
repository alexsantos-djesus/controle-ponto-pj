"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { downloadFile } from "@/lib/download";
import { formatHoursToHM } from "@/lib/time-calculator";

type DayReport = {
  date: string;
  hours: number;
};

type MonthReport = {
  days: DayReport[];
  total: number;
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function ReportsPage() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [day, setDay] = useState<number | "">("");
  const [report, setReport] = useState<MonthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthName = MONTHS[month - 1];

  async function loadReport() {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<MonthReport>(
        `/api/reports/monthly?year=${year}&month=${month}`
      );
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar relatório"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  /* ===============================
     FILTRO POR DIA
  =============================== */
  const filteredDays = useMemo<DayReport[]>(() => {
    if (!report) return [];
    if (!day) return report.days;

    return report.days.filter((d) => {
      const [, , dDay] = d.date.split("-");
      return Number(dDay) === day;
    });
  }, [report, day]);

  /* ===============================
     TOTAL CORRETO (MÊS OU DIA)
  =============================== */
  const totalFilteredHours = useMemo(() => {
    return filteredDays.reduce((sum, d) => sum + d.hours, 0);
  }, [filteredDays]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Relatórios
            </h1>
            <p className="text-sm text-zinc-500">
              Relatório de {monthName} de {year}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Filtros */}
        <section className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-end justify-center gap-4">
            {/* Mês */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">Mês</span>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setDay("");
                }}
                className="w-40 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Ano */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">Ano</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-28 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              />
            </div>

            {/* Dia */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">Dia</span>
              <select
                value={day}
                onChange={(e) =>
                  setDay(e.target.value ? Number(e.target.value) : "")
                }
                className="w-24 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {Array.from({ length: 31 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exportação */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() =>
                downloadFile(
                  `/api/reports/monthly/excel?year=${year}&month=${month}`,
                  `Relatório de ${monthName} de ${year}.xlsx`
                )
              }
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              📊 Excel
            </button>

            <button
              onClick={() =>
                downloadFile(
                  `/api/reports/monthly/word?year=${year}&month=${month}`,
                  `Relatório de ${monthName} de ${year}.docx`
                )
              }
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              📝 Word
            </button>
          </div>
        </section>

        {/* Total */}
        {report && (
          <section className="flex justify-center">
            <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 text-center">
              <p className="text-sm text-zinc-500">
                {day
                  ? `Total de horas no dia ${String(day).padStart(
                      2,
                      "0"
                    )}/${month}/${year}`
                  : `Total de horas em ${monthName} de ${year}`}
              </p>

              <p className="mt-3 text-6xl font-bold text-zinc-900 dark:text-zinc-50">
                {(day ? totalFilteredHours : report.total).toFixed(2)}h
              </p>

              {day && (
                <p className="mt-2 text-xs text-zinc-500">
                  Valor referente apenas ao dia selecionado
                </p>
              )}
            </div>
          </section>
        )}

        {/* Tabela */}
        {report && (
          <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left">Data</th>
                  <th className="px-6 py-4 text-left">Horas trabalhadas</th>
                </tr>
              </thead>
              <tbody>
                {filteredDays.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-10 text-center text-zinc-500"
                    >
                      Nenhum registro para o filtro selecionado
                    </td>
                  </tr>
                )}

                {filteredDays.map((d) => {
                  const [y, m, dayStr] = d.date.split("-");
                  return (
                    <tr
                      key={d.date}
                      className="border-t border-zinc-200 dark:border-zinc-800 odd:bg-zinc-50 dark:odd:bg-zinc-800/40"
                    >
                      <td className="px-6 py-4">{`${dayStr}/${m}/${y}`}</td>
                      <td className="px-6 py-4 font-medium">
                        {formatHoursToHM(d.hours)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
