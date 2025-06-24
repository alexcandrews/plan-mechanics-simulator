# Prototype Collection

A collection of interactive prototypes and simulations for testing various concepts and mechanics.

## Available Prototypes

### Plan Mechanics Simulator
A comprehensive tool to visualize and test the unlocking and communication logic of guided plans.

**Features:**
- Multiple unlock strategies (completion-based, date-based, hybrid)
- Communication rules and scheduling simulation
- Comprehensive test suite with 120+ test cases
- Redirection logic for milestone navigation

**Access:** Navigate to `/plan-mechanics-simulator` or click from the home page

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Testing

The project includes comprehensive testing for the Plan Mechanics Simulator:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests for hooks and utilities
npm run test:integration   # Integration tests
npm run test:coverage      # Coverage report
```

### Building

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── HomePage/              # Landing page listing all prototypes
│   ├── PlanMechanicsSimulator.js  # Main simulator component
│   ├── hooks/                 # Reusable React hooks
│   ├── utils/                 # Utility functions
│   └── __tests__/             # Test files
├── App.js                     # Main app with routing
└── index.js                   # Entry point
```

## Adding New Prototypes

1. Create your prototype component in `src/components/`
2. Add a route in `App.js`
3. Update the prototypes array in `HomePage.js`
4. Include relevant tests and documentation

## Technology Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Styling
- **Jest + React Testing Library** - Testing
- **Create React App** - Build tooling

## Contributing

When adding new prototypes or features:
1. Follow the existing code style and patterns
2. Include comprehensive tests
3. Update documentation as needed
4. Test across different browsers and screen sizes