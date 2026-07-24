import { Request, Response } from 'express';
import EntradaAlmacen from '../models/EntradaAlmacen';

export const obtenerReporteFinanciero = async (req: Request, res: Response): Promise<void> => {
  try {
    const compras = await EntradaAlmacen.find().populate('ingrediente');
    
    let totalGastosCUP = 0;
    let totalUSD = 0;
    let totalEUR = 0;
    let totalCUP = 0;

    compras.forEach((item: any) => {
      totalGastosCUP += Number(item.costoTotalCUP || 0);
      if (item.moneda === 'USD') totalUSD += Number(item.costoOriginal || 0);
      if (item.moneda === 'EUR') totalEUR += Number(item.costoOriginal || 0);
      if (item.moneda === 'CUP') totalCUP += Number(item.costoOriginal || 0);
    });

    res.status(200).json({
      totalGastosCUP,
      desgloseMonedaOriginal: {
        CUP: totalCUP,
        USD: totalUSD,
        EUR: totalEUR
      },
      historialCompras: compras
    });
  } catch (error) {
    console.error("Error en reporte financiero:", error);
    res.status(500).json({ mensaje: 'Error al calcular los reportes financieros' });
  }
};