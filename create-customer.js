require('dotenv').config();
const { connectDB } = require('./src/infrastructure/database/connection');

async function createCustomer() {
    try {
        const { models } = await connectDB();
        
        const customer = await models.Customer.create({
            firstName: 'Cliente',
            lastName: 'murillo',
            email: 'cliente@ejemplo.com',
            phone: '1234567890'
        });

        console.log('Cliente creado exitosamente:', customer.toJSON());
        process.exit(0);
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        process.exit(1);
    }
}

createCustomer(); 