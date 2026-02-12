# ✅ Checklist de Implementação - PocketBase Auth

## 🎯 Fase 1: Preparação (↓ 2-5 minutos)

- [x] **PocketBase instalado**
  - Versão: pocketbase
  - Local: `/home/gawiga/dev/sazen/node_modules/pocketbase`

- [x] **@astrojs/netlify instalado**
  - Versão: @astrojs/netlify
  - Adapter configurado em `astro.config.ts`

- [x] **Arquivos criados**
  - ✓ Serviços: `src/lib/auth.ts`, `src/lib/pocketbase.ts`
  - ✓ Componentes: `LoginForm.astro`, `OAuthLogin.astro`, `UserMenu.astro`
  - ✓ Páginas: `login.astro`, `signup.astro`, `dashboard.astro`
  - ✓ Endpoints: `/api/auth/login.ts`, `/api/auth/signup.ts`, `/api/auth/logout.ts`, `/api/auth/user.ts`, `/api/auth/oauth/[provider].ts`, `/api/auth/oauth-callback.ts`
  - ✓ Middleware: `src/middleware.ts`
  - ✓ Tipos: `src/types/auth.d.ts`

- [x] **Projeto compila sem erros**
  - ✓ `npm run build` executado com sucesso
  - ✓ Adapter Netlify configurado

---

## 🔧 Fase 2: Configuração do PocketBase (↓ 10-15 minutos)

### Seu servidor PocketBase:

**URL:** `https://gawiga-server.bonito-dace.ts.net/`

### Tarefas:

- [ ] **Acessar Admin UI do PocketBase**
  - URL: `https://gawiga-server.bonito-dace.ts.net/admin`
  - ⚠️ Alterar para seu endereço se diferentes
  - 📝 Login com suas credenciais

- [ ] **Criar/Verificar Coleção `pacientes`**
  - [ ] Coleção existe
  - [ ] Auth habilitado na coleção
  - [ ] Campos básicos: email, password
  - [ ] Test: Criar usuário de teste no admin

- [ ] **Configurar OAuth2 (Opcional)**

  **Google:**
  - [ ] Obter Client ID e Secret de [Google Cloud Console](https://console.cloud.google.com)
  - [ ] Em PocketBase Admin → Settings → OAuth2 providers → Add provider
  - [ ] Provider: Google
  - [ ] Client ID: [seu cliente ID]
  - [ ] Client Secret: [seu secret]
  - [ ] Scopes: `email profile`
  - [ ] Salvar

  **GitHub (Similar):**
  - [ ] Obter OAuth app em [GitHub Settings](https://github.com/settings/developers)
  - [ ] Adicionar provider em PocketBase
  - [ ] Configurar credenciais
  - [ ] Salvar

- [ ] **Configurar Redirect URLs**
  - [ ] LOCAL: `http://localhost:3000/api/auth/oauth-callback`
  - [ ] PRODUCTION: `https://seu-dominio.com/api/auth/oauth-callback`
  - 📝 Adicionar em cada provider OAuth2

---

## 📝 Fase 3: Configuração Local (↓ 5 minutos)

- [x] **`.env.local` criado**

  ```env
  PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/
  PUBLIC_POCKETBASE_COLLECTION=pacientes
  ```

- [ ] **Editar `.env.local` (se necessário)**
  - [ ] URL do PocketBase está correta
  - [ ] Nome da coleção está correto
  - [ ] (Optional) Adicionar credenciais OAuth2

- [x] **Projeto pronto para desenvolvimento**
  - ✓ Dependências instaladas
  - ✓ Archivos configurados
  - ✓ Build testado

---

## 🧪 Fase 4: Testes Locais (↓ 15-20 minutos)

### Iniciar servidor de desenvolvimento:

```bash
npm run dev
```

### Testes:

- [ ] **Acesso às páginas**
  - [ ] http://localhost:3000/login - Abre sem erros
  - [ ] http://localhost:3000/signup - Abre sem erros
  - [ ] http://localhost:3000/dashboard - Redireciona para /login ✓

- [ ] **Login com Email/Senha**
  - [ ] Formulário abre
  - [ ] Insere email e senha de teste
  - [ ] Clica "Entrar"
  - [ ] Valida com sucesso (ou erro apropriado)
  - [ ] Redirecionado para /dashboard

- [ ] **Navegação em /dashboard**
  - [ ] Página mostra informações do usuário
  - [ ] Menu com email visível
  - [ ] Botão "Sair" funciona
  - [ ] Logout redireciona para /

- [ ] **Criação de Conta (Signup)**
  - [ ] http://localhost:3000/signup - Abre
  - [ ] Preenche email novo
  - [ ] Preenche senha e confirma
  - [ ] Clica "Criar Conta"
  - [ ] Conta criada com sucesso
  - [ ] Auto-login e redirecionado para /dashboard

- [ ] **Protecção de Rota**
  - [ ] Logout do dashboard
  - [ ] Tenta acessar /dashboard direto
  - [ ] Redireciona automático para /login ✓

- [ ] **OAuth2 (se configurado)**
  - [ ] Botão "Login com Google" aparece
  - [ ] Clica no botão
  - [ ] Redireciona para Google
  - [ ] Autorizo acesso
  - [ ] Voltar para site
  - [ ] Login com sucesso (novo usuário criado automaticamente)

---

## 🚀 Fase 5: Deploy (↓ 10-15 minutos)

### Pré-requisitos:

```bash
# Verificar build final
npm run build

# Resultado esperado:
# ✓ Build completo sem erros
# ✓ Função SSR gerada pelo Netlify
```

### Opções de Deploy:

#### **Opção 1: Netlify via Git (Recomendado)**

- [ ] Adicionar arquivos ao git

  ```bash
  git add .
  git commit -m "feat: add PocketBase authentication"
  ```

- [ ] Push para repositório

  ```bash
  git push origin main
  ```

- [ ] No Netlify Dashboard
  - [ ] Deploy automático acionado
  - [ ] OU conectar repositório novo
  - [ ] Configurar variáveis de ambiente:
    - [ ] `PUBLIC_POCKETBASE_URL=https://gawiga-server.bonito-dace.ts.net/`
    - [ ] `PUBLIC_POCKETBASE_COLLECTION=pacientes`
  - [ ] Clique "Deploy Site"

- [ ] Após deploy
  - [ ] Acessa seu site https://seu-site.netlify.app
  - [ ] Verifica `/login` - funciona
  - [ ] Testa fluxos de autenticação

#### **Opção 2: Deploy Manual**

```bash
# Build
npm run build

# Copiar dist/ para seu servidor
# Configurar variáveis de ambiente
# Reiniciar aplicação
```

---

## ✨ Fase 6: Personalização (↓ Variável)

- [ ] **Customizar Componentes**
  - [ ] Editar cores em `LoginForm.astro`
  - [ ] Adicionar logo em `src/components/auth/`
  - [ ] Customizar mensagens de erro

- [ ] **Adicionar Funcionalidades**
  - [ ] Reset de senha
  - [ ] Verificação de email
  - [ ] Role de usuário (admin, user, etc.)
  - [ ] Campos adicionais de perfil

- [ ] **Melhorar UX**
  - [ ] Adicionar "Lembrar de mim"
  - [ ] Loading states
  - [ ] Toast notifications
  - [ ] Responsividade mobile

---

## 📚 Referências

- **Documentação Completa:** [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Exemplos de Código:** [EXAMPLES.md](./EXAMPLES.md)
- **Snippets Avançados:** [ADVANCED_EXAMPLES.md](./ADVANCED_EXAMPLES.md)
- **Início Rápido:** [QUICKSTART.md](./QUICKSTART.md)
- **PocketBase:** https://pocketbase.io/docs/
- **Astro:** https://docs.astro.build/

---

## 🐛 Troubleshooting Rápido

| Problema                  | Solução                                               |
| ------------------------- | ----------------------------------------------------- |
| Erro de módulo PocketBase | `npm install pocketbase`                              |
| Build falha com adapter   | Verificar `@astrojs/netlify` instalado                |
| Collection not found      | Criar coleção `pacientes` no PocketBase Admin         |
| CORS errors               | Configurar CORS no PocketBase para seu domínio        |
| OAuth não funciona        | Verificar Redirect URL em OAuth2 settings             |
| Token expirado            | Implementar refresh token (veja ADVANCED_EXAMPLES.md) |

---

## ✅ Status Atual

```
✅ FASE 1: PREPARAÇÃO (100%)
✅ FASE 2: CONFIGURAÇÃO POCKETBASE (0% - Precisa de ação manual)
⏳ FASE 3: CONFIGURAÇÃO LOCAL (100%)
⏳ FASE 4: TESTES LOCAIS (0% - Pronto para começar)
⏳ FASE 5: DEPLOY (0% - Após testes)
⏳ FASE 6: PERSONALIZAÇÃO (0% - Opcional)
```

---

## 🎉 Parabéns!

Você tem um **sistema de autenticação profissional** com PocketBase no Astro!

### Próximo Passo:

**→ Vá para [Fase 2](#-fase-2-configuração-do-pocketbase--10-15-minutos) e configure seu PocketBase**

---

### 💬 Dúvidas?

Consulte os documentos inclusos:

1. Problema técnico → [AUTHENTICATION.md](./AUTHENTICATION.md)
2. Exemplo de código → [EXAMPLES.md](./EXAMPLES.md)
3. Caso avançado → [ADVANCED_EXAMPLES.md](./ADVANCED_EXAMPLES.md)

🚀 Bom desenvolvimento!
