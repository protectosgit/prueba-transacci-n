const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Delivery = sequelize.define('Delivery', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        transactionId: {
            type: DataTypes.INTEGER,
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
    }, {
        tableName: 'Deliveries',
        timestamps: true,
        freezeTableName: true
    });

    Delivery.associate = (models) => {
        Delivery.belongsTo(models.Transaction, {
            foreignKey: 'transactionId',
            as: 'transaction'
        });
    };

    return Delivery;
}; 