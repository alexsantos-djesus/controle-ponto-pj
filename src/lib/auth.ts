import jwt from "jsonwebtoken";

type TokenPayload = {
  sub: string;
};

export function authenticate(req: Request): string {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Token não informado");
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    throw new Error("Token malformado");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

  return decoded.sub;
}
