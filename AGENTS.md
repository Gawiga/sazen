# AGENT_HELPER

## Objetivo

Guia rápido para agentes manterem o projeto Astro + PocketBase com baixo acoplamento e manutenção simples.

## Fluxo principal em produção

- Login: `src/pages/login.astro`
- Dashboard: `src/pages/dashboard.astro`
- Módulos:
  - `src/pages/pacientes.astro`
  - `src/pages/sessoes.astro`
  - `src/pages/relatorios.astro` (hub)
  - `src/pages/relatorios-faturamento.astro`
  - `src/pages/relatorios-valores-receber.astro`

## APIs e serviços

- Auth API: `src/pages/api/auth/*`
- Pacientes API: `src/pages/api/pacientes/*` delega para `src/services/pacientesService.ts`
- Sessões API: `src/pages/api/sessoes/*` delega para `src/services/sessoesService.ts`
- Reports API: `src/pages/api/reports/index.ts`

- Client services:
  - `src/services/uiService.ts` (auth header, loading, retry 401 + refresh)
  - `src/services/patientService.ts`
  - `src/services/sessionService.ts`
  - `src/services/paginationService.ts`

## Padrões obrigatórios

- Mobile-first nas páginas do dashboard.
- Sem `fetchWithAuth` duplicado nas páginas: usar `UIService`.
- Tipos em `src/types/api.ts`.
- Helpers de formatação em `src/utils/formatting.ts`.
- Filtros/paginação explícitos por query params (`page`, `perPage`, `sort`, `status`).

## Regras funcionais atuais

- Pacientes:
  - filtro de status (`ativo` padrão, `inativo`, `todos`)
  - tabela compacta com colunas `Nome` e `Ações`
  - ações por menu compacto (`details/summary`)

- Sessões:
  - carrega pacientes antes de carregar sessões
  - filtro frontend por nome do paciente (`#session-name-filter`)
  - tabela compacta com colunas `Data` e `Ações`
  - data curta: `dd/mmm às HHhmm` (ex.: `25/fev às 19h30`)
  - ações por menu compacto com toggle de pagamento, editar e excluir

- Relatórios:
  - separados em duas páginas dedicadas
  - `relatorios-valores-receber` com filtro por nome e coluna `Mês`

## Navegação

- `src/navigation.ts` expõe:
  - `/relatorios`
  - `/relatorios-faturamento`
  - `/relatorios-valores-receber`

## Testes e validação local

- Unit tests: `npm run test:unit`
- Qualidade: `npm run check` e `npm run fix`
- Sempre atualizar testes ao alterar:
  - contratos de serviço
  - estrutura de tabela/layout em páginas
  - filtros e paginação

## Checklist para mudanças novas

1. Alterou página do dashboard? atualizar `tests/unit/pages-core.test.ts`.
2. Alterou rotas de navegação? atualizar `tests/unit/navigation.test.ts`.
3. Alterou serviço/API? criar/ajustar teste unitário correspondente.
4. Rodar `check`, `fix`, `test:unit` antes de concluir.
