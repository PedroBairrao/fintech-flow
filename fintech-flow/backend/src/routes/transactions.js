import { Router } from "express";
import { z } from "zod";
import db from "../db.js";
import { auth, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/errors.js";

const router = Router();
router.use(auth);

const txSchema = z.object({
  description: z.string().trim().min(3, "Mínimo 3 caracteres"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero").multipleOf(0.01),
  type: z.enum(["entrada", "saida"]),
  category: z.string().trim().min(1).default("Geral"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD"),
});

const querySchema = z.object({
  search: z.string().optional(),
  type: z.enum(["entrada", "saida"]).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Listar (filtros, busca e paginação)
router.get("/", validate(querySchema, "query"), (req, res) => {
  const { search, type, category, page, limit } = req.query;
  const where = ["deleted = 0"];
  const params = [];
  if (search) { where.push("description LIKE ?"); params.push(`%${search}%`); }
  if (type) { where.push("type = ?"); params.push(type); }
  if (category) { where.push("category = ?"); params.push(category); }
  const w = where.join(" AND ");
  const total = db.prepare(`SELECT COUNT(*) c FROM transactions WHERE ${w}`).get(...params).c;
  const data = db
    .prepare(`SELECT * FROM transactions WHERE ${w} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, (page - 1) * limit);
  res.json({ data, total, page, pages: Math.ceil(total / limit) || 1 });
});

router.get("/:id", (req, res) => {
  const t = db.prepare("SELECT * FROM transactions WHERE id = ? AND deleted = 0").get(req.params.id);
  t ? res.json(t) : res.status(404).json({ error: "Transação não encontrada" });
});

// Criar
router.post("/", validate(txSchema), (req, res) => {
  const { description, amount, type, category, date } = req.body;
  // Evita duplicidade de lançamento (mesmos dados no mesmo dia)
  const dup = db
    .prepare(
      "SELECT 1 FROM transactions WHERE deleted=0 AND description=? AND amount=? AND type=? AND date=?"
    )
    .get(description, amount, type, date);
  if (dup) return res.status(409).json({ error: "Lançamento duplicado" });
  const info = db
    .prepare(
      "INSERT INTO transactions (description,amount,type,category,date,created_by) VALUES (?,?,?,?,?,?)"
    )
    .run(description, amount, type, category, date, req.user.id);
  res.status(201).json(db.prepare("SELECT * FROM transactions WHERE id = ?").get(info.lastInsertRowid));
});

// Editar
router.put("/:id", validate(txSchema), (req, res) => {
  const { description, amount, type, category, date } = req.body;
  const info = db
    .prepare(
      `UPDATE transactions SET description=?,amount=?,type=?,category=?,date=?,
       updated_by=?, updated_at=datetime('now') WHERE id=? AND deleted=0`
    )
    .run(description, amount, type, category, date, req.user.id, req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Transação não encontrada" });
  res.json(db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id));
});

// Soft delete (somente admin) – nunca remove fisicamente
router.delete("/:id", requireRole("admin"), (req, res) => {
  const info = db
    .prepare(
      "UPDATE transactions SET deleted=1, deleted_by=?, deleted_at=datetime('now') WHERE id=? AND deleted=0"
    )
    .run(req.user.id, req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Transação não encontrada" });
  res.status(204).end();
});

export default router;
