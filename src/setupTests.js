// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock console.warn to reduce noise in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Mock Date.now for consistent testing
export const mockCurrentDate = (dateString) => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, 'Date').mockImplementation((input) => {
    if (input) {
      return new Date(input);
    }
    return mockDate;
  });
  Date.now = jest.fn(() => mockDate.getTime());
  return mockDate;
};

// Restore Date after tests
export const restoreDate = () => {
  jest.restoreAllMocks();
};