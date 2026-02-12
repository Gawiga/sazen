# 🔐 Autenticação PocketBase - Setup Simplificado (Email/Senha)

## O Que Foi Criado

```
✅ Autenticação com Email + Senha
✅ Signup (criar conta)
✅ Logout
✅ Proteção de rotas
✅ Componentes prontos
✅ Pronto para produção
```

**SEM OAuth, sem complicações!**

---

## 📁 Arquivos Principais

```
src/lib/auth.ts                         # Serviço de autenticação
src/components/auth/LoginForm.astro     # Componente de login
src/components/auth/UserMenu.astro      # Menu de usuário
src/pages/login.astro                   # Página de login
src/pages/signup.astro                  # Página de signup
src/pages/dashboard.astro               # Dashboard protegido
src/pages/api/auth/login.ts             # Endpoint de login
src/pages/api/auth/signup.ts            # Endpoint de signup
src/pages/api/auth/logout.ts            # Endpoint de logout
src/pages/api/auth/user.ts              # Endpoint de usuário
src/middleware.ts                       # Proteção de rotas
```

---

## ⚡ Começo Rápido (2 minutos)

### 1. Configurar variáveis

```bash
# .env.local já está preenchido com:
PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/
PUBLIC_POCKETBASE_COLLECTION=pacientes
```

### 2. Que tal testar?

```bash
npm run dev
# Acesse: http://localhost:4322/login
```

### 3. Credenciais de Teste

Use qualquer email/senha válidos cadastrados no seu PocketBase

---

## 🚀 Fluxo Simples

### Login

```typescript
// Usuário vai em /login
// Preenche email e senha
// Clica "Entrar"
// POST /api/auth/login
// PocketBase valida com: pb.collection('users').authWithPassword(email, password)
// Token guardado em cookie HTTP-only
// Redirecionado para /dashboard
```

### Criar Conta

```
/signup → Preenche dados → POST /api/auth/signup → Auto-login → /dashboard
```

### Logout

```
Botão Sair → POST /api/auth/logout → Google da sessão → /
```

---

## 📝 Código de Exemplo

### Usar em Componentes

```astro
---
import LoginForm from '~/components/auth/LoginForm.astro';
---

<LoginForm />
```

### Mostrar Menu de Usuário

```astro
---
import UserMenu from '~/components/auth/UserMenu.astro';

const auth = Astro.cookies.get('pb_auth')?.value;
let user = null;
if (auth) {
  user = JSON.parse(auth).record;
}
---

{user && <UserMenu user={user} />}
```

### Proteger uma Página

```astro
---
// Verificar autenticação
const auth = Astro.cookies.get('pb_auth');
if (!auth) {
  return Astro.redirect('/login');
}
---

<!-- Conteúdo protegido -->
```

---

## 🔧 Configurar PocketBase

1. Acesse: `https://gawiga-server.bonito-dace.ts.net/admin`
2. Vá para: Collections
3. Edite/Crie a coleção `pacientes`
4. Ative: **Auth**
5. Salve

**Pronto!** Já funciona com email/senha.

---

## ✅ Testar Localmente

```bash
npm run dev

# Em outro terminal:
curl -X POST http://localhost:4322/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha123"}'

# Resposta esperada:
# {
#   "success": true,
#   "token": "JWT_TOKEN",
#   "record": { "id": "...", "email": "...", ... }
# }
```

---

## 🔒 Segurança

- ✅ Senhas validadas no servidor
- ✅ Tokens JWT com expiração
- ✅ Cookies HTTP-only (não acessível via JavaScript)
- ✅ HTTPS obrigatório
- ✅ SameSite proteção

---

## 📚 Documentação Completa

- [QUICKSTART.md](./QUICKSTART.md) - Início rápido
- [EXAMPLES.md](./EXAMPLES.md) - Exemplos de código
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Documentação técnica

---

## 🚀 Deploy

```bash
git add .
git commit -m "Add email/senha authentication"
git push
# Netlify faz deploy automático
```

---

## 💡 Próximos Passos

1. ✅ Testar em `npm run dev`
2. ✅ Fazer login com seu usuário
3. ✅ Explorar código em `src/`
4. ✅ Deploy no Netlify

---

**Está tudo pronto! Use `/login` para fazer login.** 🎉

Ficou muito mais simples, não ficou? 😊
