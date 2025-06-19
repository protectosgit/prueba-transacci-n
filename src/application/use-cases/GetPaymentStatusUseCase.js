const Result = require('../../utils/Result');

class GetPaymentStatusUseCase {
    constructor(transactionRepository, customerRepository, productRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    async execute(identifier) {
        try {
    

            // Intentar buscar por ID primero, luego por referencia
            let transaction = null;

            // Si es un número, buscar por ID
            if (!isNaN(identifier)) {
                transaction = await this.transactionRepository.findById(parseInt(identifier));
            }

            // Si no se encontró por ID o no es número, buscar por referencia
            if (!transaction) {
                transaction = await this.transactionRepository.findByReference(identifier);
            }

            if (!transaction) {
    
                return Result.fail('Transacción no encontrada');
            }

    

            // Obtener información adicional
            const customer = await this.customerRepository.getById(transaction.customerId);
            const product = await this.productRepository.findById(transaction.productId);

            // Preparar información básica del pago
            const paymentData = {
                id: transaction.id,
                reference: transaction.reference || identifier,
                amount: parseFloat(transaction.amount),
                status: transaction.status,
                paymentMethod: transaction.paymentMethod,
                paymentToken: transaction.paymentToken,
                wompiTransactionId: transaction.wompiTransactionId,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt,
                customer: customer ? {
                    id: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    documentType: customer.documentType,
                    documentNumber: customer.documentNumber
                } : null,
                product: product ? {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: parseFloat(product.price),
                    stock: product.stock
                } : null,
                // Devolver elementos del carrito si existen
                cartItems: transaction.cartItems || [],
                delivery: transaction.deliveryInfo || null,
                totalItems: transaction.cartItems ? transaction.cartItems.length : 1,
                metadata: {
                    hasMultipleProducts: transaction.cartItems && transaction.cartItems.length > 1,
                    hasDeliveryInfo: !!transaction.deliveryInfo,
                    dataSource: 'transaction_record'
                }
            };

            // Si hay información adicional en wompiResponse, intentar extraerla
            if (transaction.wompiResponse) {
                try {
                    const wompiData = JSON.parse(transaction.wompiResponse);
                    paymentData.metadata.wompiData = wompiData;
                } catch (e) {
                    console.warn('No se pudo parsear wompiResponse:', e);
                }
            }

    

            return Result.ok(paymentData);

        } catch (error) {
            console.error('Error en GetPaymentStatusUseCase:', error);
            return Result.fail(`Error consultando estado del pago: ${error.message}`);
        }
    }
}

module.exports = GetPaymentStatusUseCase; 