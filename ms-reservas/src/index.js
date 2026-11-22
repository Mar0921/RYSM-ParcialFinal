// ARRANQUE: lee PORT y HOST y pone el servidor a escuchar
const app = require('./app');

const PORT = process.env.PORT || 3011;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`ms-reservas escuchando en http://${HOST}:${PORT}`);
});
