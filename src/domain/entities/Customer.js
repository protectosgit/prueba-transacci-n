const { v4: uuidv4 } = require('uuid');

class Customer {
    constructor(firstName, lastName, email, phone, id = uuidv4()) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this._setEmail(email);
        this.phone = phone;
    }

    _setEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido');
        }
        this.email = email;
    }
}

module.exports = Customer;