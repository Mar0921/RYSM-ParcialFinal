
// ACCESO A DATOS: única capa que sabe dónde se guardan las reservas (MySQL).
const pool = require('../db');

// Listar reservas
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

// Buscar por ID
async function findById(id) {
  const [filas] = await pool.query(
    'SELECT * FROM reservas WHERE id = ?',
    [id]
  );

  return filas.length > 0 ? filas[0] : null;
}

// Buscar por código
async function findByCodigo(codigo) {
  const [filas] = await pool.query(
    'SELECT * FROM reservas WHERE codigo = ?',
    [codigo]
  );

  return filas.length > 0 ? filas[0] : null;
}

// Crear reserva incluyendo agencia_id
async function create(reserva) {
  console.log('RESERVA QUE LLEGA AL REPOSITORIO:', reserva);
  console.log('AGENCIA_ID:', reserva.agencia_id);

  const [resultado] = await pool.query(
    `INSERT INTO reservas
    (codigo, huesped, fecha_entrada, fecha_salida, personas, agencia_id)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      reserva.codigo,
      reserva.huesped,
      reserva.fecha_entrada,
      reserva.fecha_salida,
      reserva.personas,
      reserva.agencia_id
    ]
  );

  return findById(resultado.insertId);
}

// Actualizar reserva incluyendo agencia_id
async function update(id, reserva) {
  const [resultado] = await pool.query(
    `UPDATE reservas SET
    codigo = ?,
    huesped = ?,
    fecha_entrada = ?,
    fecha_salida = ?,
    personas = ?,
    agencia_id = ?
    WHERE id = ?`,
    [
      reserva.codigo,
      reserva.huesped,
      reserva.fecha_entrada,
      reserva.fecha_salida,
      reserva.personas,
      reserva.agencia_id,
      id
    ]
  );

  if (resultado.affectedRows === 0) return null;

  return findById(id);
}

// Eliminar reserva
async function remove(id) {
  const [resultado] = await pool.query(
    'DELETE FROM reservas WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByCodigo,
  create,
  update,
  remove
};
