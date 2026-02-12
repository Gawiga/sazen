# 🎯 Quick Reference - Autenticação PocketBase

## 📍 Localização dos Arquivos

| O quê              | Onde                 | Arquivo            |
| ------------------ | -------------------- | ------------------ |
| Componente Login   | src/components/auth/ | `LoginForm.astro`  |
| Componente OAuth2  | src/components/auth/ | `OAuthLogin.astro` |
| Menu Usuário       | src/components/auth/ | `UserMenu.astro`   |
| Serviço Auth       | src/lib/             | `auth.ts`          |
| Cliente PocketBase | src/lib/             | `pocketbase.ts`    |
| Página Login       | src/pages/           | `login.astro`      |
| Página Signup      | src/pages/           | `signup.astro`     |
| Dashboard          | src/pages/           | `dashboard.astro`  |
| Middleware         | src/                 | `middleware.ts`    |

---

## 🔄 Fluxos Rápidos

### Login com Email/Senha

```
login.astro → LoginForm.astro → /api/auth/login → PocketBase
```

### Login com OAuth2

```
OAuthLogin.astro → /api/auth/oauth/[provider] → Google/Github
→ /api/auth/oauth-callback → Dashboard
```

### Logout

```
UserMenu.astro → /api/auth/logout → localStorage.removeItem()
```

### Proteger Rota

```
middleware.ts → Verificar cookie → Redirecionar se inválido
```

---

## 💻 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev                 # Servidor na porta 4322

# Build
npm run build              # Build para produção

# Preview
npm run preview            # Pré-visualizar build

# Linting
npm run check:eslint       # Verificar erros ESLint
npm run fix:eslint         # Corrigir erros ESLint
```

---

## 🔑 Variáveis de Ambiente

```env
PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/
PUBLIC_POCKETBASE_COLLECTION=pacientes
PUBLIC_OAUTH_GOOGLE_CLIENT_ID=seu_client_id
PUBLIC_OAUTH_GITHUB_CLIENT_ID=seu_client_id
```

Arquivo: `.env.local`

---

## 🛣️ Rotas Disponíveis

| Rota                       | Método | Auth | Descrição         |
| -------------------------- | ------ | ---- | ----------------- |
| `/login`                   | GET    | ❌   | Página de login   |
| `/signup`                  | GET    | ❌   | Página de signup  |
| `/dashboard`               | GET    | ✅   | Painel do usuário |
| `/api/auth/login`          | POST   | ❌   | Autentica         |
| `/api/auth/signup`         | POST   | ❌   | Cria conta        |
| `/api/auth/logout`         | POST   | ✅   | Faz logout        |
| `/api/auth/user`           | GET    | ✅   | Dados do usuário  |
| `/api/auth/oauth/google`   | GET    | ❌   | OAuth2 Google     |
| `/api/auth/oauth-callback` | GET    | ❌   | OAuth2 callback   |

---

## 📦 Componentes & Props

### LoginForm

```astro
<LoginForm />
<LoginForm collectionName="usuarios" />
```

### OAuthLogin

```astro
<OAuthLogin />
<OAuthLogin collectionName="usuarios" />
```

### UserMenu

```astro
<UserMenu user={userData} />
```

---

## 📂 Estrutura de Tipo

```typescript
interface PBUser {
  id: string;
  email: string;
  username?: string;
  verified?: boolean;
  created?: string;
  updated?: string;
  [key: string]: any;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  record?: PBUser;
  error?: string;
}
```

---

## 🔐 Como Proteger uma Página

```astro
---
// Verificar autenticação
const auth = Astro.cookies.get('pb_auth');
if (!auth) {
  return Astro.redirect('/login');
}

const user = JSON.parse(auth.value).record;
---

<!-- Página protegida -->
<h1>Bem-vindo, {user.email}</h1>
```

---

## 🎨 Customizar Cores

Em `LoginForm.astro` ou `OAuthLogin.astro`:

```astro
<!-- Mudar cores Tailwind -->
<button class="bg-blue-600 hover:bg-blue-700">
  <!-- Mudar para -->
  <button class="bg-green-600 hover:bg-green-700"></button></button
>
```

**Classes úteis:**

- Primária: `bg-blue-600`
- Perigo: `bg-red-600`
- Sucesso: `bg-green-600`

---

## 🐛 Troubleshooting Rápido

| Erro             | Solução                                 |
| ---------------- | --------------------------------------- |
| Module not found | `npm install pocketbase`                |
| Can't find .env  | Copiar `.env.example` para `.env.local` |
| Build fails      | Verificar `astro.config.ts` tem adapter |
| CORS error       | Configurar CORS no PocketBase           |
| Login inválido   | Verificar credenciais no PocketBase     |
| Redirect loop    | Verificar middleware.ts                 |

---

## 📊 Checklist Mínimo para Deploy

- [ ] `.env.local` configurado
- [ ] PocketBase URL correta
- [ ] Coleção criada no PocketBase
- [ ] `npm run build` sem erros
- [ ] Testado em `npm run dev`
- [ ] Git commit feito
- [ ] Push para repositório

---

## 🚀 Deploy um Comando

```bash
# 1. Configurar
cp .env.example .env.local
# Editar .env.local

# 2. Testar
npm run dev

# 3. Build
npm run build

# 4. Push & Deploy
git add .
git commit -m "feat: Add PocketBase authentication"
git push
# Netlify deploya automaticamente
```

---

## 🔗 Imports Comuns

```typescript
// Autenticação
import { AuthService, createAuthService } from '~/lib/auth';
import PocketBase from 'pocketbase';

// Tipos
import type { PBUser, AuthResponse } from '~/types/auth';

// Componentes
import LoginForm from '~/components/auth/LoginForm.astro';
import OAuthLogin from '~/components/auth/OAuthLogin.astro';
import UserMenu from '~/components/auth/UserMenu.astro';
```

---

## 📝 Cookie Storage

```javascript
// Salvar (automático em login)
localStorage.setItem('pb_auth', JSON.stringify({
  token: 'eyJ...',
  record: { id, email, ... }
}));

// Recuperar
const auth = JSON.parse(localStorage.getItem('pb_auth')|| '{}');
const token = auth.token;

// Limpar (automático em logout)
localStorage.removeItem('pb_auth');
```

---

## 🎯 Padrões Comuns

### Mostrar/Esconder por Autenticação

```astro
---
const user = Astro.cookies.get('pb_auth')?.value;
---

{user ? <div>Conteúdo para logado</div> : <div>Conteúdo para não-logado</div>}
```

### Redirecionar se Logado

```javascript
if (localStorage.getItem('pb_auth')) {
  window.location.href = '/dashboard';
}
```

### Fetch com Token

```javascript
const auth = JSON.parse(localStorage.getItem('pb_auth') || '{}');
fetch(url, {
  headers: {
    Authorization: `Bearer ${auth.token}`,
  },
});
```

---

## 📚 Documentação Rápida

| Doc                                   | Tempo  | Tipo    |
| ------------------------------------- | ------ | ------- |
| [QUICKSTART](./QUICKSTART.md)         | 5 min  | Início  |
| [EXAMPLES](./EXAMPLES.md)             | 10 min | Código  |
| [CHECKLIST](./CHECKLIST.md)           | 20 min | Guia    |
| [AUTHENTICATION](./AUTHENTICATION.md) | 15 min | Técnico |

---

## 🆘 Precisa de Ajuda?

1. **Erro de build?** → Ver `npm run build` output
2. **Erro de login?** → Verificar `console.log`
3. **CORS?** → Verificar PocketBase settings
4. **Tipo não reconhecido?** → Rodar `astro check`

---

## ✅ Próximos 5 Passos

1. Ler [QUICKSTART.md](./QUICKSTART.md)
2. Editar `.env.local`
3. Rodar `npm run dev`
4. Testar `/login`
5. Deploy

---

**Bookmark isso!** 🔖

Last Updated: Fevereiro 2026
