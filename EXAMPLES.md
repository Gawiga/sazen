# Exemplos de Uso - Autenticação com PocketBase

## Login Simples

### HTML Form (Recomendado)

```astro
---
import LoginForm from '~/components/auth/LoginForm.astro';
---

<LoginForm />
```

### JavaScript/TypeScript

```typescript
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    // Salvar no localStorage para disponibilidade no cliente
    localStorage.setItem(
      'pb_auth',
      JSON.stringify({
        token: data.token,
        record: data.record,
      })
    );

    // Redirecionar para dashboard
    window.location.href = '/dashboard';
  } else {
    console.error('Erro de login:', data.error);
  }
}
```

## Criar Conta

```astro
---
import type { SignupPayload } from '~/types/auth';
---

<form id="signup-form">
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  <input type="password" name="passwordConfirm" required />
  <button type="submit">Criar Conta</button>
</form>

<script>
  const form = document.getElementById('signup-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/dashboard';
    } else {
      alert(data.error);
    }
  });
</script>
```

## OAuth2 Login (Google)

```astro
---
import OAuthLogin from '~/components/auth/OAuthLogin.astro';
---

<button onclick="loginWithGoogle()"> Login com Google </button>

<script>
  async function loginWithGoogle() {
    const response = await fetch('/api/auth/oauth/google');
    const data = await response.json();

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  }
</script>
```

## Usar Serviço de Autenticação

```typescript
import { AuthService, createAuthService } from '~/lib/auth';
import PocketBase from 'pocketbase';

// Criar instância do serviço
const pb = new PocketBase('https://gawiga-server.bonito-dace.ts.net/');
const authService = createAuthService(pb);

// Email e Senha
const loginResult = await authService.loginWithPassword('user@example.com', 'password123');

if (loginResult.success) {
  console.log('Usuário logado:', loginResult.user);
  console.log('Token:', loginResult.data);
}

// OAuth2
const oauthResult = await authService.loginWithOAuth2('google');

// Logout
const logoutResult = authService.logout();

// Verificar autenticação
if (authService.isAuthenticated()) {
  const user = authService.getCurrentUser();
  console.log('Usuário atual:', user);
}
```

## Obter Dados do Usuário

```typescript
// No cliente
const auth = JSON.parse(localStorage.getItem('pb_auth') || '{}');
const token = auth.token;
const userRecord = auth.record;

console.log('Email:', userRecord.email);
console.log('ID:', userRecord.id);
```

## Usar Dados do Usuário em Componentes

```astro
---
const auth = Astro.cookies.get('pb_auth')?.value;

let userEmail = null;
if (auth) {
  const authData = JSON.parse(auth);
  userEmail = authData.record.email;
}
---

{userEmail ? <p>Bem-vindo, {userEmail}!</p> : <a href="/login">Fazer login</a>}
```

## Logout

```typescript
async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (response.ok) {
    localStorage.removeItem('pb_auth');
    window.location.href = '/';
  }
}
```

## Adicionar Usuário a um Layout

```astro
---
// layouts/MainLayout.astro
import Header from '~/components/Header.astro';
import UserMenu from '~/components/auth/UserMenu.astro';

const user = Astro.cookies.get('pb_auth')?.value;
let userData = null;

if (user) {
  try {
    const authData = JSON.parse(user);
    userData = authData.record;
  } catch (e) {
    // Cookie inválido
  }
}
---

<Header>
  {userData && <UserMenu user={userData} />}
</Header>

<slot />
```

## Fetch com Autenticação

```typescript
// Usar token do PocketBase para fazer requisições autenticadas
const auth = JSON.parse(localStorage.getItem('pb_auth') || '{}');
const token = auth.token;

const response = await fetch('/api/dados', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Verificar Autenticação no Servidor

```typescript
// Em um endpoint de API
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  const authCookie = cookies.get('pb_auth');

  if (!authCookie) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Usuário autenticado
  return new Response(JSON.stringify({ message: 'Dados protegidos' }), { status: 200 });
};
```

## Atualizar Perfil do Usuário

```typescript
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://gawiga-server.bonito-dace.ts.net/');

// Obter token do localStorage
const auth = JSON.parse(localStorage.getItem('pb_auth') || '{}');
pb.authStore.save(auth.token, auth.record);

// Atualizar usuário
const updated = await pb.collection('users').update(auth.record.id, {
  username: 'novo_username',
  // outros campos
});

console.log('Perfil atualizado:', updated);
```

## Reset de Senha

```typescript
import { createAuthService } from '~/lib/auth';

const authService = createAuthService();

// Solicitar reset
const resetRequest = await authService.requestPasswordReset('user@example.com');

// Confirmar reset (após usuário clicar no link no email)
const resetConfirm = await authService.confirmPasswordReset('token_do_email', 'nova_senha', 'nova_senha_confirmacao');
```

## Proteger uma Rota Customizada

```astro
---
// pages/minha-rota-protegida.astro

// Verificar autenticação no servidor
const authCookie = Astro.cookies.get('pb_auth');

if (!authCookie) {
  return Astro.redirect('/login');
}

// Resto do componente
---

<h1>Esta página é protegida</h1>
```

## Redirecionar Usuário Logado

```typescript
// Se usuário já está logado, redirecionar para dashboard
if (localStorage.getItem('pb_auth')) {
  window.location.href = '/dashboard';
}
```
