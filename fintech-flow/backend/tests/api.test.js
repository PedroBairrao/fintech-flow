process.env.DB_FILE = ":memory:";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const { default: app } = await import("../src/app.js");
let server, base, token, userToken, id;

before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
after(() => server.close());

const call = (path, method = "GET", body, tk = token) =>
  fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(tk && { Authorization: `Bearer ${tk}` }) },
    body: body && JSON.stringify(body),
  });

test("login admin", async () => {
  const r = await call("/api/auth/login", "POST", { email: "admin@fintechflow.com", password: "admin123" }, null);
  assert.equal(r.status, 200);
  token = (await r.json()).token;
});

test("rota protegida exige token", async () => {
  assert.equal((await call("/api/transactions", "GET", null, null)).status, 401);
});

test("rejeita valor negativo", async () => {
  const r = await call("/api/transactions", "POST", { description: "Teste", amount: -5, type: "saida", date: "2026-11-17" });
  assert.equal(r.status, 400);
});

test("cria transação e atualiza saldo", async () => {
  const r = await call("/api/transactions", "POST", { description: "Pagamento de Aluguel", amount: 2000, type: "saida", date: "2026-11-17" });
  assert.equal(r.status, 201);
  id = (await r.json()).id;
  const d = await (await call("/api/dashboard")).json();
  assert.equal(d.saldo, -2000);
});

test("bloqueia duplicidade", async () => {
  const r = await call("/api/transactions", "POST", { description: "Pagamento de Aluguel", amount: 2000, type: "saida", date: "2026-11-17" });
  assert.equal(r.status, 409);
});

test("usuário comum não exclui (RBAC)", async () => {
  const reg = await call("/api/auth/register", "POST", { name: "Ana", email: "ana@x.com", password: "123456" }, null);
  userToken = (await reg.json()).token;
  assert.equal((await call(`/api/transactions/${id}`, "DELETE", null, userToken)).status, 403);
});

test("soft delete mantém registro", async () => {
  assert.equal((await call(`/api/transactions/${id}`, "DELETE")).status, 204);
  assert.equal((await call(`/api/transactions/${id}`)).status, 404);
  const d = await (await call("/api/dashboard")).json();
  assert.equal(d.saldo, 0);
});
