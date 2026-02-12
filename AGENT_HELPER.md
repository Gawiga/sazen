# AGENT_HELPER

Este arquivo é usado pelo assistente (agent) para descrever mudanças realizadas e o estado atual da aplicação.

Estado atual (resumo):

- Endpoints de autenticação existentes em `src/pages/api/auth/*`:
  - `login.ts` (POST) — autentica com PocketBase e seta cookie `pb_auth`.
  - `logout.ts` (POST) — remove cookie `pb_auth`.
  - `user.ts` (GET) — retorna user se cookie existir.

- Novos endpoints adicionados (server-side) para separar chamadas do cliente:
  - `src/pages/api/pacientes/index.ts` — `GET` lista pacientes, `POST` cria paciente.
  - `src/pages/api/pacientes/[id].ts` — `GET` recupera, `PUT` atualiza, `DELETE` remove.
  - `src/pages/api/sessoes/index.ts` — `GET` lista sessões, `POST` cria sessão.
  - `src/pages/api/sessoes/[id].ts` — `GET` recupera, `PUT` atualiza, `DELETE` remove.
  - `src/pages/api/reports/index.ts` — `GET` retorna `faturamento_mensal` e `valores_receber`.

- Páginas do dashboard atualizadas para usar as APIs server-side:
  - `src/pages/dashboard/pacientes.astro` — CRUD via `/api/pacientes`.
  - `src/pages/dashboard/sessoes.astro` — CRUD via `/api/sessoes`.
  - `src/pages/dashboard/relatorios.astro` — visualização via `/api/reports`.

- Remoção de arquivos markdown do root (mantidos apenas `README.md` e `leiame.md`).

Como testar localmente:

1. Configure `PUBLIC_POCKETBASE_URL` no ambiente para apontar para seu PocketBase.
2. Inicie a aplicação:

```bash
npm install
npm run dev
```

3. Acesse `/login` e autentique com o usuário do PocketBase; exemplo informado: `rcmafei@gmail.com` / `mozao123`.
4. Navegue para `/dashboard` e use os links para `Pacientes`, `Sessões` e `Relatórios`.

Notas técnicas e próximos passos sugeridos:

- Recomendo adicionar validação de sessão server-side (verificação real do token com PocketBase) no endpoint `src/pages/api/auth/user.ts` para reforçar segurança.
- Posso substituir o campo `id_paciente` nas sessões por um `select` que consulta `/api/pacientes` e exibe nomes.
- Se desejar, posso implementar middleware que bloqueie rotas estáticas no nível do servidor.

Registro de mudanças: mantenha este arquivo atualizado com novos passos que o agente realizar.
