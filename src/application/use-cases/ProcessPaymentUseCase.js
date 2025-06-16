const Result = require('../../utils/Result');
const Customer = require('../../domain/entities/Customer');
const Transaction = require('../../domain/entities/Transaction');
const Delivery = require('../../domain/entities/Delivery');
const InsufficientStockException = require('../../domain/exceptions/InsufficientStockException');

class ProcessPaymentUseCase {
    constructor(
        productRepository,
        customerRepository,
        transactionRepository,
        deliveryRepository,
        paymentGateway
    ) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.deliveryRepository = deliveryRepository;
        this.paymentGateway = paymentGateway;
        this.BASE_FEE = 1000; // $10.00
        this.DELIVERY_FEE = 5000; // $50.00
    }

    async execute(paymentDTO) {
        try {
            // 1. Obtener y verificar producto
            const product = await this.productRepository.getById(paymentDTO.productId);
            if (!product) {
                return Result.fail('Producto no encontrado');
            }
            if (product.stock < 1) {
                throw new InsufficientStockException();
            }

            // 2. Gestionar cliente
            let customer = await this.customerRepository.getByEmail(paymentDTO.customerInfo.email);
            if (!customer) {
                customer = new Customer(
                    paymentDTO.customerInfo.firstName,
                    paymentDTO.customerInfo.lastName,
                    paymentDTO.customerInfo.email,
                    paymentDTO.customerInfo.phone
                );
                await this.customerRepository.save(customer);
            }

            // 3. Crear transacción
            const transaction = new Transaction({
                productId: product.id,
                customerId: customer.id,
                deliveryInfo: paymentDTO.deliveryInfo,
                amount: product.price,
                baseFee: this.BASE_FEE,
                deliveryFee: this.DELIVERY_FEE
            });
            await this.transactionRepository.save(transaction);

            // 4. Crear registro de entrega
            const delivery = new Delivery({
                transactionId: transaction.id,
                ...paymentDTO.deliveryInfo
            });
            await this.deliveryRepository.save(delivery);

            try {
                // 5. Procesar pago con Wompi
                const paymentResult = await this.paymentGateway.processPayment({
                    amountInCents: Math.round(transaction.totalAmount * 100),
                    currency: 'COP',
                    cardToken: paymentDTO.cardToken,
                    customerEmail: customer.email,
                    reference: transaction.id
                });

                // 6. Actualizar transacción con resultado de Wompi
                await this.transactionRepository.updateWompiIdAndStatus(
                    transaction.id,
                    paymentResult.id,
                    paymentResult.status,
                    paymentResult.statusMessage,
                    paymentResult.paymentMethod
                );

                // 7. Si el pago es exitoso, actualizar stock
                if (paymentResult.status === 'APPROVED') {
                    product.decreaseStock(1);
                    await this.productRepository.update(product);
                }

                return Result.ok(new PaymentResultDTO(
                    transaction.id,
                    paymentResult.status,
                    paymentResult.statusMessage,
                    product.stock,
                    paymentResult.id
                ));
            } catch (error) {
                // 8. En caso de error, marcar la transacción como fallida
                await this.transactionRepository.updateStatus(transaction.id, 'FAILED');
                throw error;
            }
        } catch (error) {
            return Result.fail(error.message);
        }
    }
}

module.exports = ProcessPaymentUseCase;