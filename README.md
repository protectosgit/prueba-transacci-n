# Payment Processing API - Backend

API de procesamiento de pagos con integración a Wompi, construida con arquitectura hexagonal.

## 🚀 Despliegue en AWS Amplify

### Prerrequisitos
- Cuenta de AWS con acceso a Amplify
- Base de datos PostgreSQL (RDS recomendado)
- Credenciales de Wompi (staging o producción)

### Configuración paso a paso

#### 1. Variables de Entorno en AWS Amplify
Configura las siguientes variables en la consola de Amplify:

```bash
# Aplicación
NODE_ENV=production
PORT=3000

# Base de datos PostgreSQL
DB_HOST=tu-host-rds.amazonaws.com
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario_db
DB_PASSWORD=password_db

# Wompi (Producción)
WOMPI_API_URL=https://api.wompi.co/v1
WOMPI_PUBLIC_KEY=pub_prod_tu_clave_publica
WOMPI_PRIVATE_KEY=prv_prod_tu_clave_privada
WOMPI_EVENTS_KEY=prod_events_tu_clave_eventos
WOMPI_INTEGRITY_KEY=prod_integrity_tu_clave_integridad
```

#### 2. Configuración del Repositorio
- Conecta tu repositorio GitHub/GitLab a AWS Amplify
- Selecciona la rama que quieres desplegar
- AWS Amplify detectará automáticamente el archivo `amplify.yml`

#### 3. Build Settings
El archivo `amplify.yml` ya está configurado con:
- Instalación de dependencias con `npm ci`
- Build del proyecto
- Cache de `node_modules`

## 📦 Scripts disponibles

```bash
npm start          # Inicia el servidor en producción
npm run dev        # Inicia en modo desarrollo con nodemon
npm run build      # Instala dependencias de producción
npm run prod       # Inicia en modo producción explícito
npm test           # Ejecuta las pruebas
```

## 🏗️ Arquitectura

### Estructura del proyecto
```
src/
├── adapters/           # Adaptadores (web, persistence, external)
├── application/        # Casos de uso y DTOs
├── config/            # Configuración
├── domain/            # Entidades y reglas de negocio
├── infrastructure/    # Base de datos y configuraciones
└── utils/             # Utilidades
```

### Endpoints principales
- `GET /api/products` - Lista todos los productos
- `POST /api/payments/create-transaction` - Crea transacción
- `POST /api/payments/process` - Procesa pago con Wompi
- `GET /api/payments/:id/status` - Estado del pago
- `GET /api/payments/:id/check-wompi` - Verifica estado en Wompi

## 🔧 Configuración de Base de Datos

### PostgreSQL en AWS RDS
1. Crea una instancia RDS PostgreSQL
2. Configura security groups para permitir conexiones desde Amplify
3. Las migraciones se ejecutan automáticamente al iniciar

### Variables de entorno requeridas
Copia `env.example` y configura tus valores:
```bash
cp env.example .env
```

## 🔐 Seguridad

- Variables de entorno para credenciales sensibles
- CORS configurado para dominios específicos
- Validación de integridad en webhooks de Wompi

## 📱 Integración con Frontend

El backend está diseñado para trabajar con el frontend React/TypeScript incluido en el proyecto.

### CORS
Asegúrate de configurar las URLs del frontend en las variables de entorno de CORS si es necesario.

## 🧪 Testing

```bash
npm test                    # Ejecuta todas las pruebas
npm test -- --coverage     # Con reporte de cobertura
```

## 📋 Troubleshooting

### Problemas comunes en AWS Amplify

1. **Error de build**: Verifica que todas las variables de entorno estén configuradas
2. **Conexión a BD**: Revisa security groups y VPC settings
3. **Puerto**: AWS Amplify usa PORT=3000 por defecto

### Logs
Revisa los logs en la consola de AWS Amplify para debugging.

## 🔄 CI/CD

El despliegue es automático cuando se hace push a la rama configurada:
1. AWS Amplify detecta cambios
2. Ejecuta `npm ci` para instalar dependencias
3. Ejecuta `npm run build`
4. Despliega automáticamente

## 📞 Soporte

Para issues relacionados con:
- **Wompi**: Revisa la documentación oficial
- **AWS**: Consulta la documentación de Amplify
- **Base de datos**: Verifica configuración de RDS 