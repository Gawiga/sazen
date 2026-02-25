# Guia de Manutenibilidade e Padrões

## Padrões Estabelecidos

### 1. **UIService** (`src/services/uiService.ts`)

---

Centraliza toda lógica de requisições HTTP autenticadas com loading automático.

**Uso em componentes:**

```typescript
import { UIService, scrollToElement } from "~/services/uiService";

// GET tipado
const data = await UIService.get<PaginatedResponse<Paciente>>("/api/pacientes");

// POST tipado
await UIService.post<Paciente>("/api/pacientes", payload);

// PUT tipado
await UIService.put<Paciente>(`/api/pacientes/${id}`, payload);

// DELETE
await UIService.delete(`/api/pacientes/${id}`);

// Scroll suave ao editar
scrollToElement("form-container");
```

### 2. **Services Específicos** (`src/services/`)

---

- **PatientService**: `createPatient()`, `updatePatient()`, `deletePatient()`, `getPatient()`, `getPatients()`
- **SessionService**: `getAllPatients()`, `getSessions()`, `createSession()`, `updateSession()`, `deleteSession()`, `togglePaymentStatus()`

**Uso:**

```typescript
import { PatientService } from "~/services/patientService";

const data = await PatientService.getPatients(page, perPage);
await PatientService.createPatient(payload);
await PatientService.deletePatient(id);
```

### 3. **Utilitários de Formatação** (`src/utils/formatting.ts`)

---

Funções reutilizáveis para formatação de dados:

- `formatCurrency(value)` - Formata número como "R$ X,XX"
- `parseCurrency(value)` - Converte "R$ X,XX" para número
- `formatDateForInput(dateString)` - Converte para "YYYY-MM-DD"
- `formatDateInPortuguese(dateString)` - Formata como "segunda-feira, 20 de fevereiro às 19h30"
- `attachCurrencyMask(input)` - Anexa máscara a input
- `getFormElement(id)` - Obter elemento com type casting seguro
- `toggleElement(id, show)` - Alterna visibilidade

**Uso:**

```typescript
import {
  formatCurrency,
  parseCurrency,
  attachCurrencyMask,
} from "~/utils/formatting";

const formatted = formatCurrency(1000.5); // "R$ 1.000,50"
const parsed = parseCurrency("R$ 1.000,50"); // 1000.50
attachCurrencyMask(inputElement);
```

### 4. **Tipos Centralizados** (`src/types/api.ts`)

---

```typescript
export interface Paciente { ... }
export interface Sessao { ... }
export interface SessionItem extends Sessao { ... }
export interface PacienteOption { ... }
export interface RelatorioData { ... }
export interface PaginatedResponse<T> { ... }
export interface PaginationConfig { ... }
```

### 5. **Componente Loading** (melhorado)

---

- Fadding de 200ms na entrada e saída
- Overlay centralizado com blur
- Classes CSS para controle fino: `.show` e `.hide`
- Controlado globalmente: `window.showLoading()` e `window.hideLoading()`

**Uso automático:**
UIService automaticamente mostra loading para todas as requisições HTTP.

## Padrões de Refatoração

### Antes (duplicação)

```typescript
// Cada página tinha seu próprio fetchWithAuth
function fetchWithAuth(url, options = {}) {
  const token = getTokenFromLocalStorage();
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, {...options, headers});
}

// Duplicado: formatação de moeda
function formatCurrencyInput(value) { ... }
function parseCurrencyInput(value) { ... }

// Duplicado: obter elemento
const byId = (id) => document.getElementById(id) as HTMLElement;
```

### Depois (centralizado)

```typescript
// Úm lugar: UIService
const data = await UIService.get<T>(url);

// Um lugar: formatação
import { formatCurrency, parseCurrency } from "~/utils/formatting";

// Um lugar: helper
import { getFormElement, scrollToElement } from "~/utils/formatting";
const element = getFormElement("id");
scrollToElement("form-container");
```

## Estrutura de Diretorios

```
src/
├── components/
│   └── widgets/
│       └── Loading.astro (melhorado com fadding)
├── pages/
│   ├── pacientes.astro (refatorado com PatientService)
│   ├── sessoes.astro (refatorado com SessionService)
│   └── relatorios.astro (refatorado com UIService)
├── services/
│   ├── uiService.ts (requisições HTTP)
│   ├── patientService.ts (lógica de pacientes)
│   ├── sessionService.ts (lógica de sessões)
│   ├── pacientesService.ts (backend - não mudar)
│   ├── sessoesService.ts (backend - não mudar)
│   └── paginationService.ts (existente)
├── types/
│   ├── api.ts (tipos da API + UI)
│   └── paciente.ts (mantém compatibilidade)
└── utils/
    └── formatting.ts (utilitários reutilizáveis)
```

## Páginas Refatoradas

As seguintes páginas foram completamente refatoradas para seguir os novos padrões:

1. **pacientes.astro** - CRUD completo de pacientes com paginação
2. **sessoes.astro** - CRUD completo de sessões com paginação e toggle de status de pagamento
3. **relatorios.astro** - Visualização de relatórios de faturamento e valores a receber

Todas as páginas agora utilizam:

- UIService para requisições HTTP
- Tipos definidos em `types/api.ts`
- Utilitários de formatação de `utils/formatting.ts`
- Loading automático com fadding 200ms
- Auto-scroll ao editar formulários

## Testes

Todos os utilitários têm testes em `tests/unit/formatting.test.ts`:

- Formatação de moeda
- Parsing de moeda
- Formatação de datas
- Etc.

Rodar: `npm run test:unit -- --run`

## Próximos Passos

1. Implementar refresh tokens para segurança
2. Ampliar testes E2E com Playwright
3. Criar testes unitários para novos serviços
4. Corrigir quaisquer warnings do npm run check

## Atualização de Limpeza (Fevereiro 2026)

### Remoções executadas

- Páginas removidas:
  - `src/pages/[...blog]/`
  - `src/pages/homes/`
  - `src/pages/landing/`
- Componentes/layout removidos por estarem órfãos após limpeza:
  - `src/components/blog/`
  - `src/components/widgets/BlogLatestPosts.astro`
  - `src/components/widgets/BlogHighlightedPosts.astro`
  - `src/layouts/LandingLayout.astro`

### Garantias de não regressão

- Fluxo principal preservado:
  - `src/pages/login.astro`
  - `src/pages/dashboard.astro`
  - `src/pages/pacientes.astro`
  - `src/pages/sessoes.astro`
  - `src/pages/relatorios.astro`
- APIs preservadas em `src/pages/api/**`.
- Testes e validação:
  - `npm run check` passando sem erros/warnings.
  - `npm run test:unit -- --run`: `127/127` passando.

### Testes adicionados nesta etapa

- `tests/unit/patient-service-client.test.ts`
- `tests/unit/session-service-client.test.ts`
- `tests/unit/pages-core.test.ts`

### Ajustes técnicos para estabilidade

- `src/lib/pocketbase.ts`: guard para `localStorage.getItem` em ambiente de testes.
- `src/lib/auth.ts`: guards para `localStorage.setItem/removeItem`.
- `.prettierignore`: adicionado `.agents` para excluir skills externas instaladas via Smithery.
