module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
<<<<<<< HEAD
  setupFilesAfterEnv: ['@testing-library/jest-native/setup', './jest.setup.js'],
=======
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/jest.config.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
  ],
<<<<<<< HEAD
};
=======
};
>>>>>>> de753cf41284fb4b94982221c497e4f25fc50062
