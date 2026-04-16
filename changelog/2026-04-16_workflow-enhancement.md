# v1.6.0 GitHub Workflow 和 PWA 增强

**日期**: 2026-04-16

## 新增 (Added)

### GitHub Workflows

- 新增 `.github/workflows/dependency-review.yml` 依赖审查工作流
- 添加 Node.js 缓存优化
- 添加构建验证步骤
- 添加部署 URL 输出
- 添加覆盖率报告上传

### Issue Templates

- 新增 `.github/ISSUE_TEMPLATE/bug_report.md` Bug 报告模板
- 新增 `.github/ISSUE_TEMPLATE/feature_request.md` 功能请求模板
- 新增 `.github/ISSUE_TEMPLATE/documentation.md` 文档问题模板
- 新增 `.github/ISSUE_TEMPLATE/config.yml` 模板配置

### Service Worker

- 添加消息处理支持
- 添加后台同步准备
- 添加推送通知准备
- 优化缓存策略

## 变更 (Changed)

### pages.yml

- 添加超时限制 (build: 10min, deploy: 5min)
- 添加 dist 目录验证步骤
- 优化路径过滤配置
- 添加环境输入选项
- 添加缓存依赖步骤

### ci.yml

- 拆分为 lint、test、build 三个独立 job
- 添加 ci-passed 汇总 job 用于分支保护
- 添加 Node.js 版本矩阵缓存
- 添加构建验证步骤
- 添加覆盖率报告上传

### pr-title.yml

- 添加自动标签功能
- 扩展 scope 列表
- 优化错误提示信息

### manifest.webmanifest

- 添加 `orientation`、`lang`、`dir`、`categories` 字段
- 添加 `shortcuts` 快捷方式
- 优化 PWA 元数据

### pull_request_template.md

- 添加 emoji 图标
- 扩展变更类型和 scope 列表
- 添加破坏性变更检查
- 优化测试清单格式

## 验证 (Verified)

- `npm run lint`：通过
- `npm test`：33/33 测试通过
- `npm run prepare:deploy`：成功

## 项目状态

GitHub workflow 增强完成，支持更完善的 CI/CD 流程、依赖审查和 PWA 功能。
