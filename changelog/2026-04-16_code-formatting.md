# v1.3.0 代码格式化与依赖更新

**日期**: 2026-04-16

## 变更 (Changed)

### 代码格式化

- 使用 Prettier 格式化 31 个文件
- 统一代码风格：单引号、尾随逗号、120 字符行宽、2 空格缩进

### 依赖更新

| 包名                       | 旧版本       | 新版本       | 说明                |
| -------------------------- | ------------ | ------------ | ------------------- |
| `caniuse-lite`             | 1.0.30001756 | 1.0.30001788 | 浏览器兼容性数据    |
| `baseline-browser-mapping` | 旧版         | 最新版       | Baseline 浏览器映射 |
| `jest-environment-jsdom`   | 29.7.0       | 30.3.0       | Jest jsdom 环境     |

## 修复 (Fixed)

- 修复 7 个 npm 安全漏洞（4 low, 1 moderate, 2 high）
- 升级 `jest-environment-jsdom` 解决 `@tootallnate/once` 漏洞

## 验证 (Verified)

- `npm test`：33/33 测试通过
- `npm run lint`：所有文件格式正确
- `npm run prepare:deploy`：构建成功

## 项目状态

代码风格统一，依赖更新，安全漏洞修复。
