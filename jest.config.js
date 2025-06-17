module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  // Configuración para trabajar con módulos ES
  transform: {},
  // Configuración para manejar variables de entorno en pruebas
  setupFiles: ['<rootDir>/__tests__/setup.js']
}; 