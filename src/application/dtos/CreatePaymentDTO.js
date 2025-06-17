class CreatePaymentDTO {
    constructor(data) {
        this.validateRequiredFields(data);
        this.validateAmount(data.amount);
        this.validatePaymentMethod(data.paymentMethod);
        
        if (data.customerEmail) {
            this.validateEmail(data.customerEmail);
        }
        
        if (data.customerPhone) {
            this.validatePhone(data.customerPhone);
        }

        this.productId = data.productId;
        this.customerId = data.customerId;
        this.amount = data.amount;
        this.paymentMethod = data.paymentMethod;
        this.paymentToken = data.paymentToken;
        this.customerEmail = data.customerEmail;
        this.customerPhone = data.customerPhone;
    }

    validateRequiredFields(data) {
        if (!data.productId || !data.customerId || !data.amount || 
            !data.paymentMethod || !data.paymentToken) {
            throw new Error('Datos de pago inválidos');
        }
    }

    validateAmount(amount) {
        if (!amount || amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }
    }

    validatePaymentMethod(method) {
        const validMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PSE', 'CASH'];
        if (!validMethods.includes(method)) {
            throw new Error('Método de pago inválido');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido');
        }
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(phone)) {
            throw new Error('Teléfono inválido');
        }
    }

    toJSON() {
        return {
            productId: this.productId,
            customerId: this.customerId,
            amount: this.amount,
            paymentMethod: this.paymentMethod,
            paymentToken: this.paymentToken,
            customerEmail: this.customerEmail,
            customerPhone: this.customerPhone
        };
    }
}

module.exports = CreatePaymentDTO;