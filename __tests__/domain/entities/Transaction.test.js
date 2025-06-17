const Transaction = require('../../../src/domain/entities/Transaction');

describe('Transaction Entity', () => {
    test('debería crear una transacción válida', () => {
        // Arrange
        const transactionData = {
            id: 'trans_123',
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            customerId: 'cust_123',
            paymentMethod: {
                type: 'CARD',
                token: 'tok_test_12345'
            },
            customerInfo: {
                name: 'Juan Pérez',
                email: 'juan@example.com',
                phone: '1234567890'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Act
        const transaction = new Transaction(transactionData);

        // Assert
        expect(transaction.id).toBe(transactionData.id);
        expect(transaction.amount).toBe(transactionData.amount);
        expect(transaction.status).toBe(transactionData.status);
        expect(transaction.productId).toBe(transactionData.productId);
        expect(transaction.customerId).toBe(transactionData.customerId);
        expect(transaction.paymentMethod.type).toBe(transactionData.paymentMethod.type);
        expect(transaction.paymentMethod.token).toMatch(/^enc_/);
        expect(transaction.customerInfo).toEqual(transactionData.customerInfo);
        expect(transaction.createdAt).toBe(transactionData.createdAt);
        expect(transaction.updatedAt).toBe(transactionData.updatedAt);
    });

    test('debería validar el monto mínimo de la transacción', () => {
        // Arrange
        const transactionData = {
            amount: -100.00,
            status: 'PENDING',
            productId: 'prod_123'
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('El monto de la transacción debe ser mayor a 0');
    });

    test('debería validar el estado de la transacción', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'INVALID_STATUS',
            productId: 'prod_123'
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('Estado de transacción inválido');
    });

    test('debería requerir un productId', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'PENDING'
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('El productId es requerido');
    });

    test('debería validar el formato del token de pago', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            paymentMethod: {
                type: 'CARD',
                token: 'invalid_token'
            }
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('Token de pago inválido');
    });

    test('debería validar el email del cliente cuando se proporciona', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            customerInfo: {
                name: 'Juan Pérez',
                email: 'invalid-email',
                phone: '1234567890'
            }
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('Email inválido');
    });

    test('debería validar el número de teléfono del cliente cuando se proporciona', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            customerInfo: {
                name: 'Juan Pérez',
                email: 'juan@example.com',
                phone: '123'  // Muy corto
            }
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('Número de teléfono inválido');
    });

    test('debería permitir actualizar el estado de la transacción', () => {
        // Arrange
        const transaction = new Transaction({
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123'
        });

        // Act
        transaction.updateStatus('COMPLETED');

        // Assert
        expect(transaction.status).toBe('COMPLETED');
        expect(transaction.updatedAt).toBeDefined();
    });

    test('no debería permitir actualizar a un estado inválido', () => {
        // Arrange
        const transaction = new Transaction({
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123'
        });

        // Act & Assert
        expect(() => transaction.updateStatus('INVALID_STATUS')).toThrow('Estado de transacción inválido');
    });

    test('debería validar la estructura del método de pago', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            paymentMethod: {
                type: 'INVALID_TYPE',
                token: 'tok_test_12345'
            }
        };

        // Act & Assert
        expect(() => new Transaction(transactionData)).toThrow('Tipo de método de pago inválido');
    });

    test('debería mantener un historial de estados', () => {
        // Arrange
        const transaction = new Transaction({
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123'
        });

        // Act
        transaction.updateStatus('PROCESSING');
        transaction.updateStatus('COMPLETED');

        // Assert
        expect(transaction.statusHistory).toHaveLength(3); // PENDING, PROCESSING, COMPLETED
        expect(transaction.statusHistory[0].status).toBe('PENDING');
        expect(transaction.statusHistory[1].status).toBe('PROCESSING');
        expect(transaction.statusHistory[2].status).toBe('COMPLETED');
        expect(transaction.statusHistory[2].timestamp).toBeDefined();
    });

    test('debería encriptar información sensible', () => {
        // Arrange
        const transactionData = {
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            paymentMethod: {
                type: 'CARD',
                token: 'tok_test_12345',
                last4: '4242'
            }
        };

        // Act
        const transaction = new Transaction(transactionData);

        // Assert
        expect(transaction.paymentMethod.token).not.toBe('tok_test_12345');
        expect(transaction.paymentMethod.token).toMatch(/^enc_[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/);
        expect(transaction.paymentMethod.last4).toBe('4242'); // Los últimos 4 dígitos no se encriptan
    });

    test('debería prevenir la modificación directa de propiedades sensibles', () => {
        // Arrange
        const transaction = new Transaction({
            amount: 100.00,
            status: 'PENDING',
            productId: 'prod_123',
            paymentMethod: {
                type: 'CARD',
                token: 'tok_test_12345'
            }
        });

        // Act & Assert
        expect(() => {
            transaction.paymentMethod = { type: 'PSE', token: 'new_token' };
        }).toThrow(TypeError);
    });
}); 