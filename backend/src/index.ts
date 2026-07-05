import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { conectarDB } from './config/db';
import productoRoutes from './routes/ProductoRoutes'; // Importamos nuestras rutas
import pedidoRoutes from './routes/PedidoRoutes'; // Importamos nuestras rutas de pedidos
import metricaRoutes from './routes/MetricaRoutes'; // Importamos nuestras rutas de métricas
import authRoutes from './routes/AuthRoutes'; // Importamos nuestras rutas de autenticación   
import ingredientesRoutes from './routes/IngredientesRoutes'; // Importamos nuestras rutas de ingredientes
import usuarioRoutes from './routes/UsuarioRoutes'; // Importamos nuestras rutas de usuarios

// Conectar a la base de datos
conectarDB();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Lee el archivo .env y carga el JWT_SECRET en la memoria del servidor
dotenv.config();

// === RUTAS DE LA API ===
app.use('/api/productos', productoRoutes); // Rutas de productos
app.use('/api/pedidos', pedidoRoutes); // Rutas de pedidos
app.use('/api/metricas', metricaRoutes); // Rutas de métricas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/ingredientes', ingredientesRoutes); // Rutas de ingredientes
app.use('/api/usuarios', usuarioRoutes); // Rutas de usuarios
// Ruta de prueba base
app.get('/', (req: Request, res: Response) => {
  res.send('El servidor de Mr. Paco esta vivo y funcionando con TypeScript!');
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});