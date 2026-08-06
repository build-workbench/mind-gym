# 🧠 Mind Gym

> 浏览器端认知训练 PWA：自适应难度、N-back 训练、间隔重复。零运行时依赖，开箱即玩。

<p align="center">
  <a href="https://github.com/LessUp/mind-gym/actions/workflows/ci.yml">
    <img src="https://github.com/LessUp/mind-gym/actions/workflows/ci.yml/badge.svg" alt="CI">
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

---

## 训练模式

| 模式        | 说明                               | 认知目标           |
| ----------- | ---------------------------------- | ------------------ |
| 经典配对    | 翻牌配对，4×4 / 4×5 / 6×6 三种网格 | 视觉记忆、注意力   |
| 限时模式    | 可配置倒计时，时间到自动判负       | 处理速度、压力管理 |
| 每日挑战    | 全球玩家同一牌组，按日期生成种子   | 一致性、竞技性     |
| N-back 训练 | 工作记忆训练，判断 N 步前是否相同  | 工作记忆、专注力   |
| 回忆测验    | 通关后的再认测验                   | 长时记忆巩固       |

## 特性

- **自适应难度** — 类 ELO 评分 (600-1600) 自动调整预览时间与提示次数
- **间隔复现** — 衰减加权算法优先呈现易错卡面
- **连击系统** — 5 秒内连续配对累积连击奖励
- **星级评分** — 综合时间、步数、提示、连击评定表现
- **中英双语** — 自动检测浏览器语言
- **PWA 离线** — 可安装，离线可用
- **键盘快捷键** — 完整键盘导航
- **统计与成就** — 追踪进度，解锁里程碑
- **数据备份** — 导出/导入所有进度为 JSON

---

## 快速开始

### 本地运行

```bash
git clone https://github.com/LessUp/mind-gym.git
cd mind-gym
npm install
npm run dev      # http://localhost:3000
```

### 安装为 PWA

访问站点后，桌面端点击地址栏安装图标；移动端 Safari 用「添加到主屏幕」，Chrome 用菜单「添加到主屏幕」。

### 常用命令

| 命令                     | 用途                                 |
| ------------------------ | ------------------------------------ |
| `npm test`               | 运行 Jest 单元测试                   |
| `npm run lint`           | Prettier 格式检查                    |
| `npm run format`         | 自动格式化                           |
| `npm run build:css`      | 编译 Tailwind CSS                    |
| `npm run prepare:deploy` | 压缩 JS + 拷贝到 `dist/`（手动部署） |

---

## 项目结构

```
mind-gym/
├── index.html             # 主入口（单页应用）
├── app.js                 # 游戏编排器（状态机、模式）
├── sw.js                  # Service Worker（离线缓存）
├── manifest.webmanifest   # PWA 清单
├── src/                   # 模块化源码（UMD 全局）
├── __tests__/             # Jest 测试
├── assets/                # 图标、CSS、静态文件
├── styles/                # Tailwind CSS 源文件
├── scripts/               # 构建与图标生成脚本
└── changelog/             # 版本历史
```

### 三层状态架构

```
Settings (持久)   → GameState (运行时) → ModeState (按需)
```

跨刷新保留 → Settings；只服务当前对局 → GameState；只属于某模式 → ModeState。

---

## 键盘快捷键

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

## 技术栈

| 层级   | 技术                                    |
| ------ | --------------------------------------- |
| 运行时 | 原生 JavaScript (ES2022) — 零运行时依赖 |
| 样式   | Tailwind CSS 3.4（CLI 编译）            |
| 存储   | localStorage 持久化                     |
| 测试   | Jest + jsdom                            |
| CI     | GitHub Actions                          |

所有数据以 `memory_match_` 前缀存储在 `localStorage` 中。

---

## 部署

手动部署：`npm run prepare:deploy` 生成 `dist/`（压缩 JS + 拷贝静态资源），可上传至任意静态托管。

---

## 许可证

[MIT License](LICENSE) © LessUp
