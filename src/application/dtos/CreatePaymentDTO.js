class CreatePaymentDTO {
    constructor(data) {
        this.productId = data.productId;
        this.cardToken = data.cardToken;
        this.customerInfo = {
            firstName: data.customerInfo.firstName,
            lastName: data.customerInfo.lastName,
            email: data.customerInfo.email,
            phone: data.customerInfo.phone
        };
        this.deliveryInfo = {
            address: data.deliveryInfo.address,
            city: data.deliveryInfo.city,
            department: data.deliveryInfo.department,
            postalCode: data.deliveryInfo.postalCode,
            recipientName: data.deliveryInfo.recipientName,
            recipientPhone: data.deliveryInfo.recipientPhone
        };
        this.validate();
    }

    validate() {
        if (!this.productId) throw new Error('ProductId es requerido');
        if (!this.cardToken) throw new Error('CardToken es requerido');
        if (!this.customerInfo.email) throw new Error('Email del cliente es requerido');
        if (!this.deliveryInfo.address) throw new Error('Dirección de entrega es requerida');
    }
}

module.exports = CreatePaymentDTO;