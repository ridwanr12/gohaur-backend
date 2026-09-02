export default {
    testEnvironment: "node", // Use Node.js environment
    moduleFileExtensions: ["js", "json"],
    testMatch: ["**/tests/**/*.test.js"],
    verbose: true,
    transform: {}, // Disable Babel transforms
    transformIgnorePatterns: ["node_modules/(?!variables/.*)"],
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1"
    }
  };
  