import mongoose, { Schema, Document } from 'mongoose';

export interface ICierreDiario extends Document {
  totalRecaudado: number; // Lo que paga el cliente (Bruto)
  costoTotal: number;     // Lo que nos costó hacerlo (Gastos)
  fecha: Date;
}

const CierreDiarioSchema: Schema = new Schema({
  totalRecaudado: { type: Number, required: true },
  costoTotal: { type: Number, default: 0 }, // Añadimos los costos aquí
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model<ICierreDiario>('CierreDiario', CierreDiarioSchema);