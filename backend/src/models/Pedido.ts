import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para el elemento individual dentro del carrito de compras
export interface IItemPedido {
  producto: mongoose.Types.ObjectId;
  cantidad: number;
}

// Interfaz principal del Pedido para TypeScript
export interface IPedido extends Document {
  productos: IItemPedido[];
  total: number;
  metodoPago: 'efectivo' | 'tarjeta';
  estado: 'pendiente' | 'completado' | 'cancelado';
  fecha: Date;
}

// Sub-esquema para los productos del pedido (no necesita un ID propio)
const ItemPedidoSchema: Schema = new Schema({
  producto: { 
    type: Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  cantidad: { 
    type: Number, 
    required: true, 
    min: 1 
  }
}, { _id: false });

// Esquema principal del Pedido para MongoDB
const PedidoSchema: Schema = new Schema({
  productos: [ItemPedidoSchema],
  total: { 
    type: Number, 
    required: true 
  },
  metodoPago: { 
    type: String, 
    enum: ['efectivo', 'tarjeta'], 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'completado', 'cancelado'], 
    default: 'pendiente' 
  }
}, {
  timestamps: true // Esto nos dara la fecha exacta de la venta de forma automatica
});

export default mongoose.model<IPedido>('Pedido', PedidoSchema);