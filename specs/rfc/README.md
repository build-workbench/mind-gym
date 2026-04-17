# RFC Index

This directory contains Request for Comments (RFC) documents that define the technical design and architecture decisions for Mind Gym.

---

## What is an RFC?

RFCs are design documents that describe a new feature, architecture decision, or significant change to the project. They provide context, rationale, and implementation details before code is written.

---

## RFC List

| RFC                                        | Title                       | Status    |
| ------------------------------------------ | --------------------------- | --------- |
| [0001-core-architecture.md](./0001-core-architecture.md) | Core Architecture           | Accepted  |
| [0002-i18n-strategy.md](./0002-i18n-strategy.md) | Internationalization Strategy | Accepted |
| [0003-pwa-offline.md](./0003-pwa-offline.md) | PWA & Offline Strategy      | Accepted  |

---

## RFC Status Values

| Status    | Description                                    |
| --------- | ---------------------------------------------- |
| Draft     | Work in progress, not ready for review         |
| Review    | Ready for review and feedback                  |
| Accepted  | Approved and implemented                       |
| Rejected  | Not approved, documented for future reference  |
| Superseded| Replaced by a newer RFC                        |

---

## Creating a New RFC

1. Copy `0000-template.md` to `NNNN-short-title.md`
2. Fill in all sections
3. Set status to `Draft`
4. Submit for review

### RFC Naming Convention

- Number: Sequential, zero-padded (0001, 0002, ...)
- Title: Short, kebab-case description
- Example: `0004-es-modules-migration.md`

---

## RFC Template

```markdown
# RFC-NNNN: [Title]

| Status    | Draft        |
| --------- | ------------ |
| Created   | YYYY-MM-DD   |
| Updated   | YYYY-MM-DD   |

## Summary

[One paragraph summary of the proposal]

## Motivation

[Why is this change needed?]

## Detailed Design

[Technical details and implementation]

## Alternatives Considered

[Other approaches that were considered]

## Drawbacks

[Potential downsides]

## Unresolved Questions

[Things that need further discussion]

## References

[Links to related documents]
```

---

## RFC Workflow

```
Draft → Review → Accepted/Rejected
                    ↓
              Implementation
```

1. **Draft**: Author writes initial RFC
2. **Review**: Team reviews and provides feedback
3. **Decision**: Accept or Reject
4. **Implementation**: If accepted, implement according to RFC
5. **Update**: RFC marked as Implemented or Superseded
