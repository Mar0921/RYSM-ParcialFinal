// Envuelve un controlador async para que sus errores lleguen al manejador de errores
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
