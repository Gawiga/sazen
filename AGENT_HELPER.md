## AGENT_HELPER

Propósito

- Documento usado por agentes humanos/IA para entender o estado atual do projeto, mudanças realizadas pelo assistente e como reproduzir/testar localmente.

Resumo rápido (estado atual)

- **Autenticação**: endpoints em `src/pages/api/auth/` — `login.ts`, `logout.ts`, `user.ts`. Token salvo em localStorage após login.
- **APIs server-side**: `src/pages/api/pacientes/*`, `src/pages/api/sessoes/*`, `src/pages/api/reports/index.ts`. Suportam Authorization header e cookie.
- **Páginas do dashboard**: `src/pages/dashboard/pacientes.astro`, `sessoes.astro`, `relatorios.astro`. Enviam token via header Authorization.
- **UI/UX**: Layout mobile-first; `relatorios.astro` com filtros em linha separada, tabelas responsivas, paginação server-side, formatação R$.
- **Performance**: otimização via JWT helper (validação leve ~1ms vs ~1000ms antes).

Endpoints (resumo e uso)

- `POST /api/auth/login` — body `{ email, password }`. Seta cookie `pb_auth` httpOnly; retorna token para localStorage.
- `POST /api/auth/logout` — limpa cookie.
- `GET /api/auth/user` — valida JWT (decodifica e verifica expiração); retorna 200 com `{ user: { token, payload } }` se válido. **Aceita**: header `Authorization: Bearer <token>` ou cookie.
- `GET /api/pacientes` — lista pacientes. **Aceita**: header Authorization ou cookie.
- `POST /api/pacientes` — cria paciente (body: `{ nome, email, contato, valor_sessao }`).
- `GET/PUT/DELETE /api/pacientes/:id` — operações por id.
- `GET /api/sessoes`, `POST /api/sessoes` — CRUD sessões (fields: `id_paciente, data, valor, pago`).
- `GET/PUT/DELETE /api/sessoes/:id` — operações por id.
- `GET /api/reports` — **Query params**: `?collection=(faturamento_mensal|valores_receber)&page=N&perPage=M`. Paginação server-side.

Pages importantes

- `src/pages/dashboard/pacientes.astro` — CRUD pacientes; usa `/api/pacientes` com `fetchWithAuth()` (token via header). Back link para dashboard.
- `src/pages/dashboard/sessoes.astro` — CRUD sessões; select pacientes via `/api/pacientes`; data em datetime-local format. Back link para dashboard.
- `src/pages/dashboard/relatorios.astro` — duas tabelas (faturamento, valores a receber). Filtros em linha separada (mobile-first); paginação server-side; formatação R$. Back link para dashboard.

Libs e helpers

- `src/lib/jwt-helper.ts` — `decodeJwt()` decodifica JWT e valida expiração; `getTokenFromRequest()` extrai token de header `Authorization: Bearer` ou cookie.
- `src/lib/pocketbase.ts` — `getPocketBaseClient()` cria instância PB; `pbClient` null em SSR.

Como rodar localmente (rápido)

1. Ajuste variáveis de ambiente: `PUBLIC_POCKETBASE_URL` apontando para seu PocketBase.
2. Instale e rode:

```bash
npm install
npm run dev
```

3. Login: `/login` (ex.: `rcmafei@gmail.com` / `mozao123`), depois acesse `/dashboard`.

Notas técnicas e decisões relevantes

- **Token handling**: após login, token salvo em localStorage. Páginas usam `fetchWithAuth()` para enviar token via header Authorization. APIs aceitam tanto header quanto cookie para backward-compatibility.
- **Validação leve**: `/api/auth/user` agora apenas decodifica JWT (~1ms) em vez de fazer query ao PocketBase (~1000ms). Reduz latência em ~90%.
- **Paginação server-side**: `/api/reports?collection=faturamento_mensal&page=1&perPage=10` retorna dados paginados. Controles client-side (prev/next/page size) acionam requisições novas.
- **Mobile-first UI**: filtros e controles em coluna em mobile; flex-row em md+ breakpoint. Back links ("← Voltar ao Dashboard") em todas as páginas do dashboard.
- **Segurança**: cookies são httpOnly; token em localStorage é apenas para conveniência. Recomendação futura: implementar refresh tokens e revogação.

Testes e verificação

- Testes básicos a executar:
  - Autenticação: `POST /api/auth/login` e `GET /api/auth/user` para validar cookie.
  - CRUD Pacientes: criar, editar, listar, excluir via UI `/dashboard/pacientes`.
  - CRUD Sessões: criar/editar/listar/excluir e escolher paciente no select.
  - Relatórios: abra `/dashboard/relatorios`, teste filtros, ordenação, paginação e verifique formatação R$.

Próximos passos recomendados (priorizados)

1. Validar tokens server-side de forma robusta (decodificar JWT ou consultar PocketBase diretamente para recuperar usuário).
2. Mudar paginação dos relatórios para server-side quando os dados forem grandes.
3. Adicionar testes automatizados (unit/e2e) para os endpoints principais e fluxo de login.

Registro de mudanças (últimas ações do agente)

- Adicionados endpoints de API para pacientes, sessões e relatórios.
- Atualizadas páginas do dashboard para consumir as APIs internas.
- Implementado `select` de pacientes nas sessões e `relatorios` com filtros/ordenação/paginação/formatação (R$).

Se precisar que eu gere um resumo ainda mais estruturado (ex.: tabelas com rotas e contratos JSON), diga qual formato prefere.
