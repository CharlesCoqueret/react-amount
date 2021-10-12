const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts'],
};

export default jestConfig;
