import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import db from "../db.js";
import { SECRET } from "../middlewares/auth.js";
import { validate } from "../middlewares/errors.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const sign = (u) =>
  jwt.sign({ id: u.id, name: u.name, role: u.role }, SECRET, { expiresIn: "8h" });

router.post("/register", validate(registerSchema), (req, res) => {
  const { name, email, password } = req.body;
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email))
    return res.status(409).json({ error: "E-mail já cadastrado" });
  const info = db
    .prepare("INSERT INTO users (name,email,password_hash) VALUES (?,?,?)")
    .run(name, email, bcrypt.hashSync(password, 10));
  const user = { id: info.lastInsertRowid, name, role: "user" };
  res.status(201).json({ token: sign(user), user });
});

router.post("/login", validate(loginSchema), (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE email = ?").get(req.body.email);
  if (!u || !bcrypt.compareSync(req.body.password, u.password_hash))
    return res.status(401).json({ error: "Credenciais inválidas" });
  res.json({ token: sign(u), user: { id: u.id, name: u.name, role: u.role } });
});

export default router;
