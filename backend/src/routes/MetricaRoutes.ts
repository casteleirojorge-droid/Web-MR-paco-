import { Router } from 'express';
import { obtenerReporteFinanciero } from '../controllers/MetricaControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';
const router = Router();

// Ruta: /api/metricas/reporte-financiero
router.get('/reporte-financiero', verificarToken, verificarRol(['admin']), obtenerReporteFinanciero);

export default router;