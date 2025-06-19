const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Processing API',
      version: '1.0.0',
      description: `
# API de Procesamiento de Pagos con Wompi

Esta API permite gestionar productos y procesar pagos utilizando la pasarela de pagos Wompi.

## Características principales:
- 🛍️ **Gestión de productos**: CRUD completo de productos
- 💳 **Procesamiento de pagos**: Integración con Wompi
- 🔒 **Firmas de integridad**: Generación automática para transacciones
- 📊 **Webhooks**: Manejo de notificaciones de Wompi
- 🗄️ **Base de datos**: PostgreSQL con Sequelize ORM

## Arquitectura:
- **Patrón**: Arquitectura Hexagonal (Ports & Adapters)
- **Framework**: Node.js + Express
- **Base de datos**: PostgreSQL
- **ORM**: Sequelize
- **Pasarela de pagos**: Wompi

## Endpoints disponibles:
- \`/api/products\` - Gestión de productos
- \`/api/payments\` - Procesamiento de pagos
- \`/api-docs\` - Esta documentación

## URLs:
- **Producción**: https://back-pasarela.onrender.com
- **Frontend**: https://main.d10nqda7yg14nv.amplifyapp.com
      `,
      contact: {
        name: 'API Support',
        email: 'support@pasarela.com'
      },
      license: {
        name: 'ISC',
      }
    },
    servers: [
      {
        url: 'https://back-pasarela.onrender.com',
        description: 'Servidor de Producción (Render)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo Local'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del producto (generado automáticamente)',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'iPhone 15 Pro'
            },
            description: {
              type: 'string',
              description: 'Descripción detallada del producto',
              example: 'Apple iPhone 15 Pro 128GB con chip A17 Pro y cámara de 48MP'
            },
            price: {
              type: 'number',
              description: 'Precio del producto en pesos colombianos',
              example: 4500000
            },
            stock: {
              type: 'integer',
              description: 'Cantidad disponible en inventario',
              example: 12
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2025-06-19T16:32:44.899Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2025-06-19T16:32:44.899Z'
            }
          }
        },
        ProductCreate: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'iPhone 15 Pro'
            },
            description: {
              type: 'string',
              description: 'Descripción detallada del producto',
              example: 'Apple iPhone 15 Pro 128GB con chip A17 Pro y cámara de 48MP'
            },
            price: {
              type: 'number',
              description: 'Precio del producto en pesos colombianos',
              example: 4500000
            },
            stock: {
              type: 'integer',
              description: 'Cantidad disponible en inventario',
              example: 12
            }
          }
        },
        PaymentIntegrity: {
          type: 'object',
          required: ['reference', 'amount_in_cents', 'currency'],
          properties: {
            reference: {
              type: 'string',
              description: 'Referencia única de la transacción',
              example: 'ORDER-001-2025'
            },
            amount_in_cents: {
              type: 'integer',
              description: 'Monto en centavos (para $25,000 COP = 2500000)',
              example: 2500000
            },
            currency: {
              type: 'string',
              description: 'Código de moneda ISO 4217',
              enum: ['COP', 'USD'],
              example: 'COP'
            }
          }
        },
        PaymentIntegrityResponse: {
          type: 'object',
          properties: {
            integrity: {
              type: 'string',
              description: 'Hash SHA256 para validar la integridad del pago',
              example: 'cb895675de564d1845362e3caccb721f40deb68dda8b8c275b047510b06dde3b'
            },
            reference: {
              type: 'string',
              description: 'Referencia de la transacción',
              example: 'ORDER-001-2025'
            },
            amount_in_cents: {
              type: 'integer',
              description: 'Monto en centavos',
              example: 2500000
            },
            currency: {
              type: 'string',
              description: 'Moneda de la transacción',
              example: 'COP'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa',
              example: true
            },
            data: {
              description: 'Datos de respuesta (variable según endpoint)'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa',
              example: false
            },
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Recurso no encontrado'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Products',
        description: 'Gestión de productos del catálogo'
      },
      {
        name: 'Payments',
        description: 'Procesamiento de pagos y transacciones con Wompi'
      },
      {
        name: 'Health',
        description: 'Estado y salud de la API'
      }
    ]
  },
  apis: [
    './src/adapters/driving/web/routes/*.js',
    './src/adapters/driving/web/controllers/*.js',
    './src/index.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 