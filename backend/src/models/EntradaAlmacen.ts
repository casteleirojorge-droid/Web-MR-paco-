import mongoose, { Schema, Document } from 'mongoose';

export interface IEntradaAlmacen extends Document {
  ingrediente: mongoose.Types.ObjectId;
  cantidadComprada: number;
  costoOriginal: number; // Costo en la moneda de la factura (USD/EUR/CUP)
  tasaCambio: number; // Tasa aplicada en el momento exacto
  costoTotalCUP: number; // Equivalencia real contable
  moneda: 'CUP' | 'USD' | 'EUR';
  proveedor?: string;
  fechaEntrada: Date;
}

const EntradaAlmacenSchema: Schema = new Schema({
  ingrediente: { 
    type: Schema.Types.ObjectId, 
    ref: 'Ingrediente', 
    required: true 
  },
  cantidadComprada: { 
    type: Number, 
    required: true 
  },
  costoOriginal: { 
    type: Number, 
    required: true 
  },
  tasaCambio: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  costoTotalCUP: { 
    type: Number, 
    required: true 
  },
  moneda: {
    type: String,
    enum: ['CUP', 'USD', 'EUR'],
    required: true
  },
  proveedor: { 
    type: String 
  },
  fechaEntrada: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model<IEntradaAlmacen>('EntradaAlmacen', EntradaAlmacenSchema);