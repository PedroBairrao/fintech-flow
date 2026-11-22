const BASE = import.meta.env.VITE_API_URL || "http://localhost:3333";

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) { localStorage.clear(); location.reload(); }
    const det = data.details?.map((d) => d.mensagem).join("; ");
    throw new Error(det || data.error || "Erro na requisição");
  }
  return data;
}

export const brl = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
