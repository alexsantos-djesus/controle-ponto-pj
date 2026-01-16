import { WorkLog } from "@prisma/client";

function diffInHours(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
}

export function calculateDayHours(workLogs: WorkLog[]): number {
  return workLogs
    .filter((log) => log.endTime)
    .reduce((total, log) => {
      return total + diffInHours(log.startTime, log.endTime!);
    }, 0);
}

function groupByDay(workLogs: WorkLog[]): Record<string, WorkLog[]> {
  return workLogs.reduce<Record<string, WorkLog[]>>((acc, log) => {
    const dayKey = log.date.toISOString().split("T")[0];

    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }

    acc[dayKey].push(log);

    return acc;
  }, {});
}

export function calculateMonthHours(workLogs: WorkLog[]) {
  const groupedByDay = groupByDay(workLogs);

  let totalMonthHours = 0;

  const days = Object.entries(groupedByDay).map(([date, logs]) => {
    const dayHours = calculateDayHours(logs);
    totalMonthHours += dayHours;

    return {
      date,
      hours: Number(dayHours.toFixed(2)),
    };
  });

  return {
    days,
    total: Number(totalMonthHours.toFixed(2)),
  };
}
