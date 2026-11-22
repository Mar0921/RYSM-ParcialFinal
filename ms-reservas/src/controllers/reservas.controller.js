// PRESENTACIÓN: traduce HTTP <-> servicio (código de estado + JSON)
const service = require('../services/reservas.service');

// GET /reservas y GET /reservas?huesped=Ana
async function listar(req, res) {
  const filtros = { huesped: req.query.huesped };
  res.status(200).json(await service.listar(filtros));
}

async function obtener(req, res) {
  res.status(200).json(await service.obtener(req.params.id));
}

async function crear(req, res) {
  const nueva = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nueva.id}`).json(nueva);
}

async function actualizar(req, res) {
  res.status(200).json(await service.actualizar(req.params.id, req.body));
}

async function eliminar(req, res) {
  await service.eliminar(req.params.id);
  res.status(204).end(); // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
