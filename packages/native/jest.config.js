/** Unit tests for the pure data-driven domain layer (src/domain/**). No RN/jest-expo. */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/domain'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { isolatedModules: true, tsconfig: { module: 'CommonJS', esModuleInterop: true, skipLibCheck: true } },
    ],
  },
};
