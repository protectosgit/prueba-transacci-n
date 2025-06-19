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
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Referencia única generada para el pago'
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
                isIn: [['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'APPROVED', 'DECLINED']]
            }
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'credit_card'
        },
        paymentToken: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Token o referencia interna del pago'
        },
        wompiTransactionId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'ID de transacción proporcionado por Wompi'
        },
        wompiStatus: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Estado específico reportado por Wompi'
        },
        wompiResponse: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Respuesta completa de Wompi en formato JSON'
        },
        failureReason: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Razón del fallo si el pago fue rechazado'
        },
        cartItems: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('cartItems');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('cartItems', JSON.stringify(value || []));
            }
        },
        deliveryInfo: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('deliveryInfo');
                return value ? JSON.parse(value) : null;
            },
            set(value) {
                this.setDataValue('deliveryInfo', JSON.stringify(value || null));
            }
        },
        totalItems: {
            type: DataTypes.VIRTUAL,
            get() {
                const cartItems = this.cartItems || [];
                return cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
            }
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
        freezeTableName: true,
        indexes: [
            {
                fields: ['reference'],
                unique: true
            },
            {
                fields: ['wompiTransactionId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['customerId']
            }
        ]
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