const CreatePaymentDTO = require('../../../src/application/dtos/CreatePaymentDTO');

describe('CreatePaymentDTO', () => {
    test('debería crear un DTO válido con todos los campos', () => {
        // Arrange
        const paymentData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123',
            customerEmail: 'test@example.com',
            customerPhone: '1234567890'
        };

        // Act
        const dto = new CreatePaymentDTO(paymentData);

        // Assert
        expect(dto.productId).toBe(paymentData.productId);
        expect(dto.customerId).toBe(paymentData.customerId);
        expect(dto.amount).toBe(paymentData.amount);
        expect(dto.paymentMethod).toBe(paymentData.paymentMethod);
        expect(dto.paymentToken).toBe(paymentData.paymentToken);
        expect(dto.customerEmail).toBe(paymentData.customerEmail);
        expect(dto.customerPhone).toBe(paymentData.customerPhone);
    });

    test('debería crear un DTO válido con campos mínimos requeridos', () => {
        // Arrange
        const paymentData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123'
        };

        // Act
        const dto = new CreatePaymentDTO(paymentData);

        // Assert
        expect(dto.productId).toBe(paymentData.productId);
        expect(dto.customerId).toBe(paymentData.customerId);
        expect(dto.amount).toBe(paymentData.amount);
        expect(dto.paymentMethod).toBe(paymentData.paymentMethod);
        expect(dto.paymentToken).toBe(paymentData.paymentToken);
        expect(dto.customerEmail).toBeUndefined();
        expect(dto.customerPhone).toBeUndefined();
    });

    test('debería validar campos requeridos', () => {
        // Arrange
        const invalidData = {
            customerId: 'cust_123',
            amount: 100.00
        };

        // Act & Assert
        expect(() => new CreatePaymentDTO(invalidData))
            .toThrow('Datos de pago inválidos');
    });

    test('debería validar el monto mínimo', () => {
        // Arrange
        const invalidData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: -100,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123'
        };

        // Act & Assert
        expect(() => new CreatePaymentDTO(invalidData))
            .toThrow('El monto debe ser mayor a 0');
    });

    test('debería validar el método de pago', () => {
        // Arrange
        const invalidData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'INVALID_METHOD',
            paymentToken: 'tok_123'
        };

        // Act & Assert
        expect(() => new CreatePaymentDTO(invalidData))
            .toThrow('Método de pago inválido');
    });

    test('debería validar el formato del email cuando se proporciona', () => {
        // Arrange
        const invalidData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123',
            customerEmail: 'invalid-email'
        };

        // Act & Assert
        expect(() => new CreatePaymentDTO(invalidData))
            .toThrow('Email inválido');
    });

    test('debería validar el formato del teléfono cuando se proporciona', () => {
        // Arrange
        const invalidData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123',
            customerPhone: '123'
        };

        // Act & Assert
        expect(() => new CreatePaymentDTO(invalidData))
            .toThrow('Teléfono inválido');
    });

    test('debería convertir a JSON correctamente', () => {
        // Arrange
        const paymentData = {
            productId: 'prod_123',
            customerId: 'cust_123',
            amount: 100.00,
            paymentMethod: 'CREDIT_CARD',
            paymentToken: 'tok_123',
            customerEmail: 'test@example.com',
            customerPhone: '1234567890'
        };
        const dto = new CreatePaymentDTO(paymentData);

        // Act
        const json = dto.toJSON();

        // Assert
        expect(json).toEqual(paymentData);
    });
}); 