# SKILLS

## Skills ativas

- `whamp-pocketbase`
- `tech-leads-club-perf-astro`

## Quando usar

- `whamp-pocketbase`:
  - autenticação
  - regras de acesso por owner
  - queries/filtros de segurança
  - operações de pagamento
- `tech-leads-club-perf-astro`:
  - render estável
  - evitar layout shift
  - scripts sem chamadas duplicadas em navegação client-side

## Diretriz prática

- Segurança e consistência de dados têm prioridade sobre UX cosmética.
- Em operação financeira, bloquear atualização em caso de ambiguidade.
- Sempre cobrir mudanças críticas com teste unitário.
