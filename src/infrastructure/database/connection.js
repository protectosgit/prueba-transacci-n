const { Sequelize } = require('sequelize');
const config = require('../../config');

let sequelize = null;

// Inicializar modelos
const initModels = (sequelizeInstance) => {
    const Customer = require('./models/Customer');
    const Product = require('./models/Product');
    const Transaction = require('./models/Transaction');
    const Delivery = require('./models/Delivery');

    const models = {
        Customer: Customer(sequelizeInstance),
        Product: Product(sequelizeInstance),
        Transaction: Transaction(sequelizeInstance),
        Delivery: Delivery(sequelizeInstance)
    };

    // Establecer asociaciones
    Object.values(models)
        .filter(model => typeof model.associate === 'function')
        .forEach(model => model.associate(models));

    return models;
};

const dropAllTables = async (sequelizeInstance) => {
    try {
        // Eliminar tablas en orden inverso a su creación (por las dependencias)
        await sequelizeInstance.query('DROP TABLE IF EXISTS "Deliveries" CASCADE');
        await sequelizeInstance.query('DROP TABLE IF EXISTS "Transactions" CASCADE');
        await sequelizeInstance.query('DROP TABLE IF EXISTS "Products" CASCADE');
        await sequelizeInstance.query('DROP TABLE IF EXISTS "Customers" CASCADE');
        await sequelizeInstance.query('DROP TYPE IF EXISTS "enum_transactions_status" CASCADE');
        console.log('Todas las tablas han sido eliminadas.');
    } catch (error) {
        console.error('Error al eliminar las tablas:', error);
        throw error;
    }
};

const createTablesInOrder = async (models) => {
    try {
        // Primero crear las tablas base (sin dependencias)
        await models.Customer.sync();
        console.log('Tabla Customers verificada');
        
        await models.Product.sync();
        console.log('Tabla Products verificada');

        // Luego crear la tabla de transacciones que depende de las anteriores
        await models.Transaction.sync();
        console.log('Tabla Transactions verificada');

        // Finalmente crear la tabla de entregas que depende de transacciones
        await models.Delivery.sync();
        console.log(' Tabla Deliveries verificada');
    } catch (error) {
        console.error('Error al verificar las tablas:', error);
        throw error;
    }
};

const connectDB = async (forceSync = false) => {
    try {
        // Si hay una conexión existente, la cerramos
        if (sequelize) {
            await sequelize.close();
            sequelize = null;
        }

        // Crear nueva conexión
        // Configuración para Render y otras plataformas que usan DATABASE_URL
        if (config.database.url) {
            console.log('🔗 Conectando usando DATABASE_URL...');
            sequelize = new Sequelize(config.database.url, {
                dialect: config.database.dialect,
                logging: false,
                dialectOptions: config.database.dialectOptions,
                ssl: config.database.ssl,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            });
        } else {
            console.log('🔗 Conectando usando configuración individual...');
            sequelize = new Sequelize(
                config.database.name,
                config.database.user,
                config.database.password,
                {
                    host: config.database.host,
                    port: config.database.port,
                    dialect: config.database.dialect,
                    logging: false,
                    dialectOptions: config.database.dialectOptions,
                    ssl: config.database.ssl,
                    pool: {
                        max: 5,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    }
                }
            );
        }

        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');

        // Solo eliminar tablas si forceSync es true
        if (forceSync) {
            await dropAllTables(sequelize);
        }

        // Inicializar modelos
        const models = initModels(sequelize);

        // Crear o verificar tablas en orden
        await createTablesInOrder(models);
        
        console.log('\n=== Base de datos sincronizada exitosamente ===');
        console.log('Todas las tablas y relaciones han sido verificadas');
        console.log('============================================\n');

        return {
            sequelize,
            models
        };
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
};

const testConnection = async () => {
    try {
        if (!sequelize) {
            throw new Error('No hay conexión a la base de datos');
        }
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL establecida exitosamente.');
        
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
    connectDB,
    testConnection,
    getSequelize: () => sequelize,
    getModels: () => sequelize ? initModels(sequelize) : null
}; 