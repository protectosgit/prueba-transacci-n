const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: {
            type: DataTypes.UUID,
            unique: true,
            // Este campo será usado solo para productos sembrados
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get() {
                const value = this.getDataValue('price');
                return value === null ? null : parseFloat(value);
            }
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'Products',
        timestamps: true,
        freezeTableName: true
    });

    return Product;
}; 