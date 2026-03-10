# MAINTENANCE

## Estrutura estável

- Páginas: `dashboard`, `pacientes`, `sessoes`, `relatorios-*`
- APIs em `src/pages/api/**`
- Serviços por domínio em `src/services/**`
  - canônicos: `pacienteService.ts` e `sessaoService.ts`

## Operações sensíveis

### Pagamento

- Preview antes de confirmar.
- Confirmação sessão a sessão.
- Validação server-side obrigatória de owner + paciente + mês + pendente.

### Auth

- Em `401` sem recuperação: limpar sessão local e redirecionar para `/login`.

## Evitar regressões de navegação

Com `ClientRouter`, scripts podem receber múltiplos `astro:page-load`.

- Inicialização deve ser idempotente por DOM atual.
- Não fazer fetch se elementos da página não existirem.
- Evitar bind duplicado de listeners.

## Testes mínimos

- `tests/unit/sessoes-service.test.ts`
- `tests/unit/session-service-client.test.ts`
- `tests/unit/pacientes-service.test.ts`
- `tests/unit/patient-service-client.test.ts`
- `tests/unit/pages-core.test.ts`

## Entrega

Rodar sempre:

- `npm run check`
- `npm run fix`
- `npm run test:unit`
