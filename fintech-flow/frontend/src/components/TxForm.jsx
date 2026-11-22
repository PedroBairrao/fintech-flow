import { useState } from "react";

const empty = { description: "", amount: "", type: "saida", category: "Geral", date: new Date().toISOString().slice(0, 10) };

export default function TxForm({ initial, onSave, onCancel, saving }) {
  const [f, setF] = useState(initial || empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="modal" onClick={onCancel}>
      <form className="card" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave({ ...f, amount: Number(f.amount) }); }}>
        <h3>{initial ? "Editar" : "Nova"} transação</h3>
        <input placeholder="Descrição" value={f.description} onChange={set("description")} required minLength={3} />
        <input type="number" step="0.01" min="0.01" placeholder="Valor (R$)" value={f.amount} onChange={set("amount")} required />
        <select value={f.type} onChange={set("type")}><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
        <input placeholder="Categoria" value={f.category} onChange={set("category")} required />
        <input type="date" value={f.date} onChange={set("date")} required />
        <div className="row"><button type="button" className="ghost" onClick={onCancel}>Cancelar</button><button disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button></div>
      </form>
    </div>
  );
}
