export interface DocumentoDTO {
  id: number;
  nombreArchivo: string;
  rutaArchivo?: string;
  tipoContenido: string;
  procesoId: number;
  createdAt: string;
}
