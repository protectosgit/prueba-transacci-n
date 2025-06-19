const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/infrastructure/database/connection');
const config = require('./src/config');

// Controladores
const ProductController = require('./src/adapters/driving/web/controllers/product.controller');
const PaymentController = require('./src/adapters/driving/web/controllers/payment.controller');

// Repositorios
const ProductRepository = require('./src/adapters/driven/persistence/ProductRepository');
const TransactionRepository = require('./src/adapters/driven/persistence/TransactionRepository');
const CustomerRepository = require('./src/adapters/driven/persistence/CustomerRepository');
const DeliveryRepository = require('./src/adapters/driven/persistence/DeliveryRepository');

// Adaptadores externos
const WompiAdapter = require('./src/adapters/driven/pagos-externos/WompiAdapter');

// Casos de uso
const GetProductUseCase = require('./src/application/use-cases/GetProductUseCase');
const CreateProductUseCase = require('./src/application/use-cases/CreateProductUseCase');
const GetAllProductsUseCase = require('./src/application/use-cases/GetAllProductsUseCase');
const ProcessPaymentUseCase = require('./src/application/use-cases/ProcessPaymentUseCase');
const GetPaymentStatusUseCase = require('./src/application/use-cases/GetPaymentStatusUseCase');
const ProcessWebhookUseCase = require('./src/application/use-cases/ProcessWebhookUseCase');
const CreateTransactionUseCase = require('./src/application/use-cases/CreateTransactionUseCase');

// Rutas
const productRoutes = require('./src/adapters/driving/web/routes/product.routes');
const paymentRoutes = require('./src/adapters/driving/web/routes/payment.routes');

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Payment Processing API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      payments: '/api/payments'
    }
  });
});

// Inicializar la aplicación
const initializeApp = async () => {
  try {
    console.log('🔧 Inicializando aplicación...');
    
    // Conectar y sincronizar la base de datos
    const { models, sequelize } = await connectDB();
    
    // Sincronizar modelo Transaction
    console.log('🔧 Sincronizando modelo Transaction...');
    await models.Transaction.sync({ alter: true });
    console.log('✅ Modelo Transaction sincronizado');
    
    // Configurar repositorios
    const productRepository = new ProductRepository(models.Product);
    const transactionRepository = new TransactionRepository(models.Transaction);
    const customerRepository = new CustomerRepository(models.Customer);
    const deliveryRepository = new DeliveryRepository(models.Delivery);

    // Configurar adaptadores externos
    const wompiAdapter = new WompiAdapter(config.wompi);

    // Configurar casos de uso
    const getProductUseCase = new GetProductUseCase(productRepository);
    const createProductUseCase = new CreateProductUseCase(productRepository);
    const getAllProductsUseCase = new GetAllProductsUseCase(productRepository);
    const processPaymentUseCase = new ProcessPaymentUseCase(
      transactionRepository,
      productRepository,
      wompiAdapter
    );
    const getPaymentStatusUseCase = new GetPaymentStatusUseCase(
      transactionRepository,
      customerRepository,
      productRepository
    );
    const processWebhookUseCase = new ProcessWebhookUseCase(
      transactionRepository,
      productRepository
    );
    const createTransactionUseCase = new CreateTransactionUseCase(
      transactionRepository,
      customerRepository,
      deliveryRepository
    );

    // Configurar controladores
    const productController = new ProductController(
      getProductUseCase,
      createProductUseCase,
      getAllProductsUseCase
    );
    const paymentController = new PaymentController(
      processPaymentUseCase,
      getPaymentStatusUseCase,
      processWebhookUseCase,
      createTransactionUseCase,
      transactionRepository,
      productRepository,
      wompiAdapter
    );

    // Configurar rutas
    const productRoutesConfig = productRoutes(productController);
    const paymentRoutesConfig = paymentRoutes(paymentController);

    // Registrar rutas
    app.use('/api/products', productRoutesConfig);
    app.use('/api/payments', paymentRoutesConfig);

    // Middleware de manejo de errores
    app.use((err, req, res, next) => {
      console.error('❌ Error:', err);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
      });
    });

    // Middleware para rutas no encontradas
    app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl 
      });
    });

    console.log('✅ Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    throw error;
  }
};

// Exportar la aplicación y la función de inicialización
module.exports = { app, initializeApp }; 