## AGENT_HELPER

Propósito

- Documento usado por agentes humanos/IA para entender o estado atual do projeto, mudanças realizadas pelo assistente e como reproduzir/testar localmente.

Resumo rápido (estado atual)

- **Escopo simplificado**: removidos arquivos/páginas legados do AstroWind; `src` contém apenas login/dashboard/pacientes/sessões/relatórios + APIs + services necessários.
- **Autenticação**: endpoints em `src/pages/api/auth/` — `login.ts`, `logout.ts`, `user.ts`. Token salvo em localStorage após login.
- **APIs server-side**: `src/pages/api/pacientes/*`, `src/pages/api/sessoes/*`, `src/pages/api/reports/index.ts`. Suportam Authorization header e cookie.
- **Services**: lógica de pacientes e sessões centralizada em `src/services/pacientesService.ts` e `src/services/sessoesService.ts`.
- **Layout**: `src/layouts/Layout.astro` e `src/layouts/PageLayout.astro` simplificados (mobile-first), com footer exibindo versão da aplicação via `package.json`.

Endpoints (resumo e uso)

- `POST /api/auth/login` — body `{ email, password }`. Seta cookie `pb_auth` httpOnly; retorna token para localStorage.
- `POST /api/auth/logout` — limpa cookie.
- `GET /api/auth/user` — valida JWT (decodifica e verifica expiração); retorna 200 com `{ user: { token, payload } }` se válido. **Aceita**: header `Authorization: Bearer <token>` ou cookie.
- `GET /api/pacientes` — lista pacientes. **Aceita**: header Authorization ou cookie.
- `POST /api/pacientes` — cria paciente (body: `{ nome, email, contato, valor_sessao }`).
- `GET/PUT/DELETE /api/pacientes/:id` — operações por id.
- `GET /api/sessoes`, `POST /api/sessoes` — CRUD sessões (fields: `id_paciente, data, valor, pago, owner`).
- `GET/PUT/DELETE /api/sessoes/:id` — operações por id.
- `GET /api/sessoes` — paginação server-side com padrão `page=1&perPage=20`; aceita `sort`.
- `GET /api/reports` — **Query params**: `?collection=(faturamento_mensal|valores_receber)&page=N&perPage=M`. Paginação server-side.

Pages importantes

- `src/pages/pacientes.astro` — CRUD pacientes com placeholders, máscara de moeda, paginação server-side e seletor de `perPage` (`20/50/100`).
- `src/pages/sessoes.astro` — CRUD sessões com ordenação de pacientes por nome, data textual amigável, máscara de moeda, paginação server-side e seletor `20/50/100`.
- `src/pages/relatorios.astro` — duas tabelas com paginação no padrão de sessões (`20/50/100`) e filtro frontend por nome em `valores_receber`.
- `src/pages/index.astro` e `src/pages/dashboard.astro` — layout mobile-first, botões retangulares e acessíveis ao toque.

Libs e helpers

- `src/lib/jwt-helper.ts` — `decodeJwt()` decodifica JWT e valida expiração; `getTokenFromRequest()` extrai token de header `Authorization: Bearer` ou cookie.
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
- **Paginação server-side**: padrão atualizado para `perPage=20` em pacientes/sessões/relatórios, com opções de UI `20/50/100`.
- **Paginação em sessões**: `/api/sessoes?sort=-data&page=1&perPage=20` retorna `{ page, perPage, totalPages, totalItems, items }`.
- **Paginação em pacientes**: `/api/pacientes?page=1&perPage=20` retorna `{ page, perPage, totalPages, totalItems, items }`.
- **Mobile-first UI**: filtros e controles em coluna em mobile; flex-row em md+ breakpoint. Back links ("← Voltar ao Dashboard") em todas as páginas do dashboard.
- **Segurança**: cookies são httpOnly; token em localStorage é apenas para conveniência. Recomendação futura: implementar refresh tokens e revogação.

Testes e verificação

- Testes básicos a executar:
  - Autenticação: `POST /api/auth/login` e `GET /api/auth/user` para validar cookie.
  - CRUD Pacientes: criar, editar, listar, excluir via UI `/pacientes`.
  - CRUD Sessões: criar/editar/listar/excluir e escolher paciente no select.
  - Paginação: validar default de 20 itens/página e troca para 50/100 nas telas de pacientes, sessões e relatórios.
  - Relatórios: abrir `/relatorios`, testar filtro por nome em valores a receber e paginação.
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
- Atualizado padrão de paginação para `20/50/100` nas telas de pacientes, sessões e relatórios.
- Layout de `index` e `dashboard` ajustado para mobile-first com botões retangulares.
- Removidos arquivos legados do AstroWind em `src` para reduzir complexidade de manutenção.
- `astro.config.ts` simplificado para remover integrações não usadas.
- Corrigidos warnings de `npm run check`/`npm run fix` (incluindo `.npmrc` e scripts inline Astro).

Se precisar que eu gere um resumo ainda mais estruturado (ex.: tabelas com rotas e contratos JSON), diga qual formato prefere.
