require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./infrastructure/database/connection');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// TODO: Importar y usar las rutas aquí

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Probar la conexión a la base de datos
    await testConnection();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 