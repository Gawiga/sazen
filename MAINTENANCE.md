# MAINTENANCE

## Estrutura mínima a manter

- Páginas principais: `login`, `dashboard`, `pacientes`, `sessoes`, `relatorios*`
- APIs internas em `src/pages/api/**`
- Lógica server-side em `src/services/*Service.ts`
- Lógica client-side em `src/services/uiService.ts`, `patientService.ts`, `sessionService.ts`

## Convenções técnicas

- Requisições autenticadas: usar `UIService`.
- Paginação padrão: `20`, opções `50/100`.
- Filtros devem ser previsíveis e explícitos.
- Evitar `any`; priorizar `src/types/api.ts`.

## Estado funcional atual

### Pacientes

- Filtro de status: `ativo` (padrão), `inativo`, `todos`.
- Tabela: `Nome` + `Ações`.
- Ações por linha via menu compacto.

### Sessões

- Ordem de carregamento: pacientes -> sessões.
- Filtro frontend por nome do paciente (`session-name-filter`).
- Tabela: `Data` + `Ações`.
- Formato de data: `dd/mmm às HHhmm`.
- Ações no menu: toggle pagamento, editar, excluir.

### Relatórios

- Hub: `src/pages/relatorios.astro`.
- Faturamento: `src/pages/relatorios-faturamento.astro`.
- Valores a receber: `src/pages/relatorios-valores-receber.astro`.
- Valores a receber contém filtro por nome e coluna `Mês`.

## Arquivos críticos para regressão

- `src/pages/pacientes.astro`
- `src/pages/sessoes.astro`
- `src/pages/relatorios-valores-receber.astro`
- `src/navigation.ts`
- `src/services/pacientesService.ts`
- `src/services/sessionService.ts`

## Testes essenciais

- `tests/unit/pages-core.test.ts`
- `tests/unit/navigation.test.ts`
- `tests/unit/pacientes-service.test.ts`
- `tests/unit/patient-service-client.test.ts`
- `tests/unit/session-service-client.test.ts`

## Rotina de entrega

1. Implementar mudança.
2. Atualizar/Adicionar testes unitários.
3. Rodar:
   - `npm run check`
   - `npm run fix`
   - `npm run test:unit`
4. Registrar no `AGENTS.md` apenas o que muda regra/fluxo.

## Atualização de UX e bugfix (Fevereiro 2026)

### Sessões

- Bug corrigido: ao apagar o filtro por nome, a lista volta a mostrar todas as sessões da página atual.
- Estrutura da coluna principal mudou para leitura rápida:
  - Nome do paciente
  - Data resumida com dia da semana
  - Valor da sessão
  - Status de pagamento

### Pacientes

- Linha com expansão de detalhes ao clicar no nome (toggle inline).
- Mantido menu de ações independente na coluna `Ações`.

### Regressão a monitorar

- Reset de filtro em sessões após ações de editar/excluir/toggle pagamento.
- Expansão de detalhes em pacientes sem interferir no menu de ações.

## Atualização de tema e acessibilidade mobile (Fevereiro 2026)

### Botão de retorno

- Em páginas do dashboard, o antigo link textual `← Voltar ao Dashboard` foi substituído por botão acessível com:
  - `min-h-11` (área de toque adequada)
  - `aria-label="Voltar ao Dashboard"`

### Tema `lilac`

- Tema adicional disponível via `localStorage.theme = "lilac"`.
- Fluxo de alternância no botão de tema:
  - `light -> dark -> lilac -> light`
- Arquivos chave:
  - `src/components/common/ApplyColorMode.astro`
  - `src/components/common/BasicScripts.astro`
  - `src/components/CustomStyles.astro`
  - `src/assets/styles/tailwind.css`

### Testes

- `tests/unit/theme-mode.test.ts` valida suporte ao tema lilás no script e estilos.
- `tests/unit/pages-core.test.ts` valida padrão do botão de voltar ao dashboard nas páginas principais.
