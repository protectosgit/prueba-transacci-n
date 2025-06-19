const Result = require('../../utils/Result');

class CreateTransactionUseCase {
    constructor(transactionRepository, customerRepository, deliveryRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.deliveryRepository = deliveryRepository;
    }

    async execute(transactionData) {
        try {
            console.log('CreateTransactionUseCase: Creando transacción con datos:', transactionData);

            // Validar datos mínimos requeridos
            if (!transactionData.reference) {
                return Result.fail('La referencia es requerida');
            }

            if (!transactionData.amount) {
                return Result.fail('El monto es requerido');
            }

            if (!transactionData.customerData) {
                return Result.fail('Los datos del cliente son requeridos');
            }

            if (!transactionData.customerData.email) {
                return Result.fail('El email del cliente es requerido');
            }

            // Verificar si la transacción ya existe
            const existingTransaction = await this.transactionRepository.findByReference(transactionData.reference);
            if (existingTransaction) {
                console.log('Transacción ya existe, actualizando con datos completos...');
                
                // Actualizar el cliente con los datos del frontend
                try {
                    let customer = await this.customerRepository.getById(existingTransaction.customerId);
                    
                    // Actualizar los datos del cliente con la información del frontend
                    const updatedCustomerData = {
                        ...customer,
                        firstName: transactionData.customerData.firstName || customer.firstName,
                        lastName: transactionData.customerData.lastName || customer.lastName,
                        email: transactionData.customerData.email || customer.email,
                        phone: transactionData.customerData.phone || customer.phone
                    };
                    
                    customer = await this.customerRepository.update(updatedCustomerData);
                    console.log('Cliente actualizado con datos del frontend:', customer);
                } catch (error) {
                    console.error('Error actualizando cliente:', error);
                }

                // Actualizar la transacción con el monto correcto
                try {
                    const updatedTransactionData = {
                        ...existingTransaction,
                        amount: transactionData.amount,
                        // Mantener el productId del primer producto del carrito
                        productId: transactionData.cartItems?.[0]?.product?.id || existingTransaction.productId,
                        // Guardar todos los elementos del carrito
                        cartItems: transactionData.cartItems || [],
                        // Guardar información de entrega
                        deliveryInfo: transactionData.deliveryData || null
                    };
                    
                    await this.transactionRepository.update(updatedTransactionData);
                    console.log('Transacción actualizada con datos completos:', {
                        amount: transactionData.amount,
                        cartItemsCount: transactionData.cartItems?.length || 0,
                        hasDelivery: !!transactionData.deliveryData
                    });
                } catch (error) {
                    console.error('Error actualizando transacción:', error);
                }

                // Procesar entrega si se proporciona
                if (transactionData.deliveryData) {
                    try {
                        const delivery = await this.deliveryRepository.save({
                            ...transactionData.deliveryData,
                            customerId: existingTransaction.customerId,
                            transactionId: existingTransaction.id
                        });
                        console.log('Entrega procesada para transacción existente:', delivery);
                    } catch (error) {
                        console.error('Error procesando entrega para transacción existente:', error);
                    }
                }

                // Retornar la transacción actualizada
                const updatedTransaction = await this.transactionRepository.findByReference(transactionData.reference);
                return Result.ok(updatedTransaction);
            }

            // Si la transacción no existe, crear una nueva
            // Procesar cliente
            let customer;
            try {
                // Buscar cliente por email
                customer = await this.customerRepository.findByEmail(transactionData.customerData.email);
                
                if (!customer) {
                    // Si no existe, crear nuevo cliente
                    customer = await this.customerRepository.save({
                        firstName: transactionData.customerData.firstName || 'No especificado',
                        lastName: transactionData.customerData.lastName || 'No especificado',
                        email: transactionData.customerData.email,
                        phone: transactionData.customerData.phone || 'No especificado'
                    });
                } else {
                    // Si existe, actualizar datos solo si se proporcionan
                    const updateData = {
                        ...customer,
                        firstName: transactionData.customerData.firstName || customer.firstName,
                        lastName: transactionData.customerData.lastName || customer.lastName,
                        phone: transactionData.customerData.phone || customer.phone
                    };
                    customer = await this.customerRepository.update(updateData);
                }
                console.log('Cliente procesado:', customer);
            } catch (error) {
                console.error('Error procesando cliente:', error);
                return Result.fail(`Error procesando cliente: ${error.message}`);
            }

            // Obtener el ID del primer producto del carrito o usar un valor por defecto
            const productId = transactionData.cartItems?.[0]?.product?.id || 1;

            // Crear transacción
            const transaction = await this.transactionRepository.save({
                reference: transactionData.reference,
                amount: transactionData.amount,
                status: 'PENDING',
                customerId: customer.id,
                productId: productId,
                paymentMethod: transactionData.paymentMethod || 'CARD',
                paymentToken: transactionData.reference,
                wompiTransactionId: null,
                wompiStatus: null,
                wompiResponse: null,
                failureReason: null,
                // Guardar elementos del carrito
                cartItems: transactionData.cartItems || [],
                // Guardar información de entrega
                deliveryInfo: transactionData.deliveryData || null
            });

            console.log('Transacción creada con datos completos:', {
                id: transaction.id,
                amount: transactionData.amount,
                cartItemsCount: transactionData.cartItems?.length || 0,
                hasDelivery: !!transactionData.deliveryData
            });

            // Procesar entrega después de crear la transacción
            if (transactionData.deliveryData) {
                try {
                    const delivery = await this.deliveryRepository.save({
                        ...transactionData.deliveryData,
                        customerId: customer.id,
                        transactionId: transaction.id
                    });
                    console.log('Entrega procesada:', delivery);

                    // Actualizar la transacción con el ID de la entrega
                    transaction.deliveryId = delivery.id;
                    await this.transactionRepository.update(transaction);
                } catch (error) {
                    console.error('Error procesando entrega:', error);
                    // No lanzamos el error aquí para no fallar la transacción si falla la entrega
                }
            }

            return Result.ok(transaction);
        } catch (error) {
            console.error('Error en CreateTransactionUseCase:', error);
            return Result.fail(`Error creando transacción: ${error.message}`);
        }
    }
}

module.exports = CreateTransactionUseCase; 