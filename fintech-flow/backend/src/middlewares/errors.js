import { ZodError } from "zod";

// Valida req[source] com um schema zod e substitui pelo valor tratado
export const validate = (schema, source = "body") => (req, res, next) => {
  const r = schema.safeParse(req[source]);
  if (!r.success) return next(r.error);
  req[source] = r.data;
  next();
};

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: err.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })),
    });
  }
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
}
