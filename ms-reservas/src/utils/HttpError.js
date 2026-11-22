// Error con código de estado HTTP: lo lanza el servicio y lo traduce app.js
class HttpError extends Error {
  constructor(status, message, detalles) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}
module.exports = HttpError;
