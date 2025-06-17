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

// Adaptadores externos
const WompiAdapter = require('./adapters/driven/pagos-externos/WompiAdapter');

// Casos de uso
const GetProductUseCase = require('./application/use-cases/GetProductUseCase');
const CreateProductUseCase = require('./application/use-cases/CreateProductUseCase');
const ProcessPaymentUseCase = require('./application/use-cases/ProcessPaymentUseCase');

// Rutas
const productRoutes = require('./adapters/driving/web/routes/product.routes');
const paymentRoutes = require('./adapters/driving/web/routes/payment.routes');

const startServer = async () => {
  try {
    // Conectar y sincronizar la base de datos
    const { models } = await connectDB();
    
    // Configurar repositorios
    const productRepository = new ProductRepository(models.Product);
    const transactionRepository = new TransactionRepository(models.Transaction);

    // Configurar adaptadores externos
    const wompiAdapter = new WompiAdapter(config.wompi);

    // Configurar casos de uso
    const getProductUseCase = new GetProductUseCase(productRepository);
    const createProductUseCase = new CreateProductUseCase(productRepository);
    const processPaymentUseCase = new ProcessPaymentUseCase(
      transactionRepository,
      productRepository,
      wompiAdapter
    );

    // Configurar controladores
    const productController = new ProductController(getProductUseCase, createProductUseCase);
    const paymentController = new PaymentController(processPaymentUseCase);

    // Configurar rutas
    const productRoutesConfig = productRoutes(productController);
    const paymentRoutesConfig = paymentRoutes(paymentController);

    // Crear y configurar el servidor
    const server = new Server(productRoutesConfig, paymentRoutesConfig);
    const app = server.getApp();

    // Iniciar el servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 