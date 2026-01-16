import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "@/lib/date";

export async function GET(req: Request) {
  let userId: string;

  try {
    userId = authenticate(req);
  } catch (err) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const now = new Date();

  const logs = await prisma.workLog.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfDay(now),
        lte: endOfDay(now),
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return NextResponse.json(logs);
}
