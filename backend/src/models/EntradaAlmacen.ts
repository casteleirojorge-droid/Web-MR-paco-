import mongoose, { Schema, Document } from 'mongoose';

export interface IEntradaAlmacen extends Document {
  ingrediente: mongoose.Types.ObjectId; // El ID del producto que estamos comprando
  cantidadComprada: number; // Cuántos gramos, ml o unidades entraron
  costoTotal: number; // Cuánto pagaste en total por toda esta cantidad
  moneda: 'CUP' | 'USD';
  proveedor?: string; // Opcional: Para saber a quién se lo compraste
  fechaEntrada: Date;
}

const EntradaAlmacenSchema: Schema = new Schema({
  ingrediente: { 
    type: Schema.Types.ObjectId, 
    ref: 'Ingrediente', // Lo enlazamos directamente con tu catálogo
    required: true 
  },
  cantidadComprada: { 
    type: Number, 
    required: true 
  },
  costoTotal: { 
    type: Number, 
    required: true 
  },
  moneda: {
    type: String,
    enum: ['CUP', 'USD'],
    required: true
  },
  proveedor: { 
    type: String 
  },
  fechaEntrada: { 
    type: Date, 
    default: Date.now // Se pone la fecha de hoy automáticamente
  }
}, { timestamps: true });

export default mongoose.model<IEntradaAlmacen>('EntradaAlmacen', EntradaAlmacenSchema);