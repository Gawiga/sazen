# Documentação de Autenticação com PocketBase no Astro

## Visão Geral

Este projeto implementa autenticação com **PocketBase** no Astro, suportando:
- ✅ Autenticação com email e senha
- ✅ Autenticação com OAuth2 (Google, GitHub, etc.)
- ✅ Gerenciamento de sessão com cookies HTTP-only
- ✅ Proteção de rotas autenticadas
- ✅ Signup (criação de conta)
- ✅ Logout

## Configuração

### 1. Variáveis de Ambiente

Configure as variáveis de ambiente em `.env.local`:

```env
# PocketBase Configuration
PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/
PUBLIC_POCKETBASE_COLLECTION=pacientes

# OAuth2 Configuration (optional)
PUBLIC_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id_here
PUBLIC_OAUTH_GITHUB_CLIENT_ID=your_github_client_id_here
PUBLIC_OAUTH_REDIRECT_URL=http://localhost:3000/api/oauth2-redirect
```

### 2. Configurar PocketBase

Você precisa configurar seu PocketBase com:

1. **Coleção `pacientes`** (ou a coleção que você especificou) com autenticação habilitada
2. **OAuth2 providers** (Google, GitHub, etc.) - configure em Admin UI do PocketBase
3. **Redirect URL** para OAuth2: `https://seu-dominio.com/api/oauth2-redirect`

## Uso

### Páginas Disponíveis

- `/login` - Página de login
- `/signup` - Página de criação de conta
- `/dashboard` - Painel do usuário (protegido)

### Componentes

#### LoginForm
Formulário de login com email e senha:

```astro
---
import LoginForm from '~/components/auth/LoginForm.astro';
---

<LoginForm />
```

#### OAuthLogin
Botões de login com OAuth2:

```astro
---
import OAuthLogin from '~/components/auth/OAuthLogin.astro';
---

<OAuthLogin />
```

#### UserMenu
Menu de usuário com informações e botão de logout:

```astro
---
import UserMenu from '~/components/auth/UserMenu.astro';

const user = Astro.cookies.get('pb_auth')?.value;
---

<UserMenu user={user} />
```

### Serviço de Autenticação (Client-side)

Para usar autenticação no lado do cliente:

```typescript
import { AuthService } from '~/lib/auth';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://gawiga-server.bonito-dace.ts.net/');
const authService = new AuthService(pb);

// Login com email e senha
const result = await authService.loginWithPassword('user@example.com', 'password');
if (result.success) {
  console.log('Usuário:', result.user);
}

// Login com OAuth2
const oauthResult = await authService.loginWithOAuth2('google');

// Verificar se está autenticado
if (authService.isAuthenticated()) {
  console.log('Token:', authService.getToken());
  console.log('Usuário:', authService.getCurrentUser());
}

// Logout
authService.logout();
```

### Endpoints de API

#### POST `/api/auth/login`
Realiza login com email e senha.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "record": {
    "id": "user_id",
    "email": "user@example.com",
    ...
  }
}
```

#### POST `/api/auth/logout`
Realiza logout e limpa o cookie de autenticação.

#### POST `/api/auth/signup`
Cria uma nova conta.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

#### GET `/api/auth/oauth/[provider]`
Inicia o fluxo de autenticação OAuth2.

**Parâmetros:**
- `provider`: Google, GitHub, ou qualquer outro provedor configurado no PocketBase

**Response:**
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### GET `/api/auth/oauth-callback`
Callback do OAuth2. Processa o código de autorização e estabelece a sessão.

#### GET `/api/auth/user`
Retorna informações do usuário autenticado.

## Proteção de Rotas

As seguintes rotas estão protegidas por middleware:

- `/dashboard`
- `/api/user`

Se um usuário não autenticado tentar acessar essas rotas, será redirecionado para `/login`.

Para adicionar mais rotas protegidas, edite `src/middleware.ts`:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/api/user',
  '/admin', // Adicionar novas rotas aqui
];
```

## Armazenamento de Dados

### Client-side
O token é armazenado em `localStorage` como:
```json
{
  "pb_auth": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "record": {...}
  }
}
```

### Server-side
O token é armazenado em um cookie HTTP-only seguro:
- `pb_auth`: Token JWT (HTTP-only, Secure, SameSite=Lax)

## Fluxos de Autenticação

### Email e Senha

```
1. Usuário acessa /login
2. Preenche email e senha
3. Cliente envia POST /api/auth/login
4. Servidor valida com PocketBase
5. Token armazenado em cookie HTTP-only
6. Redirecionado para /dashboard
```

### OAuth2

```
1. Usuário clica em "Login com Google"
2. Cliente solicita GET /api/auth/oauth/google
3. Servidor retorna redirect URL do Google
4. Usuário redirecionado para Google
5. Google redireciona para /api/auth/oauth-callback
6. Servidor valida código com PocketBase
7. Token armazenado em cookie HTTP-only
8. Redirecionado para /dashboard
```

## Configuração OAuth2 no PocketBase

1. Acesse Admin UI do PocketBase (http://seu-pocketbase:8090/)
2. Vá para Settings → OAuth2 providers
3. Configure Google:
   - **Client ID**: De Google Cloud Console
   - **Client Secret**: De Google Cloud Console
   - **Scopes**: email, profile
   - **Redirect URL**: https://seu-dominio.com/api/oauth2-redirect (qualificado)

4. Faça o mesmo para GitHub ou outros provedores

## Troubleshooting

### "OAuth2 provider not configured"
Certifique-se de que você configurou o provedor no Admin UI do PocketBase.

### Token inválido
O cookie de autenticação pode ter expirado. O usuário será redirecionado para `/login`.

### CORS errors
Certifique-se de que o POCKETBASE_URL está acessível e permite CORS para seu domínio.

## Segurança

- ✅ Tokens armazenados em cookies HTTP-only
- ✅ Cookies marcados como Secure (HTTPS)
- ✅ SameSite=Lax para proteção CSRF
- ✅ Validação de sessão on-server
- ✅ Proteção de rotas com middleware

## Próximos Passos

1. Revisar e configurar seu PocketBase
2. Adicionar variáveis de ambiente em `.env.local`
3. Configurar OAuth2 providers (opcional)
4. Testar os fluxos de autenticação
5. Customizar componentes conforme necessário
6. Deploy!
