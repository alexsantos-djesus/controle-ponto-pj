import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { calculateMonthHours } from "@/lib/time-calculator";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

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
      date: { gte: startDate, lte: endDate },
    },
  });

  const report = calculateMonthHours(workLogs);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Relatório Mensal");

  sheet.addRow(["Data", "Horas Trabalhadas"]);

  report.days.forEach((day) => {
    sheet.addRow([day.date, day.hours]);
  });

  sheet.addRow([]);
  sheet.addRow(["Total do mês", report.total]);

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=relatorio-${year}-${month}.xlsx`,
    },
  });
}
