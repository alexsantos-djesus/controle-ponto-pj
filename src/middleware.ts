import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  // Se não tiver token, bloqueia
  if (!authHeader) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [, token] = authHeader.split(" ");

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/worklog/:path*"],
};
