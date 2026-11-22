// MODELO: atributos de la entidad Reserva y su validación
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim() !== '';

// ¿Es una fecha real con formato AAAA-MM-DD? (rechaza 2026-02-31, por ejemplo)
function fechaValida(valor) {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

// Devuelve un arreglo de errores (vacío si todo está bien)
function validarReserva(datos = {}) {
  const errores = [];

  if (!esTextoNoVacio(datos.codigo) || datos.codigo.trim().length > 20) {
    errores.push('codigo es obligatorio, no puede estar vacío y tiene máximo 20 caracteres');
  }
  if (!esTextoNoVacio(datos.huesped) || datos.huesped.trim().length > 100) {
    errores.push('huesped es obligatorio, no puede estar vacío y tiene máximo 100 caracteres');
  }
  const entradaOk = fechaValida(datos.fecha_entrada);
  const salidaOk = fechaValida(datos.fecha_salida);
  if (!entradaOk) errores.push('fecha_entrada es obligatoria y debe ser una fecha válida AAAA-MM-DD');
  if (!salidaOk) errores.push('fecha_salida es obligatoria y debe ser una fecha válida AAAA-MM-DD');
  if (entradaOk && salidaOk && datos.fecha_salida <= datos.fecha_entrada) {
    errores.push('fecha_salida debe ser posterior a fecha_entrada');
  }
  if (!Number.isInteger(datos.personas) || datos.personas <= 0) {
    errores.push('personas es obligatorio y debe ser un entero mayor que 0');
  }
  return errores;
}

// Copia solo los atributos del contrato (descarta el resto) y recorta espacios
function construirReserva(datos) {
  return {
    codigo: datos.codigo.trim(),
    huesped: datos.huesped.trim(),
    fecha_entrada: datos.fecha_entrada,
    fecha_salida: datos.fecha_salida,
    personas: datos.personas,
  };
}

module.exports = { validarReserva, construirReserva };
