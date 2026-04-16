# Release Note Template / 发布说明模板

Use this template when creating new release notes in `changelog/archive/`.

在 `changelog/archive/` 中创建新版本说明时使用此模板。

---

```markdown
# vX.Y.Z Title / 标题

**Release Date / 发布日期**: YYYY-MM-DD

---

## Overview / 概览

Brief description of this release in English.

中文简要描述此版本。

---

## Added / 新增

- Feature 1 / 功能 1
- Feature 2 / 功能 2

## Changed / 变更

- Change 1 / 变更 1
- Change 2 / 变更 2

## Deprecated / 弃用

- Deprecated feature / 已弃用功能

## Removed / 移除

- Removed feature / 已移除功能

## Fixed / 修复

| Issue / 问题 | Fix / 修复 |
|--------------|------------|
| Bug 1 | Description / 描述 |
| Bug 2 | Description / 描述 |

## Security / 安全

- Security fix / 安全修复

---

## Migration Notes / 迁移说明

Any breaking changes or migration steps required.

任何破坏性变更或需要的迁移步骤。

---

## Verified / 验证

- `npm test`: ✅ Passed / 通过 (X/X tests)
- `npm run lint`: ✅ Passed / 通过
- `npm run build:css`: ✅ Success / 成功
- `npm run prepare:deploy`: ✅ Success / 成功

---

## Contributors / 贡献者

- @username - Description of contribution
```
