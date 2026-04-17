# 文档中心

欢迎来到 Mind Gym 文档中心。本目录包含用户指南、教程和技术参考。

[English](./README.md) | 简体中文

---

## 快速链接

| 文档                                | 说明                  | 目标读者    |
| ----------------------------------- | --------------------- | ----------- |
| [架构概览](./architecture.zh-CN.md) | 系统设计与数据流      | 开发者      |
| [训练模式](./modes.zh-CN.md)        | 游戏模式与机制        | 用户、开发者|
| [存储模型](./storage.zh-CN.md)      | 数据结构与持久化      | 开发者      |
| [PWA 与离线](./pwa.zh-CN.md)        | Service Worker 与离线 | 开发者      |

---

## 开发者指南

### 入门指引

- 初次接触代码库？→ [架构总览](./architecture.zh-CN.md#系统架构图)
- 想了解数据流向？→ [数据流](./architecture.zh-CN.md#数据流)
- 需要存储细节？→ [存储模型](./storage.zh-CN.md)

### 贡献指南

- 添加新游戏模式？→ [扩展游戏模式](./modes.zh-CN.md#扩展指南)
- 修改存储逻辑？→ [数据迁移](./storage.zh-CN.md#数据迁移)
- PWA 相关变更？→ [PWA 策略](./pwa.zh-CN.md)

### 规范文档

详细的产品规范和技术 RFC 请参阅 [/specs](../specs/) 目录：

- [产品规范](../specs/product/) — 功能定义与验收标准
- [技术 RFC](../specs/rfc/) — 架构决策与设计文档
- [数据库 Schema](../specs/db/) — 数据模型定义

---

## 用户指南

### 游戏模式

| 模式            | 说明                         |
| --------------- | ---------------------------- |
| **经典配对**    | 翻牌配对，记录时间和步数     |
| **限时模式**    | 可配置倒计时挑战             |
| **每日挑战**    | 全球玩家同一牌组             |
| **N-back 训练** | 工作记忆训练                 |
| **回忆测验**    | 通关后的再认测验             |

详细说明请参阅 [训练模式](./modes.zh-CN.md)。

### 安装

安装说明请参阅主 [README](../README.zh-CN.md)。

---

## 目录结构

```
docs/
├── README.md           # 本文件（英文）
├── README.zh-CN.md     # 本文件（中文）
├── architecture.md     # 架构文档（英文）
├── architecture.zh-CN.md
├── modes.md            # 训练模式文档（英文）
├── modes.zh-CN.md
├── storage.md          # 存储文档（英文）
├── storage.zh-CN.md
├── pwa.md              # PWA 文档（英文）
├── pwa.zh-CN.md
```

---

## 外部资源

- [贡献指南](../CONTRIBUTING.md)
- [更新日志](../changelog/CHANGELOG.md)
- [GitHub 仓库](https://github.com/LessUp/mind-gym)
- [在线体验](https://lessup.github.io/mind-gym/)

---

_最后更新: 2026-04-17_
