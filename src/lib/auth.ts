import jwt from "jsonwebtoken";

export function authenticate(req: Request): string {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Token ausente");
  }

  const [, token] = authHeader.split(" ");

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    sub: string;
  };

  return decoded.sub;
}
