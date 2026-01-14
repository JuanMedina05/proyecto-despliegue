const express = require('express');
const cors = require('cors');
require('dotenv').config(); // carga variables de entorno

const app = express();
const port = process.env.PORT || 5000;

// Configuración CORS: permite solo el frontend servido por Nginx
app.use(cors({
  origin: 'https://localhost'
}));

// Ruta de prueba
app.get('/api/saludo', (req, res) => {
    res.json({ mensaje: '¡Hola desde el backend!' });
});
app.get('/api/despedida', (req, res) => {
  res.json({ mensaje: '¡Adiós desde el backend!' });
});
app.get('/api/servidor', (req, res) => {
  res.json({ mensaje: '¡Soy el servidor!' });
});

app.listen(port, () => console.log(`Backend escuchando en ${port}`));

