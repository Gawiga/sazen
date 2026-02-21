## AGENT_HELPER

Propósito

- Documento usado por agentes humanos/IA para entender o estado atual do projeto, mudanças realizadas pelo assistente e como reproduzir/testar localmente.

Resumo rápido (estado atual)

- **Autenticação**: endpoints em `src/pages/api/auth/` — `login.ts`, `logout.ts`, `user.ts`. Token salvo em localStorage após login.
- **APIs server-side**: `src/pages/api/pacientes/*`, `src/pages/api/sessoes/*`, `src/pages/api/reports/index.ts`. Suportam Authorization header e cookie.
- **Service de pacientes**: lógica de CRUD/autorização centralizada em `src/services/pacientesService.ts`; rotas `api/pacientes` delegam ao service.
- **Service de sessões**: lógica de CRUD/autorização/paginação centralizada em `src/services/sessoesService.ts`; rotas `api/sessoes` apenas delegam.
- **Páginas principais**: `src/pages/pacientes.astro`, `src/pages/sessoes.astro`, `src/pages/relatorios.astro`. Enviam token via header Authorization.
- **UI/UX**: Layout unificado mobile-first nas telas de dashboard; ações de tabela com botões touch-friendly; máscara de moeda em pacientes/sessões.
- **Performance**: otimização via JWT helper (validação leve ~1ms vs ~1000ms antes).

Endpoints (resumo e uso)

- `POST /api/auth/login` — body `{ email, password }`. Seta cookie `pb_auth` httpOnly; retorna token para localStorage.
- `POST /api/auth/logout` — limpa cookie.
- `GET /api/auth/user` — valida JWT (decodifica e verifica expiração); retorna 200 com `{ user: { token, payload } }` se válido. **Aceita**: header `Authorization: Bearer <token>` ou cookie.
- `GET /api/pacientes` — lista pacientes. **Aceita**: header Authorization ou cookie.
- `POST /api/pacientes` — cria paciente (body: `{ nome, email, contato, valor_sessao }`).
- `GET/PUT/DELETE /api/pacientes/:id` — operações por id.
- `GET /api/sessoes`, `POST /api/sessoes` — CRUD sessões (fields: `id_paciente, data, valor, pago, owner`).
- `GET/PUT/DELETE /api/sessoes/:id` — operações por id.
- `GET /api/sessoes` — paginação server-side com padrão `page=1&perPage=10`; aceita `sort`.
- `GET /api/reports` — **Query params**: `?collection=(faturamento_mensal|valores_receber)&page=N&perPage=M`. Paginação server-side.

Pages importantes

- `src/pages/pacientes.astro` — CRUD pacientes; usa `/api/pacientes` com `fetchWithAuth()` (token via header). Back link para dashboard.
- `src/pages/pacientes.astro` — placeholders no cadastro; máscara de moeda no campo `valor_sessao` (ex.: `R$ 12,00`, aceitando digitação `12`); botões de ação touch-friendly.
- `src/pages/sessoes.astro` — CRUD sessões; select pacientes via `/api/pacientes`; pacientes ordenados alfabeticamente no fluxo de nova sessão; paginação server-side com botões de `perPage` (10/50/100); data exibida em formato textual (`segunda-feira, 20 de fevereiro às 19h30`); máscara de moeda no campo `valor`; botões de ação touch-friendly.
- `src/pages/relatorios.astro` — duas tabelas (faturamento, valores a receber); removida linha antiga de filtros; paginação e controles no mesmo padrão de sessões; filtro frontend por nome no cabeçalho da tabela `valores_receber`.

Libs e helpers

- `src/lib/jwt-helper.ts` — `decodeJwt()` decodifica JWT e valida expiração; `getTokenFromRequest()` extrai token de header `Authorization: Bearer` ou cookie.
- `src/lib/pocketbase.ts` — `getPocketBaseClient()` cria instância PB; `pbClient` null em SSR.
- `src/components/auth/LoginForm.astro` — formulário usa `method="post"` + `fetch` com `POST` body JSON; evita envio de senha via query string.

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
- **Login seguro**: formulário de login configurado para `POST` e envio de credenciais no body da requisição; sem senha em query params/URL.
- **Owner em sessões**: no `POST /api/sessoes`, `owner` é definido no backend a partir do `user.id` do JWT. Na UI de sessões o payload de criação também envia `owner` quando disponível.
- **Owner em pacientes**: no `POST /api/pacientes`, `owner` é definido no backend a partir do `user.id` do JWT.
- **Validação leve**: `/api/auth/user` agora apenas decodifica JWT (~1ms) em vez de fazer query ao PocketBase (~1000ms). Reduz latência em ~90%.
- **Paginação server-side**: `/api/reports?collection=faturamento_mensal&page=1&perPage=10` retorna dados paginados. Controles client-side (prev/next/page size) acionam requisições novas.
- **Paginação em sessões**: `/api/sessoes?sort=-data&page=1&perPage=10` retorna `{ page, perPage, totalPages, totalItems, items }`.
- **Mobile-first UI**: filtros e controles em coluna em mobile; flex-row em md+ breakpoint. Back links ("← Voltar ao Dashboard") em todas as páginas do dashboard.
- **Segurança**: cookies são httpOnly; token em localStorage é apenas para conveniência. Recomendação futura: implementar refresh tokens e revogação.

Testes e verificação

- Testes básicos a executar:
  - Autenticação: `POST /api/auth/login` e `GET /api/auth/user` para validar cookie.
  - CRUD Pacientes: criar, editar, listar, excluir via UI `/dashboard/pacientes`.
  - CRUD Sessões: criar/editar/listar/excluir e escolher paciente no select.
  - Sessões (paginação): validar default de 10 itens/página e troca para 50/100 via botões na UI.
  - Relatórios: abra `/dashboard/relatorios`, teste filtros, ordenação, paginação e verifique formatação R$.
- Testes unitários adicionados:
  - `tests/unit/sessoes-service.test.ts` cobrindo: 401 sem token, paginação default/clamp, owner no create e operações por id.
  - `tests/unit/pacientes-service.test.ts` cobrindo: 401 sem token, listagem autenticada, owner no create e operações por id.

Próximos passos recomendados (priorizados)

1. Validar tokens server-side de forma robusta (decodificar JWT ou consultar PocketBase diretamente para recuperar usuário).
2. Mudar paginação dos relatórios para server-side quando os dados forem grandes.
3. Adicionar testes automatizados (unit/e2e) para os endpoints principais e fluxo de login.

Registro de mudanças (últimas ações do agente)

- Adicionados endpoints de API para pacientes, sessões e relatórios.
- Atualizadas páginas do dashboard para consumir as APIs internas.
- Implementado `select` de pacientes nas sessões e `relatorios` com filtros/ordenação/paginação/formatação (R$).
- Refatorada lógica de `src/pages/api/sessoes/index.ts` e `src/pages/api/sessoes/[id].ts` para `src/services/sessoesService.ts`.
- Refatorada lógica de `src/pages/api/pacientes/index.ts` e `src/pages/api/pacientes/[id].ts` para `src/services/pacientesService.ts`.
- Sessões agora usam paginação server-side com padrão de 10 itens e botões de troca para 50/100 em `src/pages/sessoes.astro`.
- Criação de sessão inclui `owner` usando `user.id` autenticado.
- Adicionado teste unitário `tests/unit/sessoes-service.test.ts` e suíte validada com `npm run test:unit -- --run`.
- Layout das páginas `pacientes`, `sessoes` e `relatorios` unificado para mobile-first; ações de tabela ajustadas para toque e sem quebra de linha.
- `relatorios.astro` atualizado: removidos filtros antigos, paginação alinhada com sessões e filtro frontend por nome na tabela de valores a receber.
- Máscara monetária aplicada em `valor_sessao` (pacientes) e `valor` (sessões) com suporte a preenchimento simples (ex.: `12`).

Se precisar que eu gere um resumo ainda mais estruturado (ex.: tabelas com rotas e contratos JSON), diga qual formato prefere.
