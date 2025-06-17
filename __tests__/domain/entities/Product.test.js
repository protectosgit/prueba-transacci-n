const Product = require('../../../src/domain/entities/Product');

describe('Product Entity', () => {
    test('debería crear un producto válido', () => {
        // Arrange
        const productData = {
            id: 'prod_123',
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Act
        const product = new Product(productData);

        // Assert
        expect(product.id).toBe(productData.id);
        expect(product.name).toBe(productData.name);
        expect(product.description).toBe(productData.description);
        expect(product.price).toBe(productData.price);
        expect(product.stock).toBe(productData.stock);
        expect(product.createdAt).toBe(productData.createdAt);
        expect(product.updatedAt).toBe(productData.updatedAt);
    });

    test('debería validar el precio mínimo', () => {
        // Arrange
        const productData = {
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: -100.00,
            stock: 10
        };

        // Act & Assert
        expect(() => new Product(productData)).toThrow('El precio debe ser mayor a 0');
    });

    test('debería validar el stock mínimo', () => {
        // Arrange
        const productData = {
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: -1
        };

        // Act & Assert
        expect(() => new Product(productData)).toThrow('El stock no puede ser negativo');
    });

    test('debería requerir un nombre', () => {
        // Arrange
        const productData = {
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        };

        // Act & Assert
        expect(() => new Product(productData)).toThrow('El nombre es requerido');
    });

    test('debería validar la longitud máxima del nombre', () => {
        // Arrange
        const productData = {
            name: 'a'.repeat(101), // Nombre de 101 caracteres
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        };

        // Act & Assert
        expect(() => new Product(productData)).toThrow('El nombre no puede exceder los 100 caracteres');
    });

    test('debería validar la longitud máxima de la descripción', () => {
        // Arrange
        const productData = {
            name: 'Producto de prueba',
            description: 'a'.repeat(501), // Descripción de 501 caracteres
            price: 100.00,
            stock: 10
        };

        // Act & Assert
        expect(() => new Product(productData)).toThrow('La descripción no puede exceder los 500 caracteres');
    });

    test('debería permitir actualizar el stock', () => {
        // Arrange
        const product = new Product({
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        });

        // Act
        product.updateStock(5);

        // Assert
        expect(product.stock).toBe(5);
        expect(product.updatedAt).toBeDefined();
    });

    test('no debería permitir actualizar el stock a un valor negativo', () => {
        // Arrange
        const product = new Product({
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        });

        // Act & Assert
        expect(() => product.updateStock(-1)).toThrow('El stock no puede ser negativo');
    });

    test('debería verificar si hay stock suficiente', () => {
        // Arrange
        const product = new Product({
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        });

        // Act & Assert
        expect(product.hasStock(5)).toBe(true);
        expect(product.hasStock(11)).toBe(false);
    });

    test('debería calcular el precio total', () => {
        // Arrange
        const product = new Product({
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        });

        // Act
        const total = product.calculateTotal(2);

        // Assert
        expect(total).toBe(200.00);
    });

    test('debería validar la cantidad al calcular el precio total', () => {
        // Arrange
        const product = new Product({
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10
        });

        // Act & Assert
        expect(() => product.calculateTotal(-1)).toThrow('La cantidad debe ser mayor a 0');
    });

    test('debería generar una representación JSON válida', () => {
        // Arrange
        const productData = {
            id: 'prod_123',
            name: 'Producto de prueba',
            description: 'Descripción del producto',
            price: 100.00,
            stock: 10,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const product = new Product(productData);

        // Act
        const json = product.toJSON();

        // Assert
        expect(json).toEqual(productData);
    });
}); 