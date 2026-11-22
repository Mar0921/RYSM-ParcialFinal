// ACCESO A DATOS: única capa que sabe dónde se guardan las reservas (MySQL).
const pool = require('../db');

// filtros.huesped: reservas cuyo huésped contiene ese texto
async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM reservas';
  const valores = [];
  if (filtros.huesped) {
    sql += ' WHERE huesped LIKE ?';
    valores.push(`%${filtros.huesped}%`);
  }
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM reservas WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByCodigo(codigo) {
  const [filas] = await pool.query('SELECT * FROM reservas WHERE codigo = ?', [codigo]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(reserva) {
  const [resultado] = await pool.query(
    'INSERT INTO reservas (codigo, huesped, fecha_entrada, fecha_salida, personas) VALUES (?, ?, ?, ?, ?)',
    [reserva.codigo, reserva.huesped, reserva.fecha_entrada, reserva.fecha_salida, reserva.personas]
  );
  return findById(resultado.insertId);
}

async function update(id, reserva) {
  const [resultado] = await pool.query(
    'UPDATE reservas SET codigo = ?, huesped = ?, fecha_entrada = ?, fecha_salida = ?, personas = ? WHERE id = ?',
    [reserva.codigo, reserva.huesped, reserva.fecha_entrada, reserva.fecha_salida, reserva.personas, id]
  );
  if (resultado.affectedRows === 0) return null; // no existe
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM reservas WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByCodigo, create, update, remove };
