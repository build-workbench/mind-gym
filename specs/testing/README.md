# Testing Specifications

This directory contains BDD-style test case specifications for Mind Gym.

---

## Testing Strategy

| Type         | Location        | Purpose                          |
| ------------ | --------------- | -------------------------------- |
| Unit Tests   | `/__tests__/`   | Test individual functions/modules|
| E2E Tests    | Future          | Test complete user flows         |
| BDD Specs    | `/specs/testing/`| Define expected behavior        |

---

## Test Categories

### Module Tests

| Module           | Test File                     | Coverage Focus           |
| ---------------- | ----------------------------- | ------------------------ |
| `storage.js`     | `__tests__/storage.test.js`   | CRUD operations          |
| `stats.js`       | `__tests__/stats.test.js`     | Calculations             |
| `modes.js`       | `__tests__/modes.test.js`     | Game logic               |
| `import-export.js`| `__tests__/import-export.test.js`| Data normalization     |

### Integration Tests

| Feature          | Test Focus                    | Acceptance Criteria      |
| ---------------- | ----------------------------- | ------------------------ |
| Game Flow        | Start → Play → Win            | Complete game cycle      |
| Data Persistence | Save → Reload → Verify        | Data survives reload     |
| PWA Install      | Install → Launch → Offline    | Offline functionality    |

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest __tests__/helpers.test.js

# Run with coverage
npx jest --coverage

# Watch mode
npx jest --watch
```

---

## BDD Test Format

### Feature File Example

```gherkin
Feature: Classic Matching Mode

  Scenario: Player matches two cards
    Given a game is in progress
    And the player flips the first card
    When the player flips a matching second card
    Then both cards should remain face-up
    And the matched pairs count should increase

  Scenario: Player makes a mismatch
    Given a game is in progress
    And the player flips the first card
    When the player flips a non-matching second card
    Then both cards should flip back after delay
    And the move counter should increase
```

---

## Test Coverage Goals

| Category      | Target Coverage |
| ------------- | --------------- |
| Statements    | 80%             |
| Branches      | 75%             |
| Functions     | 90%             |
| Lines         | 80%             |

---

## Writing Tests

### Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **One assertion per test when possible**
4. **Mock external dependencies**
5. **Follow Spec acceptance criteria**

### Example Test

```javascript
describe('Star Rating', () => {
  test('returns 5 stars for perfect game', () => {
    const rating = getRating(30, 8, 'easy', 0, 5);
    expect(rating).toBe(5);
  });

  test('returns 1 star for poor performance', () => {
    const rating = getRating(120, 20, 'easy', 3, 1);
    expect(rating).toBe(1);
  });
});
```

---

## Related Specifications

- [Product Specifications](../product/) — Acceptance criteria source
- [Data Schema](../db/schema.md) — Test data structures
