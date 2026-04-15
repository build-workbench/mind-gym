# Mind Gym 文档

本目录包含项目架构、数据模型与训练模式的详细文档，便于维护、扩展与贡献。

## 📚 文档导航

| 文档                          | 说明                          |
| ----------------------------- | ----------------------------- |
| [架构概览](./architecture.md) | 系统设计、模块职责、数据流    |
| [训练模式](./modes.md)        | 各游戏模式的设计与实现        |
| [存储模型](./storage.md)      | localStorage 数据结构与持久化 |
| [PWA/离线](./pwa.md)          | Service Worker 缓存策略       |

## 🗺 快速导航

### 我想了解...

- **项目整体结构** → [架构概览](./architecture.md)
- **如何添加新训练模式** → [训练模式](./modes.md) + [架构概览](./architecture.md#架构改进方向)
- **localStorage 键名** → [存储模型](./storage.md#键名约定)
- **数据导入导出格式** → [存储模型](./storage.md#导入导出)
- **离线支持实现** → [PWA/离线](./pwa.md)

### 我想修改...

- **添加新成就** → `src/achievements.js` + `src/i18n.js`
- **修改评分算法** → `src/stats.js`
- **添加新卡面主题** → `src/pools.js` + `src/i18n.js`
- **调整缓存策略** → `sw.js` + [PWA/离线](./pwa.md)

## 📝 文档约定

- 文档以中文为主，必要时保留英文术语/变量名
- 代码示例使用 JavaScript
- 数据结构使用 TypeScript 风格的类型标注
- 涉及持久化的数据结构变更时，需同步更新：
  - `docs/storage.md`
  - `changelog/` 变更记录

## 🔗 相关资源

- [贡献指南](../CONTRIBUTING.md) — 开发流程与代码规范
- [变更日志](../changelog/) — 版本历史
- [CLAUDE.md](../CLAUDE.md) — AI 助手开发指南
