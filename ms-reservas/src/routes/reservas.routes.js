// PRESENTACIÓN: método HTTP + URI -> controlador, con los permisos por rol
const { Router } = require('express');
const controller = require('../controllers/reservas.controller');
const asyncHandler = require('../utils/asyncHandler');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken); // todas las rutas exigen token

router.get('/', asyncHandler(controller.listar));      // cualquier rol autenticado
router.get('/:id', asyncHandler(controller.obtener));

router.post('/', requiereRol('administrador'), asyncHandler(controller.crear));
router.put('/:id', requiereRol('administrador'), asyncHandler(controller.actualizar));
router.delete('/:id', requiereRol('administrador'), asyncHandler(controller.eliminar));

module.exports = router;
