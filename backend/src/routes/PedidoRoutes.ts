import { Router } from 'express';
import { procesarCierreManual, obtenerCajaDeHoy, obtenerHistorialCierres } from '../controllers/PedidoControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';
import { eliminarIngrediente } from '../controllers/IngredientesControllers';

const router = Router();

router.post('/cierre-manual', verificarToken, verificarRol(['admin']), procesarCierreManual);
router.get('/caja-hoy', verificarToken, verificarRol(['admin']), obtenerCajaDeHoy);
// NUEVA RUTA PARA CONTABILIDAD
router.get('/historial', verificarToken, verificarRol(['admin']), obtenerHistorialCierres);
// NUEVA RUTA PARA ELIMINAR INGREDIENTE
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarIngrediente);
export default router;