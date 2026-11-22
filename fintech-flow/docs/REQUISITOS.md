# Requisitos (Etapa 1 – Arquiteto)

## Funcionais
- RF01 Autenticar usuários (JWT) · RF02 Cadastrar, listar, editar transações
- RF03 Excluir logicamente (admin) · RF04 Exibir saldo/entradas/saídas em tempo real
- RF05 Filtrar, buscar e paginar · RF06 Gráficos por mês e categoria

## Não funcionais
- RNF01 Rastreabilidade (quem/quando criou, alterou, excluiu) · RNF02 Sem exclusão física
- RNF03 Validação de esquemas (Zod) · RNF04 Senhas com bcrypt, tokens expiram em 8h
- RNF05 Responsivo (web/mobile) · RNF06 Índices no banco · RNF07 Docs Swagger

## RBAC (Etapa 5)
| Ação | user | admin |
|---|---|---|
| Listar/criar/editar transações, dashboard | ✔ | ✔ |
| Excluir (soft delete) | ✘ | ✔ |

## Estratégia de testes (Etapa 9)
- Unitários/integração da API: `npm test` em `backend` (auth, validação, duplicidade, RBAC, soft delete, saldo)
- E2E (sugestão): Playwright cobrindo login → criar transação → saldo atualizado
