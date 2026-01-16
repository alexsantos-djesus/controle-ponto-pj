import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
