const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        customerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Customers',
                key: 'id'
            }
        },
        deliveryInfo: {
            type: DataTypes.JSON,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        baseFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        deliveryFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
            allowNull: false
        },
        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        paymentProviderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        paymentStatusMessage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        paymentMethodType: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Transaction;
}; 