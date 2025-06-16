const axios = require('axios');
const IPaymentGateway = require('../../../domain/gates/IPaymentGateway');
const config = require('../../../config');

class WompiAdapter extends IPaymentGateway {
    constructor() {
        super();
        this.axiosInstance = axios.create({
            baseURL: config.wompi.apiUrl,
            headers: {
                'Authorization': `Bearer ${config.wompi.privateKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async processPayment(paymentDetails) {
        try {
            const response = await this.axiosInstance.post('/transactions', {
                amount_in_cents: paymentDetails.amountInCents,
                currency: paymentDetails.currency,
                customer_email: paymentDetails.customerEmail,
                payment_method: {
                    type: 'CARD',
                    token: paymentDetails.cardToken
                },
                reference: paymentDetails.reference
            });

            return {
                id: response.data.data.id,
                status: response.data.data.status,
                statusMessage: response.data.data.status_message,
                paymentMethod: 'CARD'
            };
        } catch (error) {
            throw new Error(`Error procesando pago con Wompi: ${error.message}`);
        }
    }

    async getTransactionStatus(wompiTransactionId) {
        try {
            const response = await this.axiosInstance.get(`/transactions/${wompiTransactionId}`);
            return response.data.data.status;
        } catch (error) {
            throw new Error(`Error obteniendo estado de transacción Wompi: ${error.message}`);
        }
    }
}

module.exports = WompiAdapter;