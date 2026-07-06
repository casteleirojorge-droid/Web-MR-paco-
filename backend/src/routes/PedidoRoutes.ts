import { Router } from 'express';
import { procesarCierreManual, obtenerCajaDeHoy, obtenerHistorialCierres } from '../controllers/PedidoControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';
import { eliminarIngrediente } from '../controllers/IngredientesControllers';

const router = Router();

router.post('/cierre-manual', verificarToken, esAdmin, procesarCierreManual);
router.get('/caja-hoy', verificarToken, esAdmin, obtenerCajaDeHoy);
// NUEVA RUTA PARA CONTABILIDAD
router.get('/historial', verificarToken, esAdmin, obtenerHistorialCierres);
// NUEVA RUTA PARA ELIMINAR INGREDIENTE
router.delete('/:id', verificarToken, esAdmin, eliminarIngrediente);
export default router;