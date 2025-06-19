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
    
    } catch (error) {
        console.error('Error al eliminar las tablas:', error);
        throw error;
    }
};

const createTablesInOrder = async (models) => {
    try {
        // Primero crear las tablas base (sin dependencias)
        await models.Customer.sync();

        
        await models.Product.sync();


        // Luego crear la tabla de transacciones que depende de las anteriores
        await models.Transaction.sync();


        // Finalmente crear la tabla de entregas que depende de transacciones
        await models.Delivery.sync();

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
    

            
            // Configuración optimizada para Render PostgreSQL
            const dialectOptions = {};
            
            // Si la URL contiene 'render.com' o estamos en producción, usar SSL
            if (config.database.url.includes('render.com') || process.env.NODE_ENV === 'production') {
                dialectOptions.ssl = {
                    require: true,
                    rejectUnauthorized: false
                };

            }
            
            sequelize = new Sequelize(config.database.url, {
                dialect: config.database.dialect,
                logging: false,
                dialectOptions,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            });
        } else {




            
            sequelize = new Sequelize(
                config.database.name,
                config.database.user,
                config.database.password,
                {
                    host: config.database.host,
                    port: config.database.port,
                    dialect: config.database.dialect,
                    logging: false,
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


        // Solo eliminar tablas si forceSync es true
        if (forceSync) {
            await dropAllTables(sequelize);
        }

        // Inicializar modelos
        const models = initModels(sequelize);

        // Crear o verificar tablas en orden
        await createTablesInOrder(models);
        




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

        
        const [results] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");

        results.forEach(result => {

        });

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