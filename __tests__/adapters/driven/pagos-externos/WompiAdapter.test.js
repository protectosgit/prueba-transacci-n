const WompiAdapter = require('../../../../src/adapters/driven/pagos-externos/WompiAdapter');
const config = require('../../../../src/config');
const axios = require('axios');

jest.mock('axios');

describe('WompiAdapter', () => {
    let adapter;
    let mockPost;

    beforeEach(() => {
        // Limpiar mocks
        jest.clearAllMocks();

        // Mock de axios
        mockPost = jest.fn();
        axios.create = jest.fn().mockReturnValue({
            post: mockPost
        });

        // Crear adaptador
        adapter = new WompiAdapter(config.wompi);
    });

    describe('processPayment', () => {
        test('debería procesar un pago exitosamente', async () => {
            // Arrange
            const paymentData = {
                amount: 100.00,
                token: 'tok_123',
                transactionId: 'trans_123'
            };

            const mockWompiResponse = {
                data: {
                    data: {
                        id: 'wompi_123',
                        status: 'APPROVED',
                        amount_in_cents: 10000,
                        reference: 'trans_123'
                    }
                }
            };

            mockPost.mockResolvedValue(mockWompiResponse);

            // Act
            const result = await adapter.processPayment(paymentData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.transactionId).toBe('wompi_123');
            expect(result.status).toBe('COMPLETED');
            expect(mockPost).toHaveBeenCalledWith('/transactions', {
                amount_in_cents: 10000,
                currency: 'COP',
                payment_method: {
                    type: 'CARD',
                    token: 'tok_123'
                },
                reference: 'trans_123'
            });
        });

        test('debería manejar pago rechazado', async () => {
            // Arrange
            const paymentData = {
                amount: 100.00,
                token: 'tok_123',
                transactionId: 'trans_123'
            };

            const mockWompiResponse = {
                data: {
                    data: {
                        id: 'wompi_123',
                        status: 'DECLINED',
                        amount_in_cents: 10000,
                        reference: 'trans_123',
                        status_message: 'Fondos insuficientes'
                    }
                }
            };

            mockPost.mockResolvedValue(mockWompiResponse);

            // Act
            const result = await adapter.processPayment(paymentData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe('FAILED');
            expect(result.message).toBe('Fondos insuficientes');
        });

        test('debería manejar error de conexión', async () => {
            // Arrange
            const paymentData = {
                amount: 100.00,
                token: 'tok_123',
                transactionId: 'trans_123'
            };

            mockPost.mockRejectedValue(new Error('Network Error'));

            // Act & Assert
            await expect(adapter.processPayment(paymentData))
                .rejects
                .toThrow('Error al procesar el pago: Network Error');
        });

        test('debería manejar respuesta inválida', async () => {
            // Arrange
            const paymentData = {
                amount: 100.00,
                token: 'tok_123',
                transactionId: 'trans_123'
            };

            const mockWompiResponse = {
                data: {
                    error: {
                        type: 'invalid_request',
                        message: 'Token inválido'
                    }
                }
            };

            mockPost.mockResolvedValue(mockWompiResponse);

            // Act
            const result = await adapter.processPayment(paymentData);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe('FAILED');
            expect(result.message).toBe('Token inválido');
        });

        test('debería validar datos de entrada', async () => {
            // Arrange
            const invalidPaymentData = {
                amount: -100,
                token: '',
                transactionId: ''
            };

            // Act & Assert
            await expect(adapter.processPayment(invalidPaymentData))
                .rejects
                .toThrow('Datos de pago inválidos');
        });
    });
}); 