# Skills Operacionais do Projeto

## Origem

Skills instaladas via Smithery para apoiar este repositório:

- `whamp-pocketbase`
- `tech-leads-club-perf-astro`

Local de instalação:

- `.agents/skills/whamp-pocketbase/`
- `.agents/skills/tech-leads-club-perf-astro/`

## Como usar no projeto

### PocketBase (`whamp-pocketbase`)

Aplicar para:

- Regras de segurança e filtros server-side.
- Padrões de autenticação, relação entre coleções e paginação.
- Operações de records, realtime e deploy/produção.

Diretriz prática para este código:

- Priorizar validação no backend (`src/pages/api/**` e `src/services/*Service.ts`).
- Não depender de estado global de auth no SSR.
- Manter paginação e filtros explícitos por query (`page`, `perPage`, `sort`).

### Astro Performance (`tech-leads-club-perf-astro`)

Aplicar para:

- Auditoria de LCP, fontes, scripts de terceiros e compressão.
- Otimizações em layout/head sem regressão de UX.

Diretriz prática para este código:

- Preservar legibilidade e segurança antes de micro-otimizações.
- Medir com Lighthouse antes/depois de alterações estruturais.

## Observações de manutenção

- `npm run check` deve ignorar formatação dos artefatos de skills externas.
- `.prettierignore` já inclui `.agents` para evitar ruído em CI/local.
