# Mind Gym

[![CI](https://github.com/LessUp/mind-gym/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/mind-gym/actions/workflows/ci.yml)
[![Deploy](https://github.com/LessUp/mind-gym/actions/workflows/pages.yml/badge.svg)](https://github.com/LessUp/mind-gym/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)

[English](README.md) | 简体中文

一款基于浏览器的记忆力训练游戏，结合认知科学原理与直观交互设计。提供经典配对、限时挑战、每日挑战、N-back 训练、回忆测验等多种训练模式。

## ✨ 功能特性

### 游戏模式

| 模式            | 说明                                           |
| --------------- | ---------------------------------------------- |
| **经典配对**    | 翻牌配对，支持三种难度（4×4、4×5、6×6）        |
| **限时模式**    | 可配置各难度的倒计时，时间到自动判负           |
| **每日挑战**    | 全球玩家同一牌组，按日期+难度+卡面生成固定种子 |
| **N-back 训练** | 工作记忆训练，判断当前刺激是否与 N 步前相同    |
| **回忆测验**    | 通关后进行再认测验，测试延迟回忆能力           |

### 自适应功能

- **自适应难度** — 根据玩家表现自动调整预览时间和提示次数
- **间隔复现** — 优先在后续局中呈现易错卡面
- **连击系统** — 5 秒内连续配对累积连击
- **星级评分** — 综合时间、步数、提示、连击评定表现

### 用户体验

- **完整国际化** — 支持中文/英文，自动检测浏览器语言
- **PWA 支持** — 可安装，支持离线运行
- **键盘快捷键** — 完整的键盘导航支持
- **统计面板** — 追踪局数、胜率、平均用时、回忆精确率、N-back 准确率
- **成就系统** — 解锁各种里程碑成就
- **数据备份** — 导出/导入所有进度为 JSON

## 🚀 快速开始

### 在线游玩

访问 [GitHub Pages](https://lessup.github.io/mind-gym/) 立即开始游戏。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym

# 安装开发依赖（用于测试和 CSS 构建）
npm install

# 启动本地服务器（任意静态服务器均可）
npx serve .
# 或直接在浏览器中打开 index.html
```

### 开发命令

```bash
npm test              # 运行 Jest 单元测试
npm run lint          # 使用 Prettier 检查代码格式
npm run format        # 自动格式化所有文件
npm run build:css     # 编译 Tailwind CSS → assets/app.css
npm run prepare:deploy  # 构建 CSS + 复制文件到 dist/
```

## 📁 项目结构

```
mind-gym/
├── index.html              # 主页面（单页应用）
├── app.js                  # 游戏编排器：状态机、模式、UI 协调
├── sw.js                   # Service Worker：离线缓存
├── manifest.webmanifest    # PWA 清单
│
├── src/                    # 模块化源文件（UMD 格式）
│   ├── keys.js             # localStorage 键名常量
│   ├── utils.js            # 洗牌、种子随机、HTML 转义
│   ├── storage.js          # localStorage CRUD 操作
│   ├── stats.js            # 统计追踪逻辑
│   ├── achievements.js     # 成就定义与检查
│   ├── modes.js            # N-back 和回忆模式逻辑
│   ├── import-export.js    # 备份/恢复数据规范化
│   ├── i18n.js             # 国际化词典
│   ├── effects.js          # 音效（Web Audio）与震动
│   ├── pools.js            # 卡面素材池
│   ├── timer.js            # 游戏计时器（正计时/倒计时）
│   ├── confetti.js         # 胜利动画（Canvas 2D）
│   ├── ui.js               # DOM 元素绑定
│   └── ui-events.js        # 事件监听注册
│
├── __tests__/              # Jest 单元测试
├── docs/                   # 架构与设计文档
├── changelog/              # 版本历史
├── scripts/                # 部署脚本
└── assets/                 # 图标、CSS、静态资源
```

## 🎮 键盘快捷键

| 按键              | 功能            |
| ----------------- | --------------- |
| `N`               | 新开一局        |
| `P`               | 暂停/继续       |
| `H`               | 使用提示        |
| `J`               | N-back 匹配响应 |
| `↑↓←→`            | 导航卡牌        |
| `Enter` / `Space` | 翻开选中卡牌    |
| `Escape`          | 关闭弹窗        |

## 🛠 技术栈

- **运行时**：原生 JavaScript (ES2022)，零运行时依赖
- **样式**：Tailwind CSS（CLI 编译，生产环境无 CDN）
- **存储**：localStorage 存储设置、统计、成就
- **测试**：Jest 30 + jsdom
- **CI/CD**：GitHub Actions (Node 22)
- **部署**：GitHub Pages

## 📊 数据存储

所有数据以 `memory_match_` 前缀存储在 `localStorage` 中：

| 键名                         | 说明                       |
| ---------------------------- | -------------------------- |
| `_settings`                  | 用户偏好设置               |
| `_best_<difficulty>`         | 各难度最佳成绩             |
| `_lb_<difficulty>`           | 各难度排行榜（前 3 名）    |
| `_achievements`              | 已解锁成就                 |
| `_stats`                     | 累计统计数据               |
| `_adaptive`                  | 自适应难度评分（600-1600） |
| `_spaced_<theme>`            | 间隔复现权重               |
| `_daily_<date>_<difficulty>` | 每日挑战完成状态           |

详见 [docs/storage.md](docs/storage.md)。

## 📖 文档

- [架构概览](docs/architecture.md) — 系统设计与数据流
- [训练模式](docs/modes.md) — 各模式详细说明
- [存储模型](docs/storage.md) — 数据结构与持久化
- [PWA/离线](docs/pwa.md) — Service Worker 缓存策略

## 🤝 贡献指南

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 许可证

[MIT License](LICENSE)
