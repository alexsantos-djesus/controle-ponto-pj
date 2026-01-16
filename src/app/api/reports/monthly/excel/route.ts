import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
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

  const monthName = MONTHS[month - 1];

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const workLogs = await prisma.workLog.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  /* ===============================
     AGRUPAR POR DIA
  =============================== */
  const logsByDay: Record<string, typeof workLogs> = {};

  for (const log of workLogs) {
    const dateKey = log.date.toISOString().split("T")[0];
    logsByDay[dateKey] ||= [];
    logsByDay[dateKey].push(log);
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Relatório Mensal");

  /* ===============================
     TÍTULO
  =============================== */
  sheet.mergeCells("A1:C1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `Relatório de Horas – ${monthName} / ${year}`;
  titleCell.font = { bold: true, size: 14, color: { argb: "1F2937" } };
  titleCell.alignment = { horizontal: "center" };

  /* ===============================
     CABEÇALHO
  =============================== */
  const headerRow = sheet.getRow(3);
  headerRow.values = ["Data", "Período", "Horas"];
  headerRow.font = { bold: true };

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E5E7EB" },
    };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { horizontal: "center" };
  });

  let currentRow = 4;
  let totalMonthHours = 0;

  /* ===============================
     DADOS
  =============================== */
  for (const dateKey of Object.keys(logsByDay)) {
    const dayLogs = logsByDay[dateKey];
    let totalDayHours = 0;

    const [y, m, d] = dateKey.split("-");
    const formattedDate = `${d}/${m}/${y}`;

    for (const log of dayLogs) {
      if (!log.endTime) continue;

      const start = new Date(log.startTime);
      const end = new Date(log.endTime);

      const diffHours = (end.getTime() - start.getTime()) / 3600000;

      totalDayHours += diffHours;
      totalMonthHours += diffHours;

      const row = sheet.getRow(currentRow);
      row.values = [
        formattedDate,
        `${start.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${end.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        Number(diffHours.toFixed(2)),
      ];

      row.getCell(3).numFmt = "0.00";

      row.eachCell((cell) => {
        cell.border = {
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      currentRow++;
    }

    /* ===== TOTAL DO DIA ===== */
    const totalRow = sheet.getRow(currentRow);
    totalRow.values = ["", "TOTAL DO DIA", Number(totalDayHours.toFixed(2))];
    totalRow.font = { bold: true };
    totalRow.getCell(3).numFmt = "0.00";

    totalRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D1D5DB" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    });

    currentRow += 2; // espaço visual entre dias
  }

  /* ===============================
     TOTAL DO MÊS
  =============================== */
  const monthTotalRow = sheet.getRow(currentRow);
  monthTotalRow.values = [
    "",
    "TOTAL DO MÊS",
    Number(totalMonthHours.toFixed(2)),
  ];
  monthTotalRow.font = { bold: true };
  monthTotalRow.getCell(3).numFmt = "0.00";

  monthTotalRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "DBEAFE" },
    };
    cell.border = {
      top: { style: "double" },
      bottom: { style: "double" },
    };
  });

  /* ===============================
     COLUNAS
  =============================== */
  sheet.columns = [{ width: 16 }, { width: 26 }, { width: 14 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const uint8Array = new Uint8Array(buffer as ArrayBuffer);

  return new NextResponse(uint8Array, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=Relatorio de ${monthName} de ${year}.xlsx`,
    },
  });
}
