import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { startOfDay, endOfDay } from "@/lib/date";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let userId: string;

  try {
    userId = authenticate(req);
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();

  const openLog = await prisma.workLog.findFirst({
    where: {
      userId,
      endTime: null,
    },
  });

  if (openLog) {
    return NextResponse.json(
      { error: "Já existe uma entrada em aberto" },
      { status: 409 }
    );
  }

  await prisma.workLog.create({
    data: {
      userId,
      date: startOfDay(now),
      startTime: now,
    },
  });

  return NextResponse.json({ message: "Entrada registrada" }, { status: 201 });
}
