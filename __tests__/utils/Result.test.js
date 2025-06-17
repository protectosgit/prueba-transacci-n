const Result = require('../../src/utils/Result');

describe('Result', () => {
    test('debería crear un resultado exitoso', () => {
        // Arrange
        const value = { id: 1, name: 'Test' };

        // Act
        const result = Result.ok(value);

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(result.value).toEqual(value);
        expect(result.error).toBeNull();
    });

    test('debería crear un resultado fallido', () => {
        // Arrange
        const error = 'Error message';

        // Act
        const result = Result.fail(error);

        // Assert
        expect(result.isSuccess).toBe(false);
        expect(result.error).toBe(error);
        expect(result.value).toBeNull();
    });

    test('debería manejar valores nulos en resultado exitoso', () => {
        // Act
        const result = Result.ok(null);

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBeNull();
        expect(result.error).toBeNull();
    });

    test('debería manejar valores undefined en resultado exitoso', () => {
        // Act
        const result = Result.ok(undefined);

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBeUndefined();
        expect(result.error).toBeNull();
    });

    test('debería manejar errores nulos en resultado fallido', () => {
        // Act
        const result = Result.fail(null);

        // Assert
        expect(result.isSuccess).toBe(false);
        expect(result.error).toBeNull();
        expect(result.value).toBeNull();
    });

    test('debería manejar errores undefined en resultado fallido', () => {
        // Act
        const result = Result.fail(undefined);

        // Assert
        expect(result.isSuccess).toBe(false);
        expect(result.error).toBeUndefined();
        expect(result.value).toBeNull();
    });

    test('debería convertir a string un resultado exitoso', () => {
        // Arrange
        const value = { id: 1, name: 'Test' };
        const result = Result.ok(value);

        // Act
        const string = result.toString();

        // Assert
        expect(string).toBe('Success: {"id":1,"name":"Test"}');
    });

    test('debería convertir a string un resultado fallido', () => {
        // Arrange
        const error = 'Error message';
        const result = Result.fail(error);

        // Act
        const string = result.toString();

        // Assert
        expect(string).toBe('Error: Error message');
    });
}); 