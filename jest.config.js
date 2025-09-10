/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {},
};