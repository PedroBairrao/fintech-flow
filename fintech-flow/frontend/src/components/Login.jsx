import { useState } from "react";
import { api } from "../api.js";

export default function Login({ onLogin, notify }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api(`/api/auth/${mode}`, { method: "POST", body: f });
      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));
      onLogin(r.user);
    } catch (err) { notify(err.message, "err"); }
    setLoading(false);
  }

  return (
    <form className="card login" onSubmit={submit}>
      <img src="/logo.svg" alt="FinTech Flow" width="56" />
      <h1>FinTech Flow</h1>
      {mode === "register" && <input placeholder="Nome" value={f.name} onChange={set("name")} required />}
      <input type="email" placeholder="E-mail" value={f.email} onChange={set("email")} required />
      <input type="password" placeholder="Senha" value={f.password} onChange={set("password")} required />
      <button disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}</button>
      <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "register" : "login"); }}>
        {mode === "login" ? "Criar conta" : "Já tenho conta"}
      </a>
      <small>Demo: admin@fintechflow.com / admin123</small>
    </form>
  );
}
