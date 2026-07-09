import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { conectarDB } from './config/db';
import productoRoutes from './routes/ProductoRoutes'; 
import pedidoRoutes from './routes/PedidoRoutes'; 
import metricaRoutes from './routes/MetricaRoutes'; 
import authRoutes from './routes/AuthRoutes';    
import ingredientesRoutes from './routes/IngredientesRoutes'; 
import usuarioRoutes from './routes/UsuarioRoutes'; 
import entradaRoutes from './routes/EntradaRoutes';

// 1. CARGAR VARIABLES DE ENTORNO LO PRIMERO
dotenv.config();

// 2. CONECTAR A LA BASE DE DATOS
conectarDB();

const app = express();
// 3. PUERTO DINÁMICO (Ahora sí leerá el .env correctamente)
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// === RUTAS DE LA API ===
app.use('/api/productos', productoRoutes); // Rutas de productos
app.use('/api/pedidos', pedidoRoutes); // Rutas de pedidos
app.use('/api/metricas', metricaRoutes); // Rutas de métricas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/ingredientes', ingredientesRoutes); // Rutas de ingredientes
app.use('/api/usuarios', usuarioRoutes); // Rutas de usuarios
app.use('/api/entradas', entradaRoutes); // Rutas de entradas
// Ruta de prueba base
app.get('/', (req: Request, res: Response) => {
  res.send('El servidor de Mr. Paco esta vivo y funcionando con TypeScript!');
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});