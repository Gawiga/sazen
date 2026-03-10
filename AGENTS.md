# AGENTS

## Objetivo

Manter o projeto Astro + PocketBase simples, seguro e com baixo acoplamento.

## Fluxo principal

- `src/pages/login.astro`
- `src/pages/dashboard.astro`
- `src/pages/pacientes.astro`
- `src/pages/sessoes.astro`
- `src/pages/relatorios-faturamento.astro`
- `src/pages/relatorios-valores-receber.astro`

## Serviços (domínio)

- Serviços canônicos:
  - `src/services/pacienteService.ts`
  - `src/services/sessaoService.ts`
- Relatórios:
  - `src/services/reportService.ts`
- Base HTTP/auth client:
  - `src/services/uiService.ts`

## APIs

- Pacientes: `src/pages/api/pacientes/*`
- Sessões: `src/pages/api/sessoes/*`
- Relatórios (leitura): `src/pages/api/reports/index.ts`
- Auth: `src/pages/api/auth/*`

## Regra crítica de pagamento

Nunca confirmar pagamento fora de escopo.
Sempre validar no backend:

- owner (token)
- mês (`monthKey`)
- sessão pendente (`pago=false`)
- paciente (`patientId` ou `patientName`)

## Valores a receber

- Modal exibe preview antes de confirmar.
- Confirmação é item a item (`pay-single`).
- Endpoints:
  - `POST /api/sessoes/pending-preview`
  - `POST /api/sessoes/pay-single`

## Checklist obrigatório

1. Atualizar testes quando alterar serviço/API/página.
2. Rodar:
   - `npm run check`
   - `npm run fix`
   - `npm run test:unit`
3. Não finalizar com testes quebrados.
