# 🧠 Mind Gym

> 零依赖的浏览器端认知训练 PWA：N-back、记忆配对，开箱即玩。

<p align="center">
  <a href="https://github.com/vibe-knight/mind-gym/actions/workflows/ci.yml">
    <img src="https://github.com/vibe-knight/mind-gym/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
</p>

## 训练模式

| 模式        | 说明                               | 认知目标           |
| ----------- | ---------------------------------- | ------------------ |
| 经典配对    | 翻牌配对，4×4 / 4×5 / 6×6 三种网格 | 视觉记忆、注意力   |
| 限时模式    | 可配置倒计时，时间到自动判负       | 处理速度、压力管理 |
| 每日挑战    | 全球玩家同一牌组，按日期生成种子   | 一致性、竞技性     |
| N-back 训练 | 工作记忆训练，判断 N 步前是否相同  | 工作记忆、专注力   |
| 回忆测验    | 通关后的再认测验                   | 长时记忆巩固       |

## 特性

| 亮点       | 具体表现                                             |
| ---------- | ---------------------------------------------------- |
| 自适应难度 | 类 ELO 评分（600–1600）逐局调整预览时间与提示次数    |
| 间隔复现   | 易错卡优先重现，FSRS 算法编排复习节奏                |
| 成就挑战   | 6 项成就：≤60 / 120 / 180 秒速通、无提示、零失误通关 |
| 完整统计   | 星级、连击、用时与步数全量记录，JSON 一键备份        |
| 极致轻量   | 零运行时依赖，离线可安装的 PWA，中英双语界面         |

## 快速开始

```bash
git clone https://github.com/vibe-knight/mind-gym.git
cd mind-gym
npm install
npm run dev      # http://localhost:3000
```

安装为 PWA：桌面端点击地址栏安装图标；移动端 Safari「添加到主屏幕」，Chrome 菜单「添加到主屏幕」。游戏内点击「指南」可查看全部快捷键。

| 命令                     | 用途                                 |
| ------------------------ | ------------------------------------ |
| `npm test`               | 运行 Jest 单元测试                   |
| `npm run lint`           | 格式与 lint 检查                     |
| `npm run build:css`      | 编译 Tailwind CSS                    |
| `npm run prepare:deploy` | 压缩 JS 并拷贝到 `dist/`（手动部署） |

## 技术栈

| 类别      | 方案                              |
| --------- | --------------------------------- |
| 运行时    | 原生 JavaScript (ES2022) — 零依赖 |
| 样式      | Tailwind CSS 3.4（CLI 编译）      |
| 测试 / CI | Jest + jsdom · GitHub Actions     |
