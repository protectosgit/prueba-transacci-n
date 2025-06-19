require('dotenv').config();
const Server = require('./adapters/driving/web/server');
const { connectDB } = require('./infrastructure/database/connection');
const config = require('./config');

// Controladores
const ProductController = require('./adapters/driving/web/controllers/product.controller');
const PaymentController = require('./adapters/driving/web/controllers/payment.controller');

// Repositorios
const ProductRepository = require('./adapters/driven/persistence/ProductRepository');
const TransactionRepository = require('./adapters/driven/persistence/TransactionRepository');
const CustomerRepository = require('./adapters/driven/persistence/CustomerRepository');
const DeliveryRepository = require('./adapters/driven/persistence/DeliveryRepository');

// Adaptadores externos
const WompiAdapter = require('./adapters/driven/pagos-externos/WompiAdapter');

// Casos de uso
const GetProductUseCase = require('./application/use-cases/GetProductUseCase');
const CreateProductUseCase = require('./application/use-cases/CreateProductUseCase');
const GetAllProductsUseCase = require('./application/use-cases/GetAllProductsUseCase');
const ProcessPaymentUseCase = require('./application/use-cases/ProcessPaymentUseCase');
const GetPaymentStatusUseCase = require('./application/use-cases/GetPaymentStatusUseCase');
const ProcessWebhookUseCase = require('./application/use-cases/ProcessWebhookUseCase');
const CreateTransactionUseCase = require('./application/use-cases/CreateTransactionUseCase');

// Rutas
const productRoutes = require('./adapters/driving/web/routes/product.routes');
const paymentRoutes = require('./adapters/driving/web/routes/payment.routes');

const startServer = async () => {
  try {
    // Conectar y sincronizar la base de datos
    const { models, sequelize } = await connectDB();
    
    // Forzar sincronización del modelo Transaction para asegurar que las columnas existan
    await models.Transaction.sync({ alter: true });
    
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

    // Crear y configurar el servidor
    const server = new Server(productRoutesConfig, paymentRoutesConfig);
    const app = server.getApp();

    // Iniciar el servidor
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0'; // Escuchar en todas las interfaces
    const httpServer = app.listen(PORT, HOST, () => {
      // Servidor iniciado silenciosamente
    });

    // Manejo de cierre graceful
    const gracefulShutdown = () => {
      httpServer.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error( ' Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 