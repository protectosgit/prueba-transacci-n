const ProcessPaymentUseCase = require('../../../src/application/use-cases/ProcessPaymentUseCase');
const CreatePaymentDTO = require('../../../src/application/dtos/CreatePaymentDTO');

describe('ProcessPaymentUseCase', () => {
    let useCase;
    let mockTransactionRepository;
    let mockProductRepository;
    let mockPaymentGateway;
    let mockPaymentData;

    beforeEach(() => {
        // Mock repositories and gateway
        mockTransactionRepository = {
            save: jest.fn(),
            update: jest.fn()
        };

        mockProductRepository = {
            findById: jest.fn(),
            update: jest.fn()
        };

        mockPaymentGateway = {
            processPayment: jest.fn()
        };

        // Create use case instance
        useCase = new ProcessPaymentUseCase(
            mockTransactionRepository,
            mockProductRepository,
            mockPaymentGateway
        );

        // Mock payment data
        mockPaymentData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123'
        };
    });

    describe('execute', () => {
        test('debería procesar un pago exitosamente', async () => {
            // Arrange
            const mockProduct = {
                id: 'prod_123',
                name: 'Test Product',
                price: 100.00,
                stock: 5,
                hasStock: jest.fn().mockReturnValue(true),
                updateStock: jest.fn()
            };

            const mockTransaction = {
                id: 'trans_123',
                status: 'PENDING'
            };

            const mockPaymentResult = {
                success: true,
                transactionId: 'wompi_123',
                status: 'COMPLETED',
                message: 'Payment processed successfully'
            };

            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockTransactionRepository.save.mockResolvedValue(mockTransaction);
            mockPaymentGateway.processPayment.mockResolvedValue(mockPaymentResult);

            // Act
            const result = await useCase.execute(mockPaymentData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.transactionId).toBe('trans_123');
            expect(mockProduct.updateStock).toHaveBeenCalled();
            expect(mockTransactionRepository.save).toHaveBeenCalled();
            expect(mockPaymentGateway.processPayment).toHaveBeenCalled();
            expect(mockTransactionRepository.update).toHaveBeenCalledWith({
                ...mockTransaction,
                status: 'COMPLETED'
            });
        });

        test('debería fallar si el producto no existe', async () => {
            // Arrange
            mockProductRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(mockPaymentData))
                .rejects
                .toThrow('Producto no encontrado');
        });

        test('debería fallar si no hay stock suficiente', async () => {
            // Arrange
            const mockProduct = {
                id: 'prod_123',
                name: 'Test Product',
                price: 100.00,
                stock: 0,
                hasStock: jest.fn().mockReturnValue(false)
            };

            mockProductRepository.findById.mockResolvedValue(mockProduct);

            // Act & Assert
            await expect(useCase.execute(mockPaymentData))
                .rejects
                .toThrow('Stock insuficiente');
        });

        test('debería manejar fallo en el pago', async () => {
            // Arrange
            const mockProduct = {
                id: 'prod_123',
                name: 'Test Product',
                price: 100.00,
                stock: 5,
                hasStock: jest.fn().mockReturnValue(true)
            };

            const mockTransaction = {
                id: 'trans_123',
                status: 'PENDING'
            };

            const mockPaymentResult = {
                success: false,
                status: 'FAILED',
                message: 'Payment declined'
            };

            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockTransactionRepository.save.mockResolvedValue(mockTransaction);
            mockPaymentGateway.processPayment.mockResolvedValue(mockPaymentResult);

            // Act
            const result = await useCase.execute(mockPaymentData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toBe('Payment declined');
            expect(mockTransactionRepository.update).toHaveBeenCalledWith({
                ...mockTransaction,
                status: 'FAILED'
            });
        });

        test('debería validar datos de pago', async () => {
            // Arrange
            const invalidPaymentData = {
                ...mockPaymentData,
                amount: -100
            };

            // Act & Assert
            await expect(useCase.execute(invalidPaymentData))
                .rejects
                .toThrow('El monto debe ser mayor a 0');
        });

        test('debería manejar errores del gateway de pago', async () => {
            // Arrange
            const mockProduct = {
                id: 'prod_123',
                name: 'Test Product',
                price: 100.00,
                stock: 5,
                hasStock: jest.fn().mockReturnValue(true)
            };

            const mockTransaction = {
                id: 'trans_123',
                status: 'PENDING'
            };

            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockTransactionRepository.save.mockResolvedValue(mockTransaction);
            mockPaymentGateway.processPayment.mockRejectedValue(new Error('Gateway error'));

            // Act & Assert
            await expect(useCase.execute(mockPaymentData))
                .rejects
                .toThrow('Error procesando el pago: Gateway error');

            expect(mockTransactionRepository.update).toHaveBeenCalledWith({
                ...mockTransaction,
                status: 'FAILED'
            });
        });
    });
}); 