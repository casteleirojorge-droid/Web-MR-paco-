import { Router } from 'express';
import { registrarEntrada } from '../controllers/EntradaControllers';

const router = Router();

// Ruta oficial: POST /api/entradas
// (Nota: Más adelante le pondremos el escudo JWT aquí para que solo los Jefes puedan registrar compras)
router.post('/', registrarEntrada);

export default router;