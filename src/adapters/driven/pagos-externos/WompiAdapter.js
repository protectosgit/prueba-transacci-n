const axios = require('axios');
const crypto = require('crypto');

class WompiAdapter {
    constructor(config) {
        this.client = axios.create({
            baseURL: config.apiUrl,
            headers: {
                'Authorization': `Bearer ${config.privateKey}`,
                'Content-Type': 'application/json'
            }
        });
        this.integrityKey = config.integrityKey;
        this.webhookUrl = config.webhookUrl || 'https://back-pasarela.onrender.com/api/payments/webhook';
    }

    generateSignature(reference, amountInCents, currency) {
        if (!this.integrityKey) {
            throw new Error('Integrity key not configured');
        }
        
        const message = `${reference}${amountInCents}${currency}${this.integrityKey}`;
        return crypto.createHash('sha256').update(message).digest('hex');
    }

    async setupWebhook() {
        try {
            const response = await this.client.post('/events', {
                url: this.webhookUrl,
                event_types: [
                    'transaction.updated'
                ]
            });
            
            return {
                success: true,
                webhookId: response.data.data.id,
                message: 'Webhook configurado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                message: `Error configurando webhook: ${error.message}`
            };
        }
    }

    async processPayment(paymentData) {
        try {
            this.validatePaymentData(paymentData);

            const amountInCents = Math.round(paymentData.amount * 100);
            const signature = this.generateSignature(
                paymentData.transactionId, 
                amountInCents, 
                'COP'
            );

            const response = await this.client.post('/transactions', {
                amount_in_cents: amountInCents,
                currency: 'COP',
                payment_method: {
                    type: 'CARD',
                    token: paymentData.token
                },
                reference: paymentData.transactionId,
                signature: signature
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