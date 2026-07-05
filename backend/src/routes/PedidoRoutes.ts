import { Router } from 'express';
import { procesarCierreManual, obtenerCajaDeHoy, obtenerHistorialCierres } from '../controllers/PedidoControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';

const router = Router();

router.post('/cierre-manual', verificarToken, esAdmin, procesarCierreManual);
router.get('/caja-hoy', verificarToken, esAdmin, obtenerCajaDeHoy);
// NUEVA RUTA PARA CONTABILIDAD
router.get('/historial', verificarToken, esAdmin, obtenerHistorialCierres);

export default router;