import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  AlignmentType,
  WidthType,
  TextRun,
  ShadingType,
} from "docx";

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

  /* ===============================
     TÍTULO
  =============================== */
  const title = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: `RELATÓRIO DE HORAS – ${monthName.toUpperCase()} / ${year}`,
        bold: true,
        size: 32,
        color: "1F2937",
      }),
    ],
  });

  /* ===============================
     TABELA
  =============================== */
  const rows: TableRow[] = [];

  // Cabeçalho
  rows.push(
    new TableRow({
      children: [
        headerCell("Data"),
        headerCell("Período"),
        headerCell("Horas"),
      ],
    })
  );

  let totalMonthHours = 0;

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

      rows.push(
        new TableRow({
          children: [
            textCell(formattedDate),
            textCell(
              `${start.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${end.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            ),
            textCell(diffHours.toFixed(2).replace(".", ",")),
          ],
        })
      );
    }

    // TOTAL DO DIA
    rows.push(
      new TableRow({
        children: [
          shadedCell("", "D1D5DB"),
          shadedCell("TOTAL DO DIA", "D1D5DB", true),
          shadedCell(
            totalDayHours.toFixed(2).replace(".", ","),
            "D1D5DB",
            true
          ),
        ],
      })
    );
  }

  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows,
  });

  /* ===============================
     TOTAL DO MÊS
  =============================== */
  const total = new Paragraph({
    spacing: { before: 400 },
    children: [
      new TextRun({
        text: `Total de horas em ${monthName} de ${year}: ${totalMonthHours
          .toFixed(2)
          .replace(".", ",")} horas`,
        bold: true,
        color: "1E40AF",
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [title, table, total],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8Array = new Uint8Array(buffer);

  return new NextResponse(uint8Array, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename=Relatorio de ${monthName} de ${year}.docx`,
    },
  });
}

/* ===============================
   HELPERS (LIMPO E SEM ERRO)
=============================== */

function headerCell(text: string) {
  return new TableCell({
    shading: {
      type: ShadingType.CLEAR,
      fill: "E5E7EB",
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true })],
      }),
    ],
  });
}

function textCell(text: string) {
  return new TableCell({
    children: [new Paragraph(text)],
  });
}

function shadedCell(text: string, color: string, bold = false) {
  return new TableCell({
    shading: {
      type: ShadingType.CLEAR,
      fill: color,
    },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold })],
      }),
    ],
  });
}
