import { Router } from 'express';
import { obtenerCierreDiario } from '../controllers/MetricaControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';
const router = Router();

// Ruta: /api/metricas/cierre-diario
router.get('/cierre-diario', verificarToken, esAdmin, obtenerCierreDiario);

export default router;