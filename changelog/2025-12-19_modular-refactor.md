# v1.0.0 核心模块化重构

**日期**: 2025-12-19

## 新增 (Added)

新增无构建模块（UMD 格式，浏览器/Node/Jest 兼容）：

| 模块      | 文件               | 职责                  |
| --------- | ------------------ | --------------------- |
| Keys      | `src/keys.js`      | localStorage 键名管理 |
| Utils     | `src/utils.js`     | 随机/洗牌等通用工具   |
| Storage   | `src/storage.js`   | localStorage 数据读写 |
| I18n      | `src/i18n.js`      | 语言判定与文案字典    |
| Effects   | `src/effects.js`   | 音效与震动交互效果    |
| Pools     | `src/pools.js`     | 卡面素材池管理        |
| Timer     | `src/timer.js`     | 计时/倒计时管理       |
| Confetti  | `src/confetti.js`  | 胜利彩带动画          |
| UI        | `src/ui.js`        | DOM 元素绑定          |
| UI Events | `src/ui-events.js` | UI 事件绑定           |

## 变更 (Changed)

### index.html

- 在加载 `app.js` 前加载所有 `src/` 模块

### app.js

- 接入 `RememberKeys` / `RememberUtils` / `RememberStorage` / `RememberI18n` / `RememberEffects` / `RememberPools` / `RememberTimer` / `RememberConfetti` / `RememberUIEvents` / `RememberUI`
- DOM 元素绑定与事件绑定逻辑改为调用模块实现

### src/storage.js

- 补齐每日挑战完成状态、引导隐藏状态
- 支持"清空本地数据"的 key 批量删除

### sw.js

- 预缓存列表加入所有 `src/` 模块

### scripts/prepare-deploy.sh

- 部署打包时复制 `src/` 目录到 `dist/`

## 验证 (Verified)

- `npm test`：通过

## 项目状态

完成核心模块化重构，代码结构清晰，便于测试和维护。标志着 v1.0.0 正式发布。
