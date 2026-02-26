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
