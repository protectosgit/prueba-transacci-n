const PaymentController = require('../../../../../src/adapters/driving/web/controllers/payment.controller');
const ProcessPaymentUseCase = require('../../../../../src/application/use-cases/ProcessPaymentUseCase');

describe('PaymentController', () => {
    let controller;
    let mockProcessPaymentUseCase;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Mock del caso de uso
        mockProcessPaymentUseCase = {
            execute: jest.fn()
        };

        // Mock de request y response
        mockReq = {
            body: {
                productId: 'prod_123',
                customerId: 'cust_123',
                amount: 100.00,
                paymentMethod: 'CREDIT_CARD',
                paymentToken: 'tok_123'
            }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Crear controlador
        controller = new PaymentController(mockProcessPaymentUseCase);
    });

    describe('processPayment', () => {
        test('debería procesar un pago exitosamente', async () => {
            // Arrange
            const mockPaymentResult = {
                success: true,
                transactionId: 'trans_123',
                message: 'Pago procesado exitosamente'
            };

            mockProcessPaymentUseCase.execute.mockResolvedValue(mockPaymentResult);

            // Act
            await controller.processPayment(mockReq, mockRes);

            // Assert
            expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockPaymentResult);
        });

        test('debería manejar error de validación', async () => {
            // Arrange
            const invalidReq = {
                body: {
                    ...mockReq.body,
                    amount: -100
                }
            };

            mockProcessPaymentUseCase.execute.mockRejectedValue(
                new Error('El monto debe ser mayor a 0')
            );

            // Act
            await controller.processPayment(invalidReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'El monto debe ser mayor a 0'
            });
        });

        test('debería manejar error de producto no encontrado', async () => {
            // Arrange
            mockProcessPaymentUseCase.execute.mockRejectedValue(
                new Error('Producto no encontrado')
            );

            // Act
            await controller.processPayment(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Producto no encontrado'
            });
        });

        test('debería manejar error de stock insuficiente', async () => {
            // Arrange
            mockProcessPaymentUseCase.execute.mockRejectedValue(
                new Error('Stock insuficiente')
            );

            // Act
            await controller.processPayment(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Stock insuficiente'
            });
        });

        test('debería manejar error del gateway de pago', async () => {
            // Arrange
            mockProcessPaymentUseCase.execute.mockRejectedValue(
                new Error('Error procesando el pago: Gateway error')
            );

            // Act
            await controller.processPayment(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(502);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Error procesando el pago: Gateway error'
            });
        });

        test('debería manejar error interno del servidor', async () => {
            // Arrange
            mockProcessPaymentUseCase.execute.mockRejectedValue(
                new Error('Error inesperado')
            );

            // Act
            await controller.processPayment(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Error interno del servidor'
            });
        });
    });
}); 