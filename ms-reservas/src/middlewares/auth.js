// SEGURIDAD: verifica el token JWT (401) y el rol (403).
// Cada microservicio verifica el token por su cuenta, con la misma JWT_SECRET de ms-usuarios.
// (Si ya tiene el auth.js de ms-usuarios, use ese: hace lo mismo.)
const jwt = require('jsonwebtoken');

// Exige Authorization: Bearer <token>. Falta, es inválido o venció -> 401.
function verificarToken(req, res, next) {
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env');
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { id, nombre, rol, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ error: err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido' });
  }
}

// Deja pasar solo a los roles indicados; a los demás, 403
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tiene permiso para esta operación' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };
