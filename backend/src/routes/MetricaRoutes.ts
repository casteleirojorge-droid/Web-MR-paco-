import { Router } from 'express';
import { obtenerCierreDiario } from '../controllers/MetricaControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';
const router = Router();

// Ruta: /api/metricas/cierre-diario
router.get('/cierre-diario', verificarToken, verificarRol(['admin']), obtenerCierreDiario);

export default router;