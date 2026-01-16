import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { calculateMonthHours } from "@/lib/time-calculator";
import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from "docx";

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

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Data")] }),
        new TableCell({ children: [new Paragraph("Horas")] }),
      ],
    }),
    ...report.days.map(
      (day) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(day.date)] }),
            new TableCell({
              children: [new Paragraph(day.hours.toString())],
            }),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph(`Relatório Mensal - ${month}/${year}`),
          new Table({ rows: tableRows }),
          new Paragraph(`Total do mês: ${report.total} horas`),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename=relatorio-${year}-${month}.docx`,
    },
  });
}
