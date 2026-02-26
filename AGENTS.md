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

## Atualização Sessões + Pacientes (Fevereiro 2026)

- Sessões (`src/pages/sessoes.astro`):
  - Correção do filtro por nome: ao limpar o input, a lista recarrega a página atual (`loadSessions(currentPage)`) para restaurar todos os registros.
  - Coluna principal agora prioriza paciente e contexto da sessão no formato:
    - Nome do paciente
    - `DiaSemana - dd/mm às HHhmm`
    - `Valor Sessão: R$ ...`
    - `Pagamento: Pago|Pendente`

- Pacientes (`src/pages/pacientes.astro`):
  - Nome da linha virou toggle de detalhes (`patient-toggle`) com expansão inline (`patient-details-*`).
  - Detalhes exibidos: endereço, telefone, email, nascimento, início, valor sessão e status.

- Testes atualizados:
  - `tests/unit/pages-core.test.ts` cobre reset do filtro em sessões e toggle de detalhes em pacientes.

## Atualização de Navegação Mobile + Tema Lilás (Fevereiro 2026)

- Navegação de retorno ao dashboard foi padronizada para botão mobile-first com alvo de toque maior:
  - `src/pages/pacientes.astro`
  - `src/pages/sessoes.astro`
  - `src/pages/relatorios-faturamento.astro`
  - `src/pages/relatorios-valores-receber.astro`

- Novo tema global `lilac` implementado no projeto:
  - `src/components/common/ApplyColorMode.astro` reconhece/aplica `lilac`
  - `src/components/common/BasicScripts.astro` agora cicla tema em: `light -> dark -> lilac -> light`
  - `src/components/CustomStyles.astro` define tokens e aparência lilás
  - `src/assets/styles/tailwind.css` ajusta header sticky no modo lilás

- `src/components/common/ToggleTheme.astro` atualizado para refletir alternância de três temas.

- Testes adicionados/ajustados:
  - `tests/unit/theme-mode.test.ts`
  - `tests/unit/pages-core.test.ts` (botão de retorno acessível e validações relacionadas)

## Atualização Tema Lilás Escuro + Estabilidade de Sessão (Fevereiro 2026)

- Tema `lilac` foi ajustado para visual escuro (base dark) com acentos roxo/lilás:
  - Fundo escuro e tipografia clara
  - Botões primários e destaques em tons lilás
  - Header sticky lilás escuro

- Correção de sessão ao voltar para dashboard:
  - `src/components/auth/UserMenu.astro` agora chama `/api/auth/user` com `Authorization: Bearer <token>` quando disponível e `credentials: include`.
  - Removido redirect agressivo para `/login` quando a leitura de usuário falha pontualmente no menu.
  - Resultado: navegação por "Voltar ao Dashboard" não deve mais derrubar sessão por falha transitória de hidratação/auth do menu.

- Testes adicionados/ajustados:
  - `tests/unit/user-menu.test.ts`
  - `tests/unit/theme-mode.test.ts`
