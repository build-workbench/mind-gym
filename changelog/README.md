# Changelog

本目录记录 Mind Gym 项目的所有重要变更。文件按日期命名，遵循语义化版本控制。

## 版本历史

| 版本                                               | 日期       | 说明                        | 变更类型 |
| -------------------------------------------------- | ---------- | --------------------------- | -------- |
| [v1.6.0](./2026-04-16_workflow-enhancement.md)     | 2026-04-16 | GitHub Workflow 和 PWA 增强 | CI/CD    |
| [v1.5.0](./2026-04-16_changelog-system.md)         | 2026-04-16 | Changelog 体系完善          | 文档     |
| [v1.4.0](./2026-04-16_documentation-refactor.md)   | 2026-04-16 | 文档全面重构                | 文档     |
| [v1.3.0](./2026-04-16_code-formatting.md)          | 2026-04-16 | 代码格式化与依赖更新        | 维护     |
| [v1.2.1](./2026-07-15_code-optimization.md)        | 2026-07-15 | 代码优化与国际化完善        | 优化     |
| [v1.2.0](./2026-04-06_quality-and-hardening.md)    | 2026-04-06 | 质量与健壮性升级            | 功能     |
| [v1.1.0](./2026-03-10_workflow-standardization.md) | 2026-03-10 | Workflow 深度标准化         | CI/CD    |
| [v1.0.0](./2025-12-19_modular-refactor.md)         | 2025-12-19 | 核心模块化重构              | 重构     |
| [v0.2.0](./2025-12-18_docs-and-pwa.md)             | 2025-12-18 | 文档与 PWA 完善             | 功能     |
| [v0.1.0](./2025-02-13_project-infrastructure.md)   | 2025-02-13 | 项目基础设施初始化          | 初始化   |

## 变更类型说明

基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 格式：

| 类型 | 英文       | 说明           |
| ---- | ---------- | -------------- |
| 新增 | Added      | 新功能         |
| 变更 | Changed    | 现有功能的变更 |
| 弃用 | Deprecated | 即将移除的功能 |
| 移除 | Removed    | 已移除的功能   |
| 修复 | Fixed      | Bug 修复       |
| 安全 | Security   | 安全相关修复   |

## 文件命名规范

```
YYYY-MM-DD_short-title.md
```

**示例**：

- `2026-04-16_documentation-refactor.md`
- `2026-04-06_quality-and-hardening.md`

## 模板

每个变更日志应包含以下结构：

```markdown
# vX.Y.Z 标题

**日期**: YYYY-MM-DD

## 新增 (Added)

- ...

## 变更 (Changed)

- ...

## 修复 (Fixed)

- ...

## 验证 (Verified)

- `npm test`：通过

## 项目状态

简要描述当前项目状态。
```

## 版本号规则

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号 (MAJOR)**：不兼容的 API 变更
- **次版本号 (MINOR)**：向后兼容的功能新增
- **修订号 (PATCH)**：向后兼容的问题修复
