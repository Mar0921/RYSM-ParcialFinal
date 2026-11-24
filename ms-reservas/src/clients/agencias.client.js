const BASE_URL = process.env.AGENCIAS_URL || 'http://127.0.0.1:3012';

async function obtenerPorId(id, authorization) {
  try {
    const respuesta = await fetch(
      `${BASE_URL}/agencias/${id}`,
      {
        method: 'GET',
        headers: authorization
          ? { Authorization: authorization }
          : {},
        signal: AbortSignal.timeout(3000)
      }
    );

    if (respuesta.status === 404) {
      return null;
    }

    if (!respuesta.ok) {
      throw new Error(`Proveedor respondió HTTP ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (error) {
    const falloProveedor = new Error(
      'No fue posible comunicarse con el servicio de agencias'
    );
    falloProveedor.status = 503;
    falloProveedor.cause = error;
    throw falloProveedor;
  }
}

module.exports = { obtenerPorId };
