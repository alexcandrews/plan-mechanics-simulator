module.exports = {
  // Coverage configuration
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx}',
    '!src/components/**/*.test.{js,jsx}',
    '!src/components/**/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Higher standards for critical business logic
    'src/components/hooks/useUnlockStrategies.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  
  // Module name mapping for absolute imports (if needed)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['react-app'] }]
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true
};