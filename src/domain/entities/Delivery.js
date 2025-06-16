const { v4: uuidv4 } = require('uuid');

class Delivery {
    constructor({
        transactionId,
        address,
        city,
        department,
        postalCode,
        recipientName,
        recipientPhone,
        id = uuidv4()
    }) {
        this.id = id;
        this.transactionId = transactionId;
        this.address = address;
        this.city = city;
        this.department = department;
        this.postalCode = postalCode;
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
    }
}

module.exports = Delivery;