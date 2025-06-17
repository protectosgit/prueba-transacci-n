jest.mock('../../../../src/infrastructure/database/connection', () => ({
    models: {
        Transaction: {
            create: jest.fn(),
            findByPk: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn()
        }
    }
}));

const TransactionRepository = require('../../../../src/adapters/driven/persistence/TransactionRepository');
const { models } = require('../../../../src/infrastructure/database/connection');

describe('TransactionRepository', () => {
    let repository;
    let mockModel;

    beforeEach(() => {
        // Mock del modelo
        mockModel = {
            create: jest.fn(),
            update: jest.fn(),
            findByPk: jest.fn(),
            findAll: jest.fn()
        };

        // Crear repositorio
        repository = new TransactionRepository(mockModel);
    });

    describe('save', () => {
        test('debería guardar una transacción exitosamente', async () => {
            // Arrange
            const transactionData = {
                customerId: 'cust_123',
                productId: 'prod_123',
                amount: 100.00,
                status: 'PENDING',
                paymentMethod: 'CREDIT_CARD',
                paymentToken: 'tok_123'
            };

            const mockCreatedTransaction = {
                id: 'trans_123',
                ...transactionData
            };

            mockModel.create.mockResolvedValue(mockCreatedTransaction);

            // Act
            const result = await repository.save(transactionData);

            // Assert
            expect(result).toEqual(mockCreatedTransaction);
            expect(mockModel.create).toHaveBeenCalledWith(transactionData);
        });

        test('debería manejar error al guardar', async () => {
            // Arrange
            const transactionData = {
                customerId: 'cust_123',
                productId: 'prod_123',
                amount: 100.00,
                status: 'PENDING',
                paymentMethod: 'CREDIT_CARD',
                paymentToken: 'tok_123'
            };

            mockModel.create.mockRejectedValue(new Error('Error de base de datos'));

            // Act & Assert
            await expect(repository.save(transactionData))
                .rejects
                .toThrow('Error al guardar la transacción: Error de base de datos');
        });
    });

    describe('update', () => {
        test('debería actualizar una transacción exitosamente', async () => {
            // Arrange
            const transactionData = {
                id: 'trans_123',
                status: 'COMPLETED'
            };

            mockModel.update.mockResolvedValue([1]);

            // Act
            const result = await repository.update(transactionData);

            // Assert
            expect(result).toEqual(transactionData);
            expect(mockModel.update).toHaveBeenCalledWith(
                transactionData,
                { where: { id: 'trans_123' } }
            );
        });

        test('debería manejar error al actualizar', async () => {
            // Arrange
            const transactionData = {
                id: 'trans_123',
                status: 'COMPLETED'
            };

            mockModel.update.mockRejectedValue(new Error('Error de base de datos'));

            // Act & Assert
            await expect(repository.update(transactionData))
                .rejects
                .toThrow('Error al actualizar la transacción: Error de base de datos');
        });
    });

    describe('findById', () => {
        test('debería encontrar una transacción por ID', async () => {
            // Arrange
            const transactionId = 'trans_123';
            const mockTransaction = {
                id: transactionId,
                customerId: 'cust_123',
                productId: 'prod_123',
                amount: 100.00,
                status: 'COMPLETED'
            };

            mockModel.findByPk.mockResolvedValue(mockTransaction);

            // Act
            const result = await repository.findById(transactionId);

            // Assert
            expect(result).toEqual(mockTransaction);
            expect(mockModel.findByPk).toHaveBeenCalledWith(transactionId);
        });

        test('debería retornar null si no encuentra la transacción', async () => {
            // Arrange
            const transactionId = 'trans_123';
            mockModel.findByPk.mockResolvedValue(null);

            // Act
            const result = await repository.findById(transactionId);

            // Assert
            expect(result).toBeNull();
            expect(mockModel.findByPk).toHaveBeenCalledWith(transactionId);
        });

        test('debería manejar error al buscar', async () => {
            // Arrange
            const transactionId = 'trans_123';
            mockModel.findByPk.mockRejectedValue(new Error('Error de base de datos'));

            // Act & Assert
            await expect(repository.findById(transactionId))
                .rejects
                .toThrow('Error al buscar la transacción: Error de base de datos');
        });
    });

    describe('findByCustomerId', () => {
        test('debería encontrar transacciones por ID de cliente', async () => {
            // Arrange
            const customerId = 'cust_123';
            const mockTransactions = [
                {
                    id: 'trans_123',
                    customerId: customerId,
                    amount: 100.00,
                    status: 'COMPLETED'
                },
                {
                    id: 'trans_124',
                    customerId: customerId,
                    amount: 200.00,
                    status: 'PENDING'
                }
            ];

            mockModel.findAll.mockResolvedValue(mockTransactions);

            // Act
            const result = await repository.findByCustomerId(customerId);

            // Assert
            expect(result).toEqual(mockTransactions);
            expect(mockModel.findAll).toHaveBeenCalledWith({
                where: { customerId }
            });
        });

        test('debería retornar array vacío si no encuentra transacciones', async () => {
            // Arrange
            const customerId = 'cust_123';
            mockModel.findAll.mockResolvedValue([]);

            // Act
            const result = await repository.findByCustomerId(customerId);

            // Assert
            expect(result).toEqual([]);
            expect(mockModel.findAll).toHaveBeenCalledWith({
                where: { customerId }
            });
        });

        test('debería manejar error al buscar por cliente', async () => {
            // Arrange
            const customerId = 'cust_123';
            mockModel.findAll.mockRejectedValue(new Error('Error de base de datos'));

            // Act & Assert
            await expect(repository.findByCustomerId(customerId))
                .rejects
                .toThrow('Error al buscar transacciones del cliente: Error de base de datos');
        });
    });
}); 