// LÓGICA DE NEGOCIO: validaciones y reglas. No conoce HTTP ni dónde se guardan los datos.
const repo = require('../repositories/reservas.repository');
const { validarReserva, construirReserva } = require('../models/reserva');
const HttpError = require('../utils/HttpError');

function leerId(idTexto) {
  if (!/^\d+$/.test(String(idTexto)) || Number(idTexto) < 1) {
    throw new HttpError(400, 'El id debe ser un número entero positivo');
  }
  return Number(idTexto);
}

async function listar(filtros = {}) {
  return repo.findAll(filtros);
}

async function obtener(idTexto) {
  const id = leerId(idTexto);
  const reserva = await repo.findById(id);
  if (!reserva) throw new HttpError(404, `No existe la reserva con id ${id}`);
  return reserva;
}

async function crear(datos) {
  const errores = validarReserva(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const reserva = construirReserva(datos);
  // Regla de negocio: el código de una reserva no se puede repetir (409 = Conflict)
  if (await repo.findByCodigo(reserva.codigo)) {
    throw new HttpError(409, `Ya existe una reserva con el codigo ${reserva.codigo}`);
  }
  return repo.create(reserva);
}

async function actualizar(idTexto, datos) {
  const id = leerId(idTexto);
  if (!(await repo.findById(id))) throw new HttpError(404, `No existe la reserva con id ${id}`);

  const errores = validarReserva(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const reserva = construirReserva(datos);
  // Misma regla, pero la reserva sí puede conservar su propio código
  const otra = await repo.findByCodigo(reserva.codigo);
  if (otra && otra.id !== id) {
    throw new HttpError(409, `Ya existe una reserva con el codigo ${reserva.codigo}`);
  }
  return repo.update(id, reserva);
}

async function eliminar(idTexto) {
  const id = leerId(idTexto);
  if (!(await repo.remove(id))) throw new HttpError(404, `No existe la reserva con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
