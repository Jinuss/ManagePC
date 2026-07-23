module.exports = {
  projects: [
    {
      displayName: "renderer",
      testEnvironment: "jsdom",
      moduleFileExtensions: ["js", "vue"],
      transform: {
        "^.+\\.js$": "babel-jest",
        "^.+\\.vue$": "@vue/vue3-jest"
      },
      testMatch: ["**/*.test.js"],
      testPathIgnorePatterns: ["src/main"],
      setupFiles: ["./jest.setup.js"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/renderer/$1"
      }
    },
    {
      displayName: "main",
      testEnvironment: "node",
      moduleFileExtensions: ["js"],
      transform: {
        "^.+\\.js$": "babel-jest"
      },
      testMatch: ["**/*.test.js"],
      testPathIgnorePatterns: ["src/renderer"],
      moduleNameMapper: {
        "^@main/(.*)$": "<rootDir>/src/main/$1"
      }
    }
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text-summary"]
}
