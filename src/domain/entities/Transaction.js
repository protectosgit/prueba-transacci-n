const crypto = require('crypto');

class Transaction {
    #paymentMethod;  // Campo privado para información sensible
    #statusHistory;  // Campo privado para historial de estados

    constructor(data) {
        this.validateRequiredFields(data);
        this.validateAmount(data.amount);
        this.validateStatus(data.status);
        
        this.id = data.id || crypto.randomUUID();
        this.amount = data.amount;
        this.status = data.status || 'PENDING';
        this.productId = data.productId;
        this.customerId = data.customerId;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();

        // Inicializar historial de estados
        this.#statusHistory = [{
            status: this.status,
            timestamp: this.createdAt
        }];

        // Manejar información sensible
        if (data.paymentMethod) {
            this.validatePaymentMethod(data.paymentMethod);
            this.#paymentMethod = this.encryptSensitiveData(data.paymentMethod);
        }

        // Crear getters para información sensible
        Object.defineProperty(this, 'paymentMethod', {
            get: () => {
                if (!this.#paymentMethod) return {};
                return Object.freeze({...this.#paymentMethod});
            },
            set: () => {
                throw new TypeError('No se puede modificar directamente el método de pago');
            },
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(this, 'statusHistory', {
            get: () => {
                return Object.freeze([...this.#statusHistory]);
            },
            enumerable: true,
            configurable: false
        });

        // Si hay información del cliente, validarla y asignarla
        if (data.customerInfo) {
            this.validateCustomerInfo(data.customerInfo);
            this.customerInfo = {...data.customerInfo};
        }
    }

    validateRequiredFields(data) {
        if (!data.productId) {
            throw new Error('El productId es requerido');
        }
        if (!data.amount) {
            throw new Error('El monto es requerido');
        }
    }

    validateAmount(amount) {
        if (amount <= 0) {
            throw new Error('El monto de la transacción debe ser mayor a 0');
        }
    }

    validateStatus(status) {
        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DECLINED', 'REFUNDED'];
        if (status && !validStatuses.includes(status)) {
            throw new Error('Estado de transacción inválido');
        }
    }

    validateCustomerInfo(customerInfo) {
        if (customerInfo) {
            // Validar email si está presente
            if (customerInfo.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(customerInfo.email)) {
                    throw new Error('Email inválido');
                }
            }

            // Validar teléfono si está presente
            if (customerInfo.phone) {
                const phoneRegex = /^\d{10,15}$/;
                if (!phoneRegex.test(customerInfo.phone)) {
                    throw new Error('Número de teléfono inválido');
                }
            }
        }
    }

    validatePaymentMethod(paymentMethod) {
        if (paymentMethod) {
            // Validar tipo de método de pago
            const validTypes = ['CARD', 'PSE', 'CASH'];
            if (!validTypes.includes(paymentMethod.type)) {
                throw new Error('Tipo de método de pago inválido');
            }

            // Validar token si es tarjeta
            if (paymentMethod.type === 'CARD' && paymentMethod.token) {
                if (!paymentMethod.token.startsWith('tok_test_')) {
                    throw new Error('Token de pago inválido');
                }
            }
        }
    }

    encryptSensitiveData(paymentMethod) {
        const encryptedData = {...paymentMethod};
        
        if (paymentMethod.token) {
            // En un ambiente real, usaríamos un servicio de gestión de claves (KMS)
            const key = crypto.randomBytes(32); // Clave de 32 bytes para AES-256
            const iv = crypto.randomBytes(16);  // Vector de inicialización
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            
            let encrypted = cipher.update(paymentMethod.token, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();
            
            // Almacenamos el IV y el auth tag junto con el texto cifrado
            encryptedData.token = `enc_${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
        }

        return Object.freeze(encryptedData);
    }

    updateStatus(newStatus) {
        this.validateStatus(newStatus);
        this.status = newStatus;
        this.updatedAt = new Date();
        
        this.#statusHistory.push({
            status: newStatus,
            timestamp: this.updatedAt
        });
    }

    // Método para obtener una copia segura de los datos
    toJSON() {
        const json = {
            id: this.id,
            amount: this.amount,
            status: this.status,
            productId: this.productId,
            customerId: this.customerId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            statusHistory: this.statusHistory
        };

        if (this.#paymentMethod) {
            json.paymentMethod = this.paymentMethod;
        }

        if (this.customerInfo) {
            json.customerInfo = {...this.customerInfo};
        }

        return json;
    }
}

module.exports = Transaction;