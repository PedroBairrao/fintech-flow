import { useEffect, useState, useMemo } from "react";
import { api, brl } from "../api.js";

function Bars({ rows, a, b, label }) {
  const max = useMemo(() => Math.max(1, ...rows.flatMap((r) => [r[a], b ? r[b] : 0])), [rows, a, b]);
  return rows.map((r) => (
    <div className="bar-row" key={r[label]}>
      <span>{r[label]}</span>
      <div className="bars">
        <i className="in" style={{ width: `${(r[a] / max) * 100}%` }} title={brl(r[a])} />
        {b && <i className="out" style={{ width: `${(r[b] / max) * 100}%` }} title={brl(r[b])} />}
      </div>
      <b>{brl(r[a])}</b>
    </div>
  ));
}

export default function Dashboard({ refresh, notify }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    api("/api/dashboard").then(setD).catch((e) => notify(e.message, "err"));
  }, [refresh, notify]);

  if (!d) return <div className="loader" aria-label="Carregando" />;
  return (
    <>
      <div className="kpis">
        <div className="card"><small>Saldo</small><h2 className={d.saldo < 0 ? "neg" : "pos"}>{brl(d.saldo)}</h2></div>
        <div className="card"><small>Entradas</small><h2 className="pos">{brl(d.entradas)}</h2></div>
        <div className="card"><small>Saídas</small><h2 className="neg">{brl(d.saidas)}</h2></div>
      </div>
      <div className="grid2">
        <div className="card"><h3>Entradas por mês</h3>{d.porMes.length ? <Bars rows={d.porMes} a="entradas" label="mes" /> : <p>Sem dados</p>}</div>
        <div className="card"><h3>Saídas por mês</h3>{d.porMes.length ? <Bars rows={d.porMes.map((m) => ({ ...m, v: m.saidas }))} a="v" label="mes" /> : <p>Sem dados</p>}</div>
        <div className="card"><h3>Gastos por categoria</h3>{d.porCategoria.length ? <Bars rows={d.porCategoria} a="total" label="categoria" /> : <p>Sem dados</p>}</div>
      </div>
    </>
  );
}
