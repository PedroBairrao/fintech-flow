import { useState, useCallback } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Transactions from "./components/Transactions.jsx";
import Toasts from "./components/Toasts.jsx";

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [tab, setTab] = useState("dashboard");
  const [refresh, setRefresh] = useState(0);
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((msg, kind = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const logout = () => { localStorage.clear(); setUser(null); };

  return (
    <>
      <Toasts items={toasts} />
      {!user ? (
        <Login onLogin={setUser} notify={notify} />
      ) : (
        <div className="app">
          <header>
            <div className="brand"><img src="/logo.svg" alt="" width="32" /> FinTech Flow</div>
            <nav>
              <button className={tab === "dashboard" ? "on" : ""} onClick={() => setTab("dashboard")}>Dashboard</button>
              <button className={tab === "tx" ? "on" : ""} onClick={() => setTab("tx")}>Transações</button>
            </nav>
            <div className="who">{user.name} ({user.role}) <button className="ghost" onClick={logout}>Sair</button></div>
          </header>
          <main>
            {tab === "dashboard"
              ? <Dashboard refresh={refresh} notify={notify} />
              : <Transactions user={user} notify={notify} onChange={() => setRefresh((n) => n + 1)} />}
          </main>
        </div>
      )}
    </>
  );
}
