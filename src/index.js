require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./infrastructure/database/connection');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
// TODO: Importar y usar las rutas aquí

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar y sincronizar la base de datos
    await connectDB();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 