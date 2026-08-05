import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import llmstxt from 'vitepress-plugin-llms';

const rawBase = process.env.VITEPRESS_BASE;
const normalizedBase = rawBase?.trim().replace(/^\/+|\/+$/g, '');
const base = normalizedBase ? `/${normalizedBase}/` : '/';
const hasIndexPage = fs.existsSync(new URL('../index.md', import.meta.url));

export default defineConfig({
  base,
  title: 'Mind Gym 技术白皮书',
  description: 'Mind Gym 的架构、学院化导读与工程说明。',
  cleanUrls: false,
  lang: 'zh-CN',
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
    outline: [2, 3],
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/LessUp/mind-gym' }],
  },
  vite: {
    plugins: hasIndexPage ? [llmstxt()] : [],
  },
});
