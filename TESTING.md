# Testing Guide

## Overview

This project uses Jest and React Testing Library for comprehensive testing coverage of the Plan Mechanics Simulator functionality.

## Testing Architecture

### Test Types

1. **Unit Tests** - Test individual functions and hooks in isolation
2. **Integration Tests** - Test component interactions and complex user workflows
3. **Utility Tests** - Test helper functions and constants

### Test Structure

```
src/
├── components/
│   ├── __tests__/           # Component tests
│   └── hooks/
│       └── __tests__/       # Hook tests
└── setupTests.js            # Test configuration
```

## Running Tests

### Basic Commands

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:all

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm run test:unlock     # Unlock strategy tests
npm run test:comms      # Communication tests
```

### Advanced Test Running

```bash
# Run tests matching a pattern
npm test -- --testNamePattern="unlock"

# Run tests in a specific file
npm test -- --testPathPattern="useUnlockStrategies"

# Run tests with coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/components/hooks/**"
```

## Test Coverage

### Coverage Thresholds

- **General code**: 70% minimum coverage (branches, functions, lines, statements)
- **Critical business logic** (useUnlockStrategies): 90% minimum coverage

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in:
- Terminal output (text format)
- `coverage/lcov-report/index.html` (HTML format)
- `coverage/lcov.info` (LCOV format)

## Key Test Files

### Core Business Logic Tests

1. **`useUnlockStrategies.test.js`**
   - Tests all four unlock strategies
   - Validates prerequisite completion logic
   - Tests manual state changes and cascading updates
   - Ensures completed milestones are protected

2. **`useMilestoneCommunications.test.js`**
   - Tests communication rule triggers
   - Validates optional milestone handling
   - Tests chapter vs session milestone rules

3. **`useCommunications.test.js`**
   - Tests communication state management
   - Validates adding and resetting communications

### Utility Tests

4. **`utils.test.js`**
   - Tests date formatting functions
   - Validates UI state helpers
   - Tests unlock strategy constants

### Integration Tests

5. **`PlanMechanicsSimulator.integration.test.js`**
   - Tests full user workflows
   - Validates component interactions
   - Tests strategy switching and milestone management

## Writing Tests

### Best Practices

1. **Descriptive Test Names**
   ```javascript
   it('should unlock milestone when prerequisites are completed', () => {
     // Test implementation
   });
   ```

2. **Arrange-Act-Assert Pattern**
   ```javascript
   it('should add new communication', () => {
     // Arrange
     const { result } = renderHook(() => useCommunications());
     const newComm = { id: 1, type: 'Test', date: new Date() };
     
     // Act
     act(() => {
       result.current.addCommunication(newComm);
     });
     
     // Assert
     expect(result.current.communications).toContain(newComm);
   });
   ```

3. **Isolation and Cleanup**
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

4. **Mock External Dependencies**
   ```javascript
   const mockOnStateChange = jest.fn();
   ```

### Testing Hooks

Use `@testing-library/react-hooks` for testing custom hooks:

```javascript
import { renderHook, act } from '@testing-library/react';
import { useUnlockStrategies } from '../useUnlockStrategies';

const { result } = renderHook(() => 
  useUnlockStrategies(milestones, setMilestones, currentDate, strategy, onStateChange)
);

act(() => {
  result.current.updateMilestoneStates(newDate);
});
```

### Testing Components

Use `@testing-library/react` for component testing:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

render(<MyComponent />);
await userEvent.click(screen.getByRole('button', { name: /add milestone/i }));
```

## Debugging Tests

### Common Issues

1. **Date Mocking**: Use the provided `mockCurrentDate` helper from setupTests.js
2. **Async Updates**: Use `waitFor` for async state changes
3. **User Events**: Use `userEvent` instead of `fireEvent` for realistic interactions

### Debug Commands

```bash
# Run tests with detailed output
npm test -- --verbose

# Run a single test file
npm test -- --testPathPattern="useUnlockStrategies"

# Debug specific test
npm test -- --testNamePattern="should unlock milestone" --verbose
```

## Test Data Helpers

### Creating Test Milestones

```javascript
const createMilestone = (id, name, optional = false, state = 'locked', startDate = null) => ({
  id,
  name,
  optional,
  state,
  startDate: startDate ? new Date(startDate) : null,
  type: 'milestone'
});
```

### Mock Communication Rules

```javascript
const defaultRules = {
  milestoneUnlocked: {
    enabled: true,
    days: 3,
    applyToChapters: true,
    applyToSessions: false,
    ignoreOptional: true,
    furthestOnly: true
  }
};
```

## Continuous Integration

Tests should be run in CI/CD pipeline:

```bash
# In CI environment
npm run test:all
npm run test:coverage
```

## Adding New Tests

When adding new functionality:

1. Write tests for the business logic first (TDD approach)
2. Ensure adequate coverage of edge cases
3. Add integration tests for user-facing features
4. Update this documentation if adding new test patterns

## Performance Testing

Monitor test performance:

```bash
# Run tests with timing information
npm test -- --verbose --passWithNoTests
```

Large test suites should complete within reasonable time limits (< 30 seconds for unit tests).