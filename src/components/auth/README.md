# Componentes de Autenticação

Este diretório contém todos os componentes Astro necessários para autenticação com PocketBase.

## 📁 Estrutura

```
src/components/auth/
├── LoginForm.astro      # Formulário de login por email/senha
├── OAuthLogin.astro     # Botões de login OAuth2
├── UserMenu.astro       # Menu de usuário (exibe email + logout)
└── README.md           # Este arquivo
```

## 🔑 LoginForm.astro

Formulário de login com email e senha.

### Props

Nenhum prop obrigatório. Aceita `collectionName` opcional.

### Uso

```astro
---
import LoginForm from '~/components/auth/LoginForm.astro';
---

<LoginForm />
```

### Funcionalidades

- ✓ Validação de email
- ✓ Requisição segura via HTTPS
- ✓ Mensagens de erro
- ✓ Loading state
- ✓ Dark mode support

### Fluxo

1. Usuário preenche email e senha
2. Clica "Entrar"
3. Requisição POST para `/api/auth/login`
4. Token salvo em localStorage
5. Redirecionado para `/dashboard`

---

## 🌐 OAuthLogin.astro

Botões de login com OAuth2 (Google, GitHub e outros).

### Props

Nenhum prop obrigatório. Aceita `collectionName` opcional.

### Uso

```astro
---
import OAuthLogin from '~/components/auth/OAuthLogin.astro';
---

<OAuthLogin />
```

### Funcionalidades

- ✓ Google OAuth2
- ✓ GitHub OAuth2
- ✓ Fácil adicionar mais provedores
- ✓ Tratamento de erros
- ✓ Dark mode support

### Provedores Disponíveis

- Google (padrão)
- GitHub (padrão)
- Qualquer outro configurado no PocketBase

### Como Adicionar Novo Provedor

1. Edite `OAuthLogin.astro`
2. Adicione novo elemento `<button>`
3. Copie o padrão para Google/GitHub
4. Configure em PocketBase Admin

### Fluxo

1. Usuário clica "Login com Google"
2. Requisição para `/api/auth/oauth/google`
3. Redirecionado para Google
4. Autoriza acesso
5. Google redireciona para `/api/auth/oauth-callback`
6. Token salvo
7. Redirecionado para `/dashboard`

---

## 👤 UserMenu.astro

Menu de usuário mostrando email e botão de logout.

### Props

```typescript
interface Props {
  user?: any; // Objeto do usuário com email, user, etc
}
```

### Uso

```astro
---
import UserMenu from '~/components/auth/UserMenu.astro';

// Obter usuário do cookie
const authCookie = Astro.cookies.get('pb_auth');
let user = null;
if (authCookie) {
  const auth = JSON.parse(authCookie.value);
  user = auth.record;
}
---

<header>
  {user && <UserMenu user={user} />}
</header>
```

### Funcionalidades

- ✓ Exibe email do usuário
- ✓ Exibe name
- ✓ Botão de logout
- ✓ Limpeza de sessão
- ✓ Redirecionamento após logout

### Exemplo Integrado em Layout

```astro
---
// layouts/MainLayout.astro
import UserMenu from '~/components/auth/UserMenu.astro';

const authCookie = Astro.cookies.get('pb_auth');
let user = null;

if (authCookie) {
  try {
    const auth = JSON.parse(authCookie.value);
    user = auth.record;
  } catch (e) {
    // Cookie inválido
  }
}
---

<header>
  <nav>
    {
      user ? (
        <UserMenu user={user} />
      ) : (
        <div>
          <a href="/login">Login</a>
          <a href="/signup">Signup</a>
        </div>
      )
    }
  </nav>
</header>

<slot />
```

---

## 🎨 Customização

### Cores e Estilos

Todos os componentes usam **Tailwind CSS**. Para customizar:

**LoginForm.astro** - Procure por classes como:

- `bg-blue-600` - Botão primário
- `border-gray-300` - Bordas
- `text-gray-700` - Texto

**OAuthLogin.astro** - Classes similares aplicadas aos botões de OAuth

**UserMenu.astro** - Espaçamento e cores

### Exemplo de Customização

```astro
<!-- Mudar cor do botão de login --><!-- Antes: -->
<button class="w-full bg-blue-600 hover:bg-blue-700 ...">
  <!-- Depois: -->
  <button class="w-full bg-green-600 hover:bg-green-700 ..."></button></button
>
```

---

## 🔧 Integração Avançada

### Proteger Componente Atrás de Autenticação

```astro
---
const authCookie = Astro.cookies.get('pb_auth');
if (!authCookie) {
  return Astro.redirect('/login');
}
---

<!-- Conteúdo protegido -->
```

### Componente Condicional

```astro
---
import LoginForm from '~/components/auth/LoginForm.astro';
import UserMenu from '~/components/auth/UserMenu.astro';

const user = Astro.cookies.get('pb_auth')?.value;
---

{user ? <UserMenu user={JSON.parse(user).record} /> : <LoginForm />}
```

### Passar Dados Customizados

```astro
<!-- Antes -->
<LoginForm />

<!-- Depois (customizar nome da coleção) -->
<LoginForm collectionName="usuarios" />
```

---

## 📱 Dark Mode

Todos os componentes incluem suporte a dark mode usando `dark:` prefixo Tailwind:

```astro
<input
  class="bg-white dark:bg-gray-700
    text-gray-900 dark:text-white
    border-gray-300 dark:border-gray-600"
/>
```

O tema é alternado automaticamente com a preferência do sistema.

---

## ♿ Acessibilidade

### Implemented Features

- ✓ Labels semânticos para inputs
- ✓ `required` attribute
- ✓ IDs conectados a labels
- ✓ Placeholder descritivso
- ✓ Focus states
- ✓ Button type="submit"

### Como Melhorar

- [ ] Adicionar ARIA labels se necessário
- [ ] Testar com screen readers
- [ ] Adicionar validação visual

---

## 🧪 Testes

### Testar LoginForm Localmente

1. Para em `/login`
2. Preenche email: `test@example.com`
3. Preenche senha: `password123`
4. Clica "Entrar"
5. Verifica console para erros
6. Verifica se redirecionou para `/dashboard`

### Testar OAuthLogin

1. Para em `/login`
2. Clica "Login com Google"
3. Observa se redireciona corretamente
4. Verifica cookies após autorização

### Testar UserMenu

1. Para em `/dashboard` (após login)
2. Verifica se email aparece
3. Clica "Sair"
4. Verifica logout imediato
5. Verifica redirecionamento para `/`

---

## 🐛 Troubleshooting

| Problema           | Causa                    | Solução                                 |
| ------------------ | ------------------------ | --------------------------------------- |
| Botão não funciona | Script não carregado     | Verificar console para erros JS         |
| Erro 401 no login  | Credenciais inválidas    | Verificar PocketBase                    |
| OAuth não funciona | Redirect URL incorreta   | Verificar em PocketBase OAuth2 settings |
| Estilo quebrado    | Tailwind não processando | Rodar `npm run dev` novamente           |
| User não aparece   | Cookie expirado          | Fazer login novamente                   |

---

## 📚 Recursos

- [Documentação de Autenticação](../AUTHENTICATION.md)
- [Exemplos de Uso](../EXAMPLES.md)
- [Snippets Avançados](../ADVANCED_EXAMPLES.md)
- [PocketBase Docs](https://pocketbase.io/docs/)
- [Astro Components](https://docs.astro.build/en/basics/astro-components/)

---

## 📝 Notas

- Todos os componentes são **island components** no Astro
- Scripts rodam no cliente (browser), não no servidor
- Tokens são enviados em cookies HTTP-only (seguro)
- localStorage é sincronizado com cookies para redundância
- Dark mode segue preferência do sistema do usuário

---

## 🚀 Próximos Passos

1. Importar componentes nas sua páginas
2. Customizar estilos
3. Testar fluxos
4. Deploy!
