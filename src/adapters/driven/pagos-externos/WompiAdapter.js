const axios = require('axios');

class WompiAdapter {
    constructor(config) {
        this.client = axios.create({
            baseURL: config.apiUrl,
            headers: {
                'Authorization': `Bearer ${config.privateKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async processPayment(paymentData) {
        try {
            this.validatePaymentData(paymentData);

            const response = await this.client.post('/transactions', {
                amount_in_cents: Math.round(paymentData.amount * 100),
                currency: 'COP',
                payment_method: {
                    type: 'CARD',
                    token: paymentData.token
                },
                reference: paymentData.transactionId
            });

            if (response.data.error) {
                return {
                    success: false,
                    status: 'FAILED',
                    message: response.data.error.message
                };
            }

            const transaction = response.data.data;
            const isApproved = transaction.status === 'APPROVED';

            return {
                success: isApproved,
                transactionId: transaction.id,
                status: isApproved ? 'COMPLETED' : 'FAILED',
                message: isApproved ? 'Payment processed successfully' : transaction.status_message
            };
        } catch (error) {
            if (error.message === 'Datos de pago inválidos') {
                throw error;
            }
            throw new Error(`Error al procesar el pago: ${error.message}`);
        }
    }

    validatePaymentData(paymentData) {
        if (!paymentData.amount || paymentData.amount <= 0) {
            throw new Error('Datos de pago inválidos');
        }

        if (!paymentData.token) {
            throw new Error('Datos de pago inválidos');
        }

        if (!paymentData.transactionId) {
            throw new Error('Datos de pago inválidos');
        }
    }
}

module.exports = WompiAdapter; 