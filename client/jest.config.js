export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '@/(.*)': '<rootDir>/src/$1'
    },
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        useESM: true,
      }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx']
  };
