# Quick Start - Autenticação com PocketBase (Email/Senha)

## ⚡ Setup em 5 Minutos

### 1. Copiar Arquivo de Configuração

```bash
cp .env.example .env.local
```

### 2. Editar `.env.local`

```env
PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/
PUBLIC_POCKETBASE_COLLECTION=pacientes
```

### 3. Instalar Dependências (já feito)

```bash
npm install pocketbase
```

### 4. Testar Localmente

```bash
npm run dev
```

Acesse:

- 🔑 Login: http://localhost:4322/login
- 📝 Signup: http://localhost:4322/signup
- 📊 Dashboard: http://localhost:4322/dashboard

## 📁 Estrutura de Arquivos Criados

```
src/
  ├── lib/
  │   ├── auth.ts              # Serviço de autenticação
  │   └── pocketbase.ts        # Cliente PocketBase
  ├── components/auth/
  │   ├── LoginForm.astro      # Formulário de login (email/senha)
  │   └── UserMenu.astro       # Menu de usuário
  ├── pages/
  │   ├── login.astro          # Página de login
  │   ├── signup.astro         # Página de signup
  │   ├── dashboard.astro      # Dashboard (protegido)
  │   └── api/auth/
  │       ├── login.ts         # Endpoint POST /api/auth/login
  │       ├── signup.ts        # Endpoint POST /api/auth/signup
  │       ├── logout.ts        # Endpoint POST /api/auth/logout
  │       └── user.ts          # Endpoint GET /api/auth/user
  ├── middleware.ts            # Proteção de rotas
  ├── types/
  │   └── auth.d.ts            # Tipos TypeScript
  └── ...

.env.example                # Template de variáveis
AUTHENTICATION.md          # Documentação
EXAMPLES.md               # Exemplos de uso
```

## 🔧 Configuração PocketBase

1. Acesse o Admin UI: `https://gawiga-server.bonito-dace.ts.net/admin`
2. Crie ou configure a coleção `pacientes` com Auth habilitado
3. Qualquer usuário pode fazer login com email/senha

## 🚀 Fluxo de Autenticação

### Email + Senha

```
1. Usuário acessa /login
2. Preenche email e senha
3. Clica "Entrar"
4. POST para /api/auth/login
5. Servidor valida com PocketBase (authWithPassword)
6. Token armazenado em cookie HTTP-only
7. Redirecionado para /dashboard
```

## 📋 Rotas Disponíveis

| Rota                         | Tipo | Autenticação | Descrição                 |
| ---------------------------- | ---- | ------------ | ------------------------- |
| `/login`                     | GET  | Não          | Página de login           |
| `/signup`                    | GET  | Não          | Página de signup          |
| `/dashboard`                 | GET  | ✅ Requerida | Painel do usuário         |
| `/api/auth/login`            | POST | Não          | Autentica com email/senha |
| `/api/auth/signup`           | POST | Não          | Cria nova conta           |
| `/api/auth/logout`           | POST | ✅ Requerida | Faz logout                |
| `/api/auth/user`             | GET  | ✅ Requerida | Obtém dados do usuário    |
| `/api/auth/oauth/[provider]` | GET  | Não          | Inicia OAuth2             |
| `/api/auth/oauth-callback`   | GET  | Não          | Callback OAuth2           |

## 🔒 Proteção de Rotas

Rotas protegidas por middleware (redirecionam para `/login` se não autenticado):

- `/dashboard`
- `/api/user`

Para adicionar novas rotas, edite `src/middleware.ts`.

## 🛠️ Troubleshooting

### Erro: "Cannot find pocketbase"

```bash
npm install pocketbase
```

### Erro: "Public_POCKETBASE_URL not defined"

Certifique-se que `.env.local` tem:

```env
PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/
```

### Erro: "Collection not found"

Verifique se a coleção `pacientes` existe no PocketBase com Auth habilitado.

### Erros CORS

Configure CORS no seu servidor PocketBase para aceitar requisições do seu domínio.

## ✅ Checklist Pré-Deploy

- [ ] `.env.local` está configurado com URL correta do PocketBase
- [ ] Coleção `pacientes` existe com Auth habilitado
- [ ] OAuth2 providers configurados (se usando)
- [ ] `npm run build` executa sem erros
- [ ] Testou `/login` e `/signup` localmente
- [ ] Testou `/dashboard` (deve redirecionar se deslogado)
- [ ] Testou `/api/auth/logout`

## 📚 Documentação Completa

Veja [AUTHENTICATION.md](./AUTHENTICATION.md) para documentação detalhada.

## 💡 Próximos Passos

1. ✅ Setup concluído!
2. Customizar componentes conforme necessário
3. Adicionar mais campos de usuário se necessário
4. Configurar email de reset de senha (opcional)
5. Deploy!

## 🤝 Suporte

Para dúvidas sobre PocketBase:

- [Documentação PocketBase](https://pocketbase.io/docs/)
- [Exemplos PocketBase](https://pocketbase.io/docs/api-records/#auth-operations)

Para dúvidas sobre Astro:

- [Documentação Astro](https://docs.astro.build/)
- [Middleware Astro](https://docs.astro.build/en/guides/middleware/)
