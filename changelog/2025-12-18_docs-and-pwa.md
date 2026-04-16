# v0.2.0 文档与 PWA 完善

**日期**: 2025-12-18

## 新增 (Added)

- 新增 `changelog/` 目录并开始记录变更
- 新增 `LICENSE`（MIT 许可证）
- 新增 `docs/` 文档骨架：
  - `docs/README.md` — 文档导航
  - `docs/architecture.md` — 架构概览
  - `docs/storage.md` — 存储模型
  - `docs/modes.md` — 训练模式说明
  - `docs/pwa.md` — PWA/离线策略
- 新增 PWA 图标资源 `assets/icon.svg`

## 变更 (Changed)

- 更新 `manifest.webmanifest`：补齐 `icons` 声明
- 更新 `sw.js`：预缓存列表加入 `assets/icon.svg`

## 修复 (Fixed)

- 修复 `sw.js` 在 activate 阶段误删运行时 CDN 缓存的问题（保留 `runtime-cdn-v1`），避免离线样式缓存被清理
- 修复 `index.html` 中 Tailwind CDN 与 `tailwind.config` 的执行顺序，避免 `tailwind` 未定义导致暗色 class 模式配置不生效

## 项目状态

PWA 功能完善，支持离线使用。文档骨架建立。
