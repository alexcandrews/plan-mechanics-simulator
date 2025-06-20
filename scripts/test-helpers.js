#!/usr/bin/env node

const { execSync } = require('child_process');

const commands = {
  unit: 'npm test -- --testPathPattern="hooks|utils" --watchAll=false',
  integration: 'npm test -- --testPathPattern="integration" --watchAll=false',
  all: 'npm test -- --watchAll=false',
  watch: 'npm test',
  coverage: 'npm test -- --coverage --watchAll=false',
  'unlock-strategies': 'npm test -- --testNamePattern="useUnlockStrategies" --watchAll=false',
  communications: 'npm test -- --testNamePattern="Communication" --watchAll=false'
};

const command = process.argv[2] || 'all';

if (!commands[command]) {
  console.log('Available test commands:');
  Object.keys(commands).forEach(cmd => {
    console.log(`  node scripts/test-helpers.js ${cmd}`);
  });
  process.exit(1);
}

console.log(`Running: ${commands[command]}`);
try {
  execSync(commands[command], { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}