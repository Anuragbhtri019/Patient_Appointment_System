export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: false,
};
