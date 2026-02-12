# Snippets Avançados de Integração

## Integrar UserMenu em um Layout

```astro
---
// layouts/MainLayout.astro
import Header from '~/components/Header.astro';

const authCookie = Astro.cookies.get('pb_auth');
let user = null;

if (authCookie) {
  try {
    const auth = JSON.parse(authCookie.value);
    user = auth.record;
  } catch (e) {
    // Cookie inválido, ignorar
  }
}
---

<!doctype html>
<html>
  <head>
    <title>Meu Site</title>
  </head>
  <body>
    <header>
      <nav>
        {
          user ? (
            <div class="flex gap-4">
              <span>Bem-vindo, {user.email}</span>
              <a href="/dashboard">Dashboard</a>
              <button onclick="logout()">Sair</button>
            </div>
          ) : (
            <div class="flex gap-4">
              <a href="/login">Login</a>
              <a href="/signup">Signup</a>
            </div>
          )
        }
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <script>
      async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
      }
    </script>
  </body>
</html>
```

## Componente de Login Modal

```astro
---
// components/LoginModal.astro
interface Props {
  isOpen: boolean;
}

const { isOpen } = Astro.props;
---

<div id="login-modal" class={`fixed inset-0 bg-black/50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
  <div class="bg-white rounded-lg p-8 max-w-md w-full">
    <h2 class="text-2xl font-bold mb-4">Login</h2>

    <form id="login-form" class="space-y-4">
      <input type="email" placeholder="Email" required class="w-full px-4 py-2 border rounded" />
      <input type="password" placeholder="Senha" required class="w-full px-4 py-2 border rounded" />
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"> Entrar </button>
    </form>

    <button onclick="closeModal()" class="mt-4 text-gray-500 hover:text-gray-700"> Fechar </button>
  </div>
</div>

<script>
  function closeModal() {
    document.getElementById('login-modal').classList.add('hidden');
  }

  const form = document.getElementById('login-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Mesmo código do LoginForm.astro
  });
</script>
```

## Página Protegida com Verificação

```astro
---
// pages/configuracoes.astro
import Layout from '~/layouts/MainLayout.astro';

// Verificar autenticação
const authCookie = Astro.cookies.get('pb_auth');
if (!authCookie) {
  return Astro.redirect('/login');
}

const auth = JSON.parse(authCookie.value);
const user = auth.record;

const metadata = {
  title: 'Configurações',
  description: 'Gerenciar suas configurações',
};
---

<Layout metadata={metadata}>
  <section>
    <h1>Configurações</h1>
    <div>
      <h2>Sua Conta</h2>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
      <p>Criado em: {new Date(user.created).toLocaleDateString()}</p>
    </div>
  </section>
</Layout>
```

## Fetch com Token de Autenticação

```typescript
// utils/api.ts
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const auth = localStorage.getItem('pb_auth');
  const token = auth ? JSON.parse(auth).token : null;

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Usar:
const response = await fetchWithAuth('/api/dados-privados');
```

## Monitorar Mudanças de Autenticação

```astro
<script>
  import { AuthService } from '~/lib/auth';

  const authService = new AuthService();

  // Verificar autenticação a cada 5 segundos
  setInterval(() => {
    if (!authService.isAuthenticated()) {
      console.log('Sessão expirada');
      // Redirecionar para login
      window.location.href = '/login';
    }
  }, 5000);

  // Salvar storage quando auth mudar
  window.addEventListener('storage', (e) => {
    if (e.key === 'pb_auth') {
      console.log('Autenticação alterada em outra aba');
      window.location.reload();
    }
  });
</script>
```

## Componente de Perfil Editável

```astro
---
// components/ProfileEditor.astro
interface Props {
  user: any;
}

const { user } = Astro.props;
---

<form id="profile-form" class="space-y-4">
  <div>
    <label>Email</label>
    <input type="email" name="email" value={user.email} disabled class="w-full px-4 py-2 border rounded bg-gray-100" />
  </div>

  <div>
    <label>Username (opcional)</label>
    <input
      type="text"
      name="username"
      value={user.username || ''}
      class="w-full px-4 py-2 border rounded"
      placeholder="Seu username"
    />
  </div>

  <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"> Salvar Alterações </button>
</form>

<script>
  import PocketBase from 'pocketbase';

  const form = document.getElementById('profile-form');
  const pb = new PocketBase('https://gawiga-server.bonito-dace.ts.net/');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const auth = JSON.parse(localStorage.getItem('pb_auth') || '{}');
    pb.authStore.save(auth.token, auth.record);

    const formData = new FormData(form);
    const updates = Object.fromEntries(formData);

    try {
      const updated = await pb.collection('users').update(auth.record.id, updates);

      // Atualizar localStorage
      localStorage.setItem(
        'pb_auth',
        JSON.stringify({
          token: pb.authStore.token,
          record: updated,
        })
      );

      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil: ' + error.message);
    }
  });
</script>
```

## Sistema de Notificações de Autenticação

```astro
---
// components/AuthNotification.astro
---

<div id="auth-notification" class="hidden fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
  <p id="notification-text"></p>
</div>

<script>
  function showNotification(message: string, type: 'success' | 'error' = 'success') {
    const container = document.getElementById('auth-notification');
    const text = document.getElementById('notification-text');

    container?.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    container?.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');

    if (text) {
      text.textContent = message;
    }

    container?.classList.remove('hidden');

    // Esconder após 3 segundos
    setTimeout(() => {
      container?.classList.add('hidden');
    }, 3000);
  }

  // Expose para uso global
  window.showNotification = showNotification;
</script>
```

## Acessar Dados do PocketBase em Endpoints

```typescript
// pages/api/meus-dados.ts
import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL;
const POCKETBASE_COLLECTION = import.meta.env.PUBLIC_POCKETBASE_COLLECTION;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const authCookie = cookies.get('pb_auth');

    if (!authCookie) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const pb = new PocketBase(POCKETBASE_URL);
    const token = authCookie.value;

    // Restaurar sessão
    const auth = JSON.parse(localStorage.getItem('pb_auth') || '{}');
    pb.authStore.save(token, auth.record);

    // Obter dados do usuário atual
    const user = pb.authStore.record;

    // Fazer queries com o token do usuário
    const records = await pb.collection('dados_users').getFullList({
      filter: `user_id = "${user.id}"`,
    });

    return new Response(JSON.stringify({ user, records }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
```

## Hook de Autenticação Customizado

```typescript
// hooks/useAuth.ts
import { AuthService } from '~/lib/auth';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authService] = useState(() => new AuthService());

  useEffect(() => {
    // Restaurar sessão
    const auth = localStorage.getItem('pb_auth');
    if (auth) {
      const { record } = JSON.parse(auth);
      setUser(record);
    }
    setLoading(false);

    // Monitorar mudanças
    const handleStorageChange = () => {
      const auth = localStorage.getItem('pb_auth');
      setUser(auth ? JSON.parse(auth).record : null);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    authService,
  };
}
```

## Proteger Componentes com Autenticação

```astro
---
// components/ProtectedContent.astro
interface Props {
  children: HTMLElement;
  fallback?: HTMLElement;
}

const { children, fallback } = Astro.props;

const authCookie = Astro.cookies.get('pb_auth');
const isAuthenticated = !!authCookie;
---

{isAuthenticated ? children : fallback || <p>Faça login para ver este conteúdo</p>}
```

## Exemplo de Uso:

```astro
---
import ProtectedContent from '~/components/ProtectedContent.astro';
---

<ProtectedContent>
  <div>Conteúdo apenas para usuários logados</div>
</ProtectedContent>
```

---

Esses snippets cobrem os casos mais comuns de uso. Adapte conforme necessário! 🚀
