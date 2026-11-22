import jwt from "jsonwebtoken";

export const SECRET = process.env.JWT_SECRET || "dev-secret-troque-em-producao";

export function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token ausente ou inválido" });
  }
}

// RBAC
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: "Permissão insuficiente" });
