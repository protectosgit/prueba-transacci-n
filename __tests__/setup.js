// Configuración de variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.PORT = 3001; // Puerto diferente para pruebas
process.env.DB_NAME = 'pasarela_test'; // Base de datos de pruebas

// Configuración global para Jest
jest.setTimeout(10000); // 10 segundos de timeout para las pruebas 