const { Sequelize } = require('sequelize');
require('dotenv').config();

// Importar modelos
const defineProduct = require('./models/Product');
const defineCustomer = require('./models/Customer');
const defineTransaction = require('./models/Transaction');
const defineDelivery = require('./models/Delivery');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Inicializar modelos
const Product = defineProduct(sequelize);
const Customer = defineCustomer(sequelize);
const Transaction = defineTransaction(sequelize);
const Delivery = defineDelivery(sequelize);

// Definir relaciones
Transaction.belongsTo(Product);
Transaction.belongsTo(Customer);
Delivery.belongsTo(Transaction);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await sequelize.sync({ alter: true });
        console.log('Database models synchronized.');

        return {
            sequelize,
            models: {
                Product,
                Customer,
                Transaction,
                Delivery
            }
        };
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
    sequelize,
    connectDB,
    testConnection,
    models: {
        Product,
        Customer,
        Transaction,
        Delivery
    }
}; 