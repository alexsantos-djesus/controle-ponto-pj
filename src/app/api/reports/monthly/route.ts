import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { calculateMonthHours } from "@/lib/time-calculator";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  let userId: string;

  try {
    userId = authenticate(req);
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json(
      { error: "Ano e mês são obrigatórios" },
      { status: 400 }
    );
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const workLogs = await prisma.workLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const report = calculateMonthHours(workLogs);

  return NextResponse.json(report);
}
