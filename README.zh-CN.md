<h1 align="center">
  🧠 Mind Gym
</h1>

<p align="center">
  <strong>浏览器端认知训练平台：自适应难度、N-back 训练、间隔重复</strong>
</p>

<p align="center">
  <em>零依赖 · PWA 离线可用 · 双语支持 · 开箱即玩</em>
</p>

<p align="center">
  <a href="https://github.com/LessUp/mind-gym/actions/workflows/ci.yml">
    <img src="https://github.com/LessUp/mind-gym/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/LessUp/mind-gym/actions/workflows/pages.yml">
    <img src="https://github.com/LessUp/mind-gym/actions/workflows/pages.yml/badge.svg" alt="Deploy">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA">
  </a>
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

<p align="center">
  <a href="https://lessup.github.io/mind-gym/">🎮 在线游玩</a> •
  <a href="#安装">📱 安装</a> •
  <a href="#文档">📖 文档</a> •
  <a href="#贡献">🤝 贡献</a>
</p>

---

## 🎯 为什么选择 Mind Gym？

| 特性             | 优势                                           |
| ---------------- | ---------------------------------------------- |
| **5 种训练模式** | 经典配对、限时挑战、每日挑战、N-back、延迟回忆 |
| **自适应 AI**    | 类 ELO 评分 (600-1600) 自动调整难度            |
| **零运行时依赖** | 原生 JS，无框架，极速加载                      |
| **离线 PWA**     | 一次安装，随处可玩                             |
| **科学依据**     | N-back 与间隔重复算法提升真实认知能力          |

---

## ✨ 功能特性

### 训练模式

| 模式            | 说明                                  | 认知目标           |
| --------------- | ------------------------------------- | ------------------ |
| **经典配对**    | 翻牌配对，支持 4×4、4×5、6×6 三种网格 | 视觉记忆、注意力   |
| **限时模式**    | 可配置倒计时，时间到自动判负          | 处理速度、压力管理 |
| **每日挑战**    | 全球玩家同一牌组，按日期生成种子      | 一致性、竞技性     |
| **N-back 训练** | 工作记忆训练，判断 N 步前是否相同     | 工作记忆、专注力   |
| **回忆测验**    | 通关后的再认测验                      | 长时记忆巩固       |

### 自适应智能

- **自适应难度** — 根据表现自动调整预览时间和提示次数（类 ELO 评分 600-1600）
- **间隔复现** — 使用衰减加权算法优先呈现易错卡面
- **连击系统** — 5 秒内连续配对累积连击奖励
- **星级评分** — 综合时间、步数、提示、连击评定表现

### 用户体验

| 功能              | 说明                              |
| ----------------- | --------------------------------- |
| 🌍 **完整国际化** | 支持中文/英文，自动检测浏览器语言 |
| 📲 **PWA 支持**   | 可安装，离线可用                  |
| ⌨️ **键盘快捷键** | 完整的键盘导航支持                |
| 📊 **统计面板**   | 追踪所有指标进度                  |
| 🏆 **成就系统**   | 解锁里程碑成就                    |
| 💾 **数据备份**   | 导出/导入所有进度为 JSON          |

---

## 🚀 快速开始

### 在线游玩

访问 **[https://lessup.github.io/mind-gym/](https://lessup.github.io/mind-gym/)** 立即在浏览器中开始游戏。

### 安装为 PWA

#### 桌面端

**Chrome/Edge:**

1. 访问网站
2. 点击地址栏的安装图标（➕）
3. 从桌面启动

#### 移动端

**iOS Safari:**

1. 点击分享 →「添加到主屏幕」

**Android Chrome:**

1. 点击菜单 →「添加到主屏幕」

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym

# 安装依赖
npm install

# 启动本地服务器
npx serve .
```

### 开发命令

| 命令                     | 用途                |
| ------------------------ | ------------------- |
| `npm test`               | 运行 Jest 单元测试  |
| `npm run lint`           | 检查代码格式        |
| `npm run format`         | 自动格式化所有文件  |
| `npm run build:css`      | 编译 Tailwind CSS   |
| `npm run prepare:deploy` | 构建 + 复制到 dist/ |

---

## 📁 项目结构

```
mind-gym/
├── specs/                # 规范驱动开发文档
│   ├── product/          # 产品功能规范
│   ├── rfc/              # 技术设计文档
│   ├── db/               # 数据模型定义
│   └── testing/          # 测试规范
├── docs/                 # 用户指南和教程
├── changelog/            # 版本历史
├── index.html            # 主入口（单页应用）
├── app.js                # 游戏编排器（状态机、模式）
├── sw.js                 # Service Worker（离线缓存）
├── manifest.webmanifest  # PWA 清单
├── src/                  # 模块化源码（UMD）
│   ├── storage.js        # localStorage CRUD
│   ├── stats.js          # 统计聚合
│   ├── achievements.js   # 成就逻辑
│   ├── modes.js          # N-back 和回忆逻辑
│   ├── i18n.js           # 国际化
│   ├── timer.js          # 计时器管理
│   └── ...               # 其他模块
├── __tests__/            # Jest 测试
└── assets/               # 图标、CSS、静态文件
```

---

## 🎮 键盘快捷键

| 按键              | 功能                         |
| ----------------- | ---------------------------- |
| `N`               | 新开一局                     |
| `P`               | 暂停 / 继续                  |
| `H`               | 使用提示                     |
| `J`               | N-back 匹配（N-back 模式下） |
| `↑↓←→`            | 导航卡牌                     |
| `Enter` / `Space` | 翻开选中卡牌                 |
| `Escape`          | 关闭弹窗                     |

---

## 🛠 技术栈

| 层级       | 技术                                    |
| ---------- | --------------------------------------- |
| **运行时** | 原生 JavaScript (ES2022) — 零运行时依赖 |
| **样式**   | Tailwind CSS 3.4（CLI 编译）            |
| **存储**   | localStorage 持久化                     |
| **测试**   | Jest 30 + jsdom                         |
| **CI/CD**  | GitHub Actions                          |
| **托管**   | GitHub Pages                            |

### 浏览器支持

| 浏览器  | 版本 | PWA 安装 |
| ------- | ---- | -------- |
| Chrome  | 90+  | ✅       |
| Firefox | 90+  | ✅       |
| Safari  | 14+  | ⚠️\*     |
| Edge    | 90+  | ✅       |

\* Safari：使用分享菜单中的「添加到主屏幕」

---

## 📊 数据存储

所有数据以 `memory_match_` 前缀存储在 `localStorage` 中：

| 键名                 | 数据                  |
| -------------------- | --------------------- |
| `_settings`          | 用户偏好设置          |
| `_best_<difficulty>` | 各难度最佳成绩        |
| `_lb_<difficulty>`   | 各难度排行榜          |
| `_stats`             | 累计统计数据          |
| `_achievements`      | 已解锁成就            |
| `_adaptive`          | 自适应评分 (600-1600) |

完整数据结构请参见 [docs/storage.md](docs/storage.zh-CN.md)。

---

## 📖 文档

### 用户文档

| 文档                            | 说明                  |
| ------------------------------- | --------------------- |
| [训练模式](docs/modes.zh-CN.md) | 模式规格与算法        |
| [PWA/离线](docs/pwa.zh-CN.md)   | Service Worker 与缓存 |

### 开发者文档

| 文档                                   | 说明               |
| -------------------------------------- | ------------------ |
| [架构概览](docs/architecture.zh-CN.md) | 系统设计与数据流   |
| [存储模型](docs/storage.zh-CN.md)      | 数据结构与持久化   |
| [产品规范](specs/product/)             | 功能定义与验收标准 |
| [技术 RFC](specs/rfc/)                 | 架构决策文档       |
| [数据库 Schema](specs/db/)             | 数据模型规范       |

---

## 🤝 贡献指南

欢迎贡献！请参见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细指南。

### 快速贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. **审查或创建相关的 Spec 文档**（在 `/specs/` 目录中）
4. 按代码规范进行修改
5. 运行测试 (`npm test`)
6. 提交清晰的提交信息
7. 推送并发起 Pull Request

---

## 📝 许可证

[MIT License](LICENSE) © LessUp

---

<p align="center">
  Made with ❤️ for cognitive health
</p>
