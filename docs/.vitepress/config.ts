import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import { withMermaid } from 'vitepress-plugin-mermaid';
import llmstxt from 'vitepress-plugin-llms';

const rawBase = process.env.VITEPRESS_BASE;
const normalizedBase = rawBase?.trim().replace(/^\/+|\/+$/g, '');
const base = normalizedBase ? `/${normalizedBase}/` : '/';
const hasIndexPage = fs.existsSync(new URL('../index.md', import.meta.url));

export default withMermaid(
  defineConfig({
    base,
    title: 'Mind Gym Whitepaper',
    description: 'Architecture-first documentation for the Mind Gym memory training system.',
    cleanUrls: true,
    locales: {
      en: {
        label: 'English',
        lang: 'en-US',
        link: '/en/',
        title: 'Mind Gym Whitepaper',
        description: 'Architecture, academy, and project guide for Mind Gym.',
        themeConfig: {
          nav: [
            { text: 'Overview', link: '/en/overview/project-thesis', activeMatch: '/en/overview/' },
            { text: 'Academy', link: '/en/academy/learning-path', activeMatch: '/en/academy/' },
            {
              text: 'Architecture',
              link: '/en/architecture/system-overview',
              activeMatch: '/en/architecture/',
            },
            { text: 'Guides', link: '/en/guides/getting-started', activeMatch: '/en/guides/' },
            {
              text: 'Research',
              link: '/en/research/references-and-related-work',
              activeMatch: '/en/research/',
            },
            {
              text: 'Reference',
              link: '/en/reference/module-catalog',
              activeMatch: '/en/reference/',
            },
            { text: 'Live Demo', link: '/play/index.html' },
          ],
          sidebar: {
            '/en/overview/': [
              {
                text: 'Overview',
                items: [{ text: 'Project Thesis', link: '/en/overview/project-thesis' }],
              },
            ],
            '/en/academy/': [
              {
                text: 'Academy',
                items: [{ text: 'Learning Path', link: '/en/academy/learning-path' }],
              },
            ],
            '/en/architecture/': [
              {
                text: 'Architecture',
                items: [
                  { text: 'System Overview', link: '/en/architecture/system-overview' },
                  { text: 'State Architecture', link: '/en/architecture/state-architecture' },
                  {
                    text: 'PWA and Offline Strategy',
                    link: '/en/architecture/pwa-offline-strategy',
                  },
                ],
              },
            ],
            '/en/guides/': [
              {
                text: 'Guides',
                items: [{ text: 'Getting Started', link: '/en/guides/getting-started' }],
              },
            ],
            '/en/research/': [
              {
                text: 'Research',
                items: [
                  {
                    text: 'References and Related Work',
                    link: '/en/research/references-and-related-work',
                  },
                ],
              },
            ],
            '/en/reference/': [
              {
                text: 'Reference',
                items: [{ text: 'Module Catalog', link: '/en/reference/module-catalog' }],
              },
            ],
          },
        },
      },
      zh: {
        label: '简体中文',
        lang: 'zh-CN',
        link: '/zh/',
        title: 'Mind Gym 技术白皮书',
        description: 'Mind Gym 的架构、学院化导读与工程说明。',
        themeConfig: {
          nav: [
            { text: '导读', link: '/zh/overview/project-thesis', activeMatch: '/zh/overview/' },
            { text: '学院', link: '/zh/academy/learning-path', activeMatch: '/zh/academy/' },
            {
              text: '架构',
              link: '/zh/architecture/system-overview',
              activeMatch: '/zh/architecture/',
            },
            { text: '指南', link: '/zh/guides/getting-started', activeMatch: '/zh/guides/' },
            {
              text: '研究',
              link: '/zh/research/references-and-related-work',
              activeMatch: '/zh/research/',
            },
            { text: '参考', link: '/zh/reference/module-catalog', activeMatch: '/zh/reference/' },
            { text: '在线试玩', link: '/play/index.html' },
          ],
          sidebar: {
            '/zh/overview/': [
              {
                text: '导读',
                items: [{ text: '项目论纲', link: '/zh/overview/project-thesis' }],
              },
            ],
            '/zh/academy/': [
              {
                text: '学院',
                items: [{ text: '学习路径', link: '/zh/academy/learning-path' }],
              },
            ],
            '/zh/architecture/': [
              {
                text: '架构',
                items: [
                  { text: '系统总览', link: '/zh/architecture/system-overview' },
                  { text: '状态架构', link: '/zh/architecture/state-architecture' },
                  { text: 'PWA 与离线策略', link: '/zh/architecture/pwa-offline-strategy' },
                ],
              },
            ],
            '/zh/guides/': [
              {
                text: '指南',
                items: [{ text: '开始使用', link: '/zh/guides/getting-started' }],
              },
            ],
            '/zh/research/': [
              {
                text: '研究',
                items: [
                  {
                    text: '参考与相关工作',
                    link: '/zh/research/references-and-related-work',
                  },
                ],
              },
            ],
            '/zh/reference/': [
              {
                text: '参考',
                items: [{ text: '模块总览', link: '/zh/reference/module-catalog' }],
              },
            ],
          },
        },
      },
    },
    themeConfig: {
      outline: [2, 3],
      search: { provider: 'local' },
      socialLinks: [{ icon: 'github', link: 'https://github.com/LessUp/mind-gym' }],
    },
    vite: {
      plugins: hasIndexPage ? [llmstxt()] : [],
    },
  })
);
