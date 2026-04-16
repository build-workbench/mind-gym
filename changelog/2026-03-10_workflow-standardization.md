# v1.1.0 Workflow 深度标准化

**日期**: 2026-03-10

## 变更 (Changed)

### GitHub Actions

| 变更项                | 说明                                |
| --------------------- | ----------------------------------- |
| Pages workflow 重命名 | `deploy.yml` → `pages.yml`          |
| CI workflow 权限统一  | `permissions: contents: read`       |
| 并发控制              | 添加 `concurrency` 配置防止重复构建 |
| Pages 配置步骤        | 补充 `actions/configure-pages@v5`   |
| 路径过滤              | 添加 `paths` 触发过滤，减少无效构建 |

## 背景

全仓库 GitHub Actions 深度标准化，统一命名、权限、并发、路径过滤与缓存策略。

## 项目状态

CI/CD 流程标准化，构建效率提升。
