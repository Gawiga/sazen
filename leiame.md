# para rodar

npm run astro dev

# sempre rodar antes de subir

npm run check
npm run fix
npx prettier --write .

# pastas

nginx/ # Configurações de servidor e proxy reverso
public/ # Arquivos estáticos (ícones, imagens, robos.txt)
src/
├── assets/ # Recursos processados (CSS global, fontes, imagens otimizadas)
├── components/ # Partes da interface (Botões, Modais, Tabelas)
├── contents/ # Arquivos de conteúdo (Markdown, coleções de texto)
├── data/ # Mock de dados e arquivos JSON estáticos
├── layouts/ # Estrutura base das páginas (Template comum)
├── lib/ # Instâncias de bibliotecas e helpers (pocketbase.ts, jwt.ts)
├── pages/
│ ├── api/ # Endpoints do lado do servidor / SSR (Backend)
│ └── pacientes.astro # Página principal de visualização (Frontend)
├── services/ # Camada de comunicação com a API e lógica de negócio
├── types/ # Interfaces e definições de tipos TypeScript
└── utils/ # Funções utilitárias puras (formatadores, validadores)
test/
├── e2e/ # Testes de fluxo de ponta a ponta (Playwright/Cypress)
└── unit/ # Testes de funções isoladas e componentes
vendor/ # Dependências de terceiros ou bibliotecas externas manuais
