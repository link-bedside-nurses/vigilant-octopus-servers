module.exports = {
  // Specify the test environment
  testEnvironment: "node",

  // Define the file patterns that Jest should use for tests
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",

  // Transform .ts and .tsx files using ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  // Add other extensions you need to be able to import (e.g., .js, .jsx)
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Enable module name mapping using moduleNameMapper
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Customize reporters for test output
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-results", // Directory to store test results
        outputName: "jest-results.xml", // Test results file name
      },
    ],
  ],
};
