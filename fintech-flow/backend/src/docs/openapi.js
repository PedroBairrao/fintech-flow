const bearer = [{ bearerAuth: [] }];
const tx = {
  type: "object",
  properties: {
    description: { type: "string", example: "Pagamento de Aluguel" },
    amount: { type: "number", example: 2000 },
    type: { type: "string", enum: ["entrada", "saida"] },
    category: { type: "string", example: "Despesas fixas" },
    date: { type: "string", example: "2026-11-17" },
  },
  required: ["description", "amount", "type", "date"],
};
const json = (schema) => ({ content: { "application/json": { schema } } });

export default {
  openapi: "3.0.0",
  info: { title: "FinTech Flow API", version: "1.0.0" },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } } },
  paths: {
    "/api/auth/register": { post: { tags: ["Auth"], summary: "Cadastrar usuário", requestBody: json({ type: "object", properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" } } }), responses: { 201: { description: "Criado" } } } },
    "/api/auth/login": { post: { tags: ["Auth"], summary: "Login (retorna JWT)", requestBody: json({ type: "object", properties: { email: { type: "string" }, password: { type: "string" } } }), responses: { 200: { description: "OK" }, 401: { description: "Inválido" } } } },
    "/api/transactions": {
      get: { tags: ["Transações"], security: bearer, summary: "Listar com filtros e paginação", parameters: ["search", "type", "category", "page", "limit"].map((n) => ({ name: n, in: "query", schema: { type: "string" } })), responses: { 200: { description: "OK" } } },
      post: { tags: ["Transações"], security: bearer, summary: "Criar", requestBody: json(tx), responses: { 201: { description: "Criado" }, 400: { description: "Validação" }, 409: { description: "Duplicado" } } },
    },
    "/api/transactions/{id}": {
      get: { tags: ["Transações"], security: bearer, summary: "Buscar por id", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "OK" } } },
      put: { tags: ["Transações"], security: bearer, summary: "Editar", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: json(tx), responses: { 200: { description: "OK" } } },
      delete: { tags: ["Transações"], security: bearer, summary: "Soft delete (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 204: { description: "Excluído logicamente" }, 403: { description: "Sem permissão" } } },
    },
    "/api/dashboard": { get: { tags: ["Dashboard"], security: bearer, summary: "Saldo e agregações", responses: { 200: { description: "OK" } } } },
  },
};
