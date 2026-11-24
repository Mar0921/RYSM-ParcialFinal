
// PRESENTACIÓN: traduce HTTP <-> servicio.
const service = require('../services/reservas.service');

async function listar(req, res) {
  const filtros = { huesped: req.query.huesped };
  res.status(200).json(await service.listar(filtros));
}

async function obtener(req, res) {
  res.status(200).json(await service.obtener(req.params.id));
}

async function crear(req, res) {
  console.log('BODY RECIBIDO:', req.body);

  const nueva = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nueva.id}`).json(nueva);
}

async function actualizar(req, res) {
  res.status(200).json(
    await service.actualizar(req.params.id, req.body, req.headers.authorization)
  );
}

async function eliminar(req, res) {
  await service.eliminar(req.params.id);
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
