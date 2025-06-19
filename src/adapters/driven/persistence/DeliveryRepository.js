const IDeliveryRepository = require('../../../domain/repositories/IDeliveryRepository');
const Delivery = require('../../../domain/entities/Delivery');

class DeliveryRepository extends IDeliveryRepository {
    constructor(deliveryModel) {
        super();
        this.deliveryModel = deliveryModel;
    }

    async save(delivery) {
        try {
            const savedDelivery = await this.deliveryModel.create({
                transactionId: delivery.transactionId,
                customerId: delivery.customerId,
                address: delivery.address,
                city: delivery.city,
                department: delivery.department,
                postalCode: delivery.postalCode,
                recipientName: delivery.recipientName,
                recipientPhone: delivery.recipientPhone
            });

            return new Delivery(savedDelivery.toJSON());
        } catch (error) {
            throw new Error(`Error al guardar entrega: ${error.message}`);
        }
    }

    async getByTransactionId(transactionId) {
        try {
            const delivery = await this.deliveryModel.findOne({
                where: { transactionId }
            });

            if (!delivery) return null;

            return new Delivery(delivery.toJSON());
        } catch (error) {
            throw new Error(`Error al obtener entrega: ${error.message}`);
        }
    }

    async update(delivery) {
        try {
            await this.deliveryModel.update({
                address: delivery.address,
                city: delivery.city,
                department: delivery.department,
                postalCode: delivery.postalCode,
                recipientName: delivery.recipientName,
                recipientPhone: delivery.recipientPhone
            }, {
                where: { id: delivery.id }
            });

            const updatedDelivery = await this.deliveryModel.findByPk(delivery.id);
            return new Delivery(updatedDelivery.toJSON());
        } catch (error) {
            throw new Error(`Error al actualizar entrega: ${error.message}`);
        }
    }
}

module.exports = DeliveryRepository;