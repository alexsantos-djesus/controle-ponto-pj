import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let userId: string;

  try {
    userId = authenticate(req);
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const openLog = await prisma.workLog.findFirst({
    where: {
      userId,
      endTime: null,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  if (!openLog) {
    return NextResponse.json(
      { error: "Nenhuma entrada em aberto para encerrar" },
      { status: 409 }
    );
  }

  await prisma.workLog.update({
    where: { id: openLog.id },
    data: {
      endTime: new Date(),
    },
  });

  return NextResponse.json({ message: "Saída registrada" });
}
