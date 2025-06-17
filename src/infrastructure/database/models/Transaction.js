const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Customers',
                key: 'id'
            }
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDING',
            validate: {
                isIn: [['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']]
            }
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentToken: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Transactions',
        timestamps: true,
        freezeTableName: true
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.Customer, {
            foreignKey: 'customerId',
            as: 'customer'
        });
        Transaction.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        });
    };

    return Transaction;
}; 