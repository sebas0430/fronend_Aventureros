// HU-22 — Lanes / Swimlanes dentro de un Pool
export interface Lane {
  id?: number;
  nombre: string;
  descripcion?: string;
  poolId: number;
  usuarioId?: number;
}
