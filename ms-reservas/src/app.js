// CONFIGURACIÓN: registro de peticiones, middlewares, /health, rutas y manejo de errores
const express = require('express');
const reservasRoutes = require('./routes/reservas.routes');

const app = express();

// Registro: al terminar cada petición escribe hora, método, ruta y código de respuesta
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

// Convierte el cuerpo JSON de la petición en un objeto (req.body)
app.use(express.json());

// Estado del servicio (público, para comprobar que está vivo)
app.get('/health', (req, res) => {
  res.status(200).json({ servicio: 'ms-reservas', estado: 'ok' });
});

app.use('/reservas', reservasRoutes);

// Cualquier otra ruta: 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo de errores: todos responden con el mismo formato
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.status) {
    const cuerpo = { error: err.message };
    if (err.detalles) cuerpo.detalles = err.detalles;
    return res.status(err.status).json(cuerpo);
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
