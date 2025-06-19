# Variables de Entorno - Payment Processing API

## 🔧 Configuración Básica

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `NODE_ENV` | Entorno de ejecución | `development` | No |
| `PORT` | Puerto del servidor | `3000` | No |
| `HOST` | IP del servidor | `0.0.0.0` | No |

## 🌐 Configuración de CORS

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `CORS_ALLOWED_ORIGINS` | Lista de orígenes permitidos (separados por coma) | Lista predefinida de localhost y Amplify | No |
| `CORS_ALLOW_CREDENTIALS` | Permitir cookies/auth | `false` | No |
| `CORS_MAX_AGE` | Cache de preflight en segundos | `86400` (24h) | No |

### Ejemplo de CORS_ALLOWED_ORIGINS:
```env
CORS_ALLOWED_ORIGINS=https://main.d10nqda7yg14nv.amplifyapp.com,http://localhost:3000,https://mi-frontend.com
```

## 🎨 URLs del Frontend

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `FRONTEND_AMPLIFY_URL` | URL del frontend en Amplify | URL predefinida | No |
| `FRONTEND_DEV_URL` | URL del frontend en desarrollo | `http://localhost:3000` | No |
| `FRONTEND_PROD_URL` | URL del frontend en producción | URL de Amplify | No |

## 🗄️ Base de Datos

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `DATABASE_URL` | URL completa de conexión PostgreSQL | URL de Render | **Sí** |
| `DB_HOST` | Host de la base de datos | Host de Render | No |
| `DB_PORT` | Puerto de la base de datos | `5432` | No |
| `DB_NAME` | Nombre de la base de datos | `pasarela_db` | No |
| `DB_USER` | Usuario de la base de datos | `pasarela_db_user` | No |
| `DB_PASSWORD` | Contraseña de la base de datos | Password de Render | **Sí** |
| `DB_SSL` | Habilitar SSL | `true` en producción | No |

## 💳 Wompi (Pasarela de Pagos)

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `WOMPI_API_URL` | URL de la API de Wompi | Sandbox en dev, Producción en prod | No |
| `WOMPI_PUBLIC_KEY` | Clave pública de Wompi | Clave de sandbox | **Sí** |
| `WOMPI_PRIVATE_KEY` | Clave privada de Wompi | Clave de sandbox | **Sí** |
| `WOMPI_EVENTS_KEY` | Clave de eventos de Wompi | Clave de sandbox | **Sí** |
| `WOMPI_INTEGRITY_KEY` | Clave de integridad de Wompi | Clave de sandbox | **Sí** |

## 📊 Logging y Debugging

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `LOG_LEVEL` | Nivel de logging | `info` | No |
| `LOG_SQL` | Mostrar queries SQL | `false` | No |
| `LOG_REQUESTS` | Mostrar requests HTTP | `true` en desarrollo | No |

## 🔒 Seguridad

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (ms) | `900000` (15 min) | No |
| `RATE_LIMIT_MAX` | Máximo requests por ventana | `100` | No |
| `ENABLE_HELMET` | Habilitar headers de seguridad | `true` | No |

## 🚀 Configuración para Desarrollo Local

Crea un archivo `.env` en la raíz del proyecto:

```env
# Desarrollo local
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# CORS para desarrollo
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
CORS_ALLOW_CREDENTIALS=false

# Base de datos (usar la externa de Render)
DATABASE_URL=postgresql://pasarela_db_user:GSR9FS8hyclcsCFxjeMkhEkD4LXIpOzc@dpg-d1a3ebqdbo4c73c3hat0-a.oregon-postgres.render.com/pasarela_db

# Wompi (sandbox para desarrollo)
WOMPI_API_URL=https://sandbox.wompi.co/v1
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N
WOMPI_INTEGRITY_KEY=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp

# Logging para desarrollo
LOG_REQUESTS=true
LOG_SQL=false
```

## 🏭 Configuración para Producción (Render)

Las variables se configuran en el Dashboard de Render:

```env
# Producción
NODE_ENV=production
PORT=10000

# CORS para producción
CORS_ALLOWED_ORIGINS=https://main.d10nqda7yg14nv.amplifyapp.com,https://mi-frontend-prod.com
CORS_ALLOW_CREDENTIALS=false

# Wompi (claves reales de producción)
WOMPI_API_URL=https://api.wompi.co/v1
WOMPI_PUBLIC_KEY=tu_clave_publica_real
WOMPI_PRIVATE_KEY=tu_clave_privada_real
WOMPI_EVENTS_KEY=tu_clave_eventos_real
WOMPI_INTEGRITY_KEY=tu_clave_integridad_real

# Logging para producción
LOG_REQUESTS=false
LOG_SQL=false
```

## ⚠️ Notas Importantes

1. **Nunca commits claves reales** al repositorio
2. **Usa `sync: false`** en render.yaml para claves sensibles
3. **DATABASE_URL** se genera automáticamente en Render
4. **CORS_ALLOWED_ORIGINS** debe incluir tu dominio de frontend
5. **En desarrollo** usa las claves de sandbox de Wompi 