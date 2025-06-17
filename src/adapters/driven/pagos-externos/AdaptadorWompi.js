const axios = require('axios');
const config = require('../../../config');
const IPaymentGateway = require('../../../domain/gates/IPaymentGateway');

class WompiAdapter extends IPaymentGateway {
    constructor() {
        super();
        this.apiKey = config.wompi.apiKey;
        this.apiUrl = config.wompi.apiUrl;
        this.axios = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async processPayment(paymentData) {
        try {
            const response = await this.axios.post('/transactions', {
                amount_in_cents: Math.round(paymentData.amount * 100),
                currency: 'COP',
                payment_method: {
                    type: 'CARD',
                    token: paymentData.cardToken
                },
                payment_source_id: null,
                customer_email: paymentData.customerInfo.email,
                customer_data: {
                    full_name: paymentData.customerInfo.name,
                    phone_number: paymentData.customerInfo.phone
                },
                reference: `REF-${Date.now()}`,
                description: paymentData.description
            });

            if (response.data.data.status === 'APPROVED') {
                return {
                    success: true,
                    transactionId: response.data.data.id,
                    status: 'COMPLETED'
                };
            } else {
                return {
                    success: false,
                    error: response.data.data.status_message || 'Error procesando el pago'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Error de conexión con Wompi'
            };
        }
    }
}

module.exports = WompiAdapter; 