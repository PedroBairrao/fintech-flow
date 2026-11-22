import { useEffect, useState, memo } from "react";
import { api, brl } from "../api.js";
import TxForm from "./TxForm.jsx";

const Row = memo(function Row({ t, admin, onEdit, onDelete }) {
  return (
    <tr>
      <td>{t.date.split("-").reverse().join("/")}</td>
      <td>{t.description}</td>
      <td>{t.category}</td>
      <td className={t.type === "entrada" ? "pos" : "neg"}>{t.type === "entrada" ? "+" : "-"}{brl(t.amount)}</td>
      <td className="actions">
        <button className="ghost" onClick={() => onEdit(t)}>Editar</button>
        {admin && <button className="danger" onClick={() => onDelete(t)}>Excluir</button>}
      </td>
    </tr>
  );
});

export default function Transactions({ user, notify, onChange }) {
  const [q, setQ] = useState({ search: "", type: "", page: 1 });
  const [res, setRes] = useState({ data: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null | {} | transação
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: q.page, limit: 8 });
    if (q.search) params.set("search", q.search);
    if (q.type) params.set("type", q.type);
    const h = setTimeout(() => {
      api(`/api/transactions?${params}`).then(setRes).catch((e) => notify(e.message, "err")).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(h);
  }, [q, tick, notify]);

  const reload = () => { setTick((n) => n + 1); onChange(); };

  async function save(body) {
    setSaving(true);
    try {
      await api(form.id ? `/api/transactions/${form.id}` : "/api/transactions", { method: form.id ? "PUT" : "POST", body });
      notify("Transação salva");
      setForm(null);
      reload();
    } catch (e) { notify(e.message, "err"); }
    setSaving(false);
  }

  async function remove() {
    try {
      await api(`/api/transactions/${confirm.id}`, { method: "DELETE" });
      notify("Transação excluída (lógica)");
      reload();
    } catch (e) { notify(e.message, "err"); }
    setConfirm(null);
  }

  return (
    <div className="card">
      <div className="toolbar">
        <input placeholder="Buscar descrição..." value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })} />
        <select value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value, page: 1 })}>
          <option value="">Todos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option>
        </select>
        <button onClick={() => setForm({})}>+ Nova</button>
      </div>
      {loading ? <div className="loader" /> : (
        <div className="scroll">
          <table>
            <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th /></tr></thead>
            <tbody>
              {res.data.map((t) => <Row key={t.id} t={t} admin={user.role === "admin"} onEdit={setForm} onDelete={setConfirm} />)}
              {!res.data.length && <tr><td colSpan="5">Nenhuma transação encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <div className="row pager">
        <button className="ghost" disabled={q.page <= 1} onClick={() => setQ({ ...q, page: q.page - 1 })}>Anterior</button>
        <span>{q.page} / {res.pages}</span>
        <button className="ghost" disabled={q.page >= res.pages} onClick={() => setQ({ ...q, page: q.page + 1 })}>Próxima</button>
      </div>
      {form && <TxForm initial={form.id ? form : null} onSave={save} onCancel={() => setForm(null)} saving={saving} />}
      {confirm && (
        <div className="modal" onClick={() => setConfirm(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir "{confirm.description}"?</h3>
            <p>O registro será apenas marcado como excluído (auditoria).</p>
            <div className="row"><button className="ghost" onClick={() => setConfirm(null)}>Cancelar</button><button className="danger" onClick={remove}>Excluir</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
