const { Sequelize } = require('sequelize');
const config = require('../../config');

// Importar modelos
const defineProduct = require('./models/Product');
const defineCustomer = require('./models/Customer');
const defineTransaction = require('./models/Transaction');
const defineDelivery = require('./models/Delivery');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  username: config.db.user,
  password: config.db.password,
  logging: config.nodeEnv === 'development' ? console.log : false,
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
        console.log('Conexión a la base de datos establecida exitosamente.');

        // Sincronizar modelos con la base de datos
        await sequelize.sync({ alter: true });
        
        // Mostrar las tablas creadas
        console.log('\n=== Tablas sincronizadas en la base de datos ===');
        console.log('✓ products - Tabla de productos');
        console.log('✓ customers - Tabla de clientes');
        console.log('✓ transactions - Tabla de transacciones');
        console.log('✓ deliveries - Tabla de entregas');
        console.log('============================================\n');

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
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
};

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida exitosamente.');
    
    // Mostrar información de la base de datos
    const [results] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    console.log('\n=== Tablas existentes en la base de datos ===');
    results.forEach(result => {
      console.log(`✓ ${result.tablename}`);
    });
    console.log('==========================================\n');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
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