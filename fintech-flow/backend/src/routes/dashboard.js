import { Router } from "express";
import db from "../db.js";
import { auth } from "../middlewares/auth.js";

const router = Router();
router.use(auth);

// Saldo, totais e agregações para gráficos
router.get("/", (req, res) => {
  const sum = (t) =>
    db.prepare("SELECT COALESCE(SUM(amount),0) s FROM transactions WHERE deleted=0 AND type=?").get(t).s;
  const entradas = sum("entrada");
  const saidas = sum("saida");
  const porMes = db
    .prepare(
      `SELECT substr(date,1,7) mes,
        SUM(CASE WHEN type='entrada' THEN amount ELSE 0 END) entradas,
        SUM(CASE WHEN type='saida' THEN amount ELSE 0 END) saidas
       FROM transactions WHERE deleted=0 GROUP BY mes ORDER BY mes`
    )
    .all();
  const porCategoria = db
    .prepare(
      `SELECT category categoria, SUM(amount) total FROM transactions
       WHERE deleted=0 AND type='saida' GROUP BY category ORDER BY total DESC`
    )
    .all();
  res.json({ saldo: +(entradas - saidas).toFixed(2), entradas, saidas, porMes, porCategoria });
});

export default router;
