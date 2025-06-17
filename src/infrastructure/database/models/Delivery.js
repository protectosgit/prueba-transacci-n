const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Delivery = sequelize.define('Delivery', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        transactionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Transactions',
                key: 'id'
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        department: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recipientName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recipientPhone: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return Delivery;
}; 