const config = require('../../src/config');

describe('Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = {
            NODE_ENV: 'test'
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('debería cargar la configuración por defecto', () => {
        // Act
        const configuration = require('../../src/config');

        // Assert
        expect(configuration.nodeEnv).toBe('test');
        expect(configuration.port).toBe(3000);
        expect(configuration.database.host).toBe('localhost');
        expect(configuration.database.port).toBe(5432);
        expect(configuration.database.name).toBe('pasarela_test');
        expect(configuration.database.user).toBe('postgres');
        expect(configuration.database.password).toBe('postgres');
        expect(configuration.database.dialect).toBe('postgres');
        expect(configuration.wompi.publicKey).toBe('pub_test_key');
        expect(configuration.wompi.privateKey).toBe('priv_test_key');
        expect(configuration.wompi.eventsKey).toBe('events_test_key');
    });

    test('debería usar variables de entorno cuando están disponibles', () => {
        // Arrange
        process.env = {
            NODE_ENV: 'test',
            PORT: '4000',
            DB_HOST: 'test-host',
            DB_PORT: '5433',
            DB_NAME: 'test-db',
            DB_USER: 'test-user',
            DB_PASSWORD: 'test-pass',
            WOMPI_PUBLIC_KEY: 'test-pub-key',
            WOMPI_PRIVATE_KEY: 'test-priv-key',
            WOMPI_EVENTS_KEY: 'test-events-key'
        };

        // Act
        const configuration = require('../../src/config');

        // Assert
        expect(configuration.nodeEnv).toBe('test');
        expect(configuration.port).toBe(4000);
        expect(configuration.database.host).toBe('test-host');
        expect(configuration.database.port).toBe(5433);
        expect(configuration.database.name).toBe('test-db');
        expect(configuration.database.user).toBe('test-user');
        expect(configuration.database.password).toBe('test-pass');
        expect(configuration.database.dialect).toBe('postgres');
        expect(configuration.wompi.publicKey).toBe('test-pub-key');
        expect(configuration.wompi.privateKey).toBe('test-priv-key');
        expect(configuration.wompi.eventsKey).toBe('test-events-key');
    });

    test('debería manejar variables de entorno faltantes', () => {
        // Act
        const configuration = require('../../src/config');

        // Assert
        expect(configuration.nodeEnv).toBe('test');
        expect(configuration.port).toBe(3000);
        expect(configuration.database.host).toBe('localhost');
        expect(configuration.database.port).toBe(5432);
        expect(configuration.database.name).toBe('pasarela_test');
        expect(configuration.database.user).toBe('postgres');
        expect(configuration.database.password).toBe('postgres');
        expect(configuration.database.dialect).toBe('postgres');
        expect(configuration.wompi.publicKey).toBe('pub_test_key');
        expect(configuration.wompi.privateKey).toBe('priv_test_key');
        expect(configuration.wompi.eventsKey).toBe('events_test_key');
    });

    test('debería validar tipos de datos en variables de entorno', () => {
        // Arrange
        process.env = {
            NODE_ENV: 'test',
            PORT: 'invalid',
            DB_PORT: 'invalid'
        };

        // Act
        const configuration = require('../../src/config');

        // Assert
        expect(configuration.nodeEnv).toBe('test');
        expect(configuration.port).toBe(3000);
        expect(configuration.database.port).toBe(5432);
    });
}); 