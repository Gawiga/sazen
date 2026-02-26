import { getAsset, getPermalink } from "./utils/permalinks";

export const headerData = {
  links: [
    {
      text: "Dashboard",
      href: getPermalink("/dashboard"),
    },
    {
      text: "Gerenciamento",
      links: [
        {
          text: "Pacientes",
          href: getPermalink("/pacientes"), // URL corrigida conforme o módulo trabalhado
        },
        {
          text: "Sessões",
          href: getPermalink("/sessoes"), // URL corrigida conforme o módulo trabalhado
        },
      ],
    },
    {
      text: "Financeiro",
      links: [
        {
          text: "Relatórios",
          href: getPermalink("/relatorios"),
        },
        {
          text: "Faturamento Mensal",
          href: getPermalink("/relatorios-faturamento"),
        },
        {
          text: "Valores a Receber",
          href: getPermalink("/relatorios-valores-receber"),
        },
      ],
    },
  ],
  // actions: [
  //   {
  //     text: 'Sair',
  //     href: getPermalink('/logout-btn'), // Redireciona para login (o script de auth fará o resto)
  //     variant: 'primary'
  //   }
  // ],
};

export const footerData = {
  links: [
    {
      title: "Sistema",
      links: [
        { text: "Dashboard", href: getPermalink("/dashboard") },
        { text: "Pacientes", href: getPermalink("/pacientes") },
        { text: "Sessões", href: getPermalink("/sessoes") },
      ],
    },
    {
      title: "Suporte",
      links: [
        { text: "Relatórios", href: getPermalink("/relatorios") },
        {
          text: "Faturamento Mensal",
          href: getPermalink("/relatorios-faturamento"),
        },
        {
          text: "Valores a Receber",
          href: getPermalink("/relatorios-valores-receber"),
        },
        { text: "Termos de Uso", href: getPermalink("/terms") },
      ],
    },
  ],
  secondaryLinks: [{ text: "Privacidade", href: getPermalink("/privacy") }],
  socialLinks: [
    { ariaLabel: "Instagram", icon: "tabler:brand-instagram", href: "#" },
    { ariaLabel: "RSS", icon: "tabler:rss", href: getAsset("/rss.xml") },
    {
      ariaLabel: "Github",
      icon: "tabler:brand-github",
      href: "https://github.com/arthelokyo/astrowind",
    },
  ],
  footNote: `
    Sistema de Gestão Psicológica — Desenvolvido por <a class="text-blue-600 underline dark:text-muted" href="https://github.com/gawiga">gawiga</a>
  `,
};
