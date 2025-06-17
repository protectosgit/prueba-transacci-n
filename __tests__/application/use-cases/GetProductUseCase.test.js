const GetProductUseCase = require('../../../src/application/use-cases/GetProductUseCase');

describe('GetProductUseCase', () => {
    let useCase;
    let mockProductRepository;

    beforeEach(() => {
        // Mock repository
        mockProductRepository = {
            findById: jest.fn()
        };

        // Create use case instance
        useCase = new GetProductUseCase(mockProductRepository);
    });

    describe('execute', () => {
        test('debería obtener un producto exitosamente', async () => {
            // Arrange
            const mockProduct = {
                id: 'prod_123',
                name: 'Test Product',
                description: 'A test product',
                price: 100.00,
                stock: 10
            };

            mockProductRepository.findById.mockResolvedValue(mockProduct);

            // Act
            const result = await useCase.execute('prod_123');

            // Assert
            expect(result).toEqual(mockProduct);
            expect(mockProductRepository.findById).toHaveBeenCalledWith('prod_123');
        });

        test('debería manejar producto no encontrado', async () => {
            // Arrange
            mockProductRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute('non_existent'))
                .rejects
                .toThrow('Producto no encontrado');
        });

        test('debería validar ID de producto', async () => {
            // Act & Assert
            await expect(useCase.execute(''))
                .rejects
                .toThrow('ID de producto inválido');
        });

        test('debería manejar errores del repositorio', async () => {
            // Arrange
            mockProductRepository.findById.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(useCase.execute('prod_123'))
                .rejects
                .toThrow('Error al obtener el producto: Database error');
        });
    });
}); 