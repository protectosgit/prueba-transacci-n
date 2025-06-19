const ICustomerRepository = require('../../../domain/repositories/ICustomerRepository');
const Customer = require('../../../domain/entities/Customer');

class CustomerRepository extends ICustomerRepository {
    constructor(customerModel) {
        super();
        this.customerModel = customerModel;
    }

    async save(customer) {
        try {
            const [customerData, created] = await this.customerModel.findOrCreate({
                where: { email: customer.email },
                defaults: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phone
                }
            });

            if (!created) {
                // Si el cliente ya existe, actualizar sus datos
                await customerData.update({
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phone
                });
            }

            return new Customer(
                customerData.firstName,
                customerData.lastName,
                customerData.email,
                customerData.phone,
                customerData.id
            );
        } catch (error) {
            throw new Error(`Error al guardar cliente: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            const customer = await this.customerModel.findOne({
                where: { email }
            });

            if (!customer) return null;

            return new Customer(
                customer.firstName,
                customer.lastName,
                customer.email,
                customer.phone,
                customer.id
            );
        } catch (error) {
            throw new Error(`Error al buscar cliente por email: ${error.message}`);
        }
    }

    async getById(customerId) {
        try {
            const customer = await this.customerModel.findByPk(customerId);
            if (!customer) return null;

            return new Customer(
                customer.firstName,
                customer.lastName,
                customer.email,
                customer.phone,
                customer.id
            );
        } catch (error) {
            throw new Error(`Error al buscar cliente por ID: ${error.message}`);
        }
    }

    async update(customer) {
        try {
            const [updatedCount] = await this.customerModel.update({
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone
            }, {
                where: { id: customer.id }
            });

            if (updatedCount === 0) {
                throw new Error('No se encontró el cliente para actualizar');
            }

            return this.getById(customer.id);
        } catch (error) {
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    }
}

module.exports = CustomerRepository;