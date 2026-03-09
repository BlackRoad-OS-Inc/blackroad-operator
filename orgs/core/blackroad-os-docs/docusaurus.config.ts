import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

const tailwindPlugin = async () => ({
  name: 'tailwindcss-plugin',
  configurePostCss(postcssOptions) {
    // Append TailwindCSS and autoprefixer.
    postcssOptions.plugins.push(require('tailwindcss'));
    postcssOptions.plugins.push(require('autoprefixer'));
    return postcssOptions;
  },
});

const config: Config = {
  title: 'BlackRoad OS Docs',
  tagline: 'AI-first operating system for 10,000+ virtual employees and one human orchestrator',
  url: 'https://blackroad.systems',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.svg',
  organizationName: 'blackroad-os',
  projectName: 'blackroad-os-docs',
  trailingSlash: false,
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  plugins: [tailwindPlugin],
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: 'https://github.com/blackroad-os/blackroad-os-docs/edit/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'openapi',
            spec: 'static/api/openapi.yaml',
            route: '/reference/openapi',
          },
        ],
        theme: {
          primaryColor: '#0f172a',
        },
      },
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'BlackRoad OS Docs',
      logo: {
        alt: 'BlackRoad OS',
        src: 'img/logo.svg',
      },
      items: [
        {type: 'doc', docId: 'getting-started/quick-start', label: 'Getting Started', position: 'left'},
        {type: 'doc', docId: 'platform-guides/core/platform-overview', label: 'Platform Guides', position: 'left'},
        {type: 'doc', docId: 'agent-catalog/agent-catalog-overview', label: 'Agent Catalog & Roles', position: 'left'},
        {type: 'doc', docId: 'packs/finance/finance-pack-overview', label: 'Packs', position: 'left'},
        {type: 'doc', docId: 'reference/cli-reference', label: 'Reference', position: 'left'},
        {type: 'doc', docId: 'governance-policy/regulatory-overview', label: 'Governance & Policy', position: 'left'},
        {href: 'https://github.com/blackroad-os/blackroad-os-web', label: 'Main Site', position: 'right'},
        {href: 'https://github.com/blackroad-os/blackroad-os-docs', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'BlackRoad OS',
          items: [
            {label: 'Docs Home', to: '/'},
            {label: 'Stack Map', to: '/platform/core/stack-map'},
            {label: 'Seasons Overview', to: '/platform/core/seasons'},
          ],
        },
        {
          title: 'Operate the OS',
          items: [
            {label: 'Prism Console', to: '/platform/prism-console/overview'},
            {label: 'Operator Runtime', to: '/platform/operator/runtime'},
            {label: 'Infra Guide', to: '/platform/operator/infra-guide'},
          ],
        },
        {
          title: 'Build & Reference',
          items: [
            {label: 'Core Primitives', to: '/platform/core/primitives'},
            {label: 'OpenAPI', to: '/reference/openapi'},
            {label: 'CLI', to: '/reference/cli'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} BlackRoad OS. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'forest'},
    },
    algolia: {
      appId: process.env.ALGOLIA_APP_ID || 'APP_ID',
      apiKey: process.env.ALGOLIA_API_KEY || 'API_KEY',
      indexName: 'blackroad-os-docs',
      contextualSearch: true,
      searchParameters: {
        optionalWords: ['agent', 'pack'],
      },
    },
  },
};

export default config;
