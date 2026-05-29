export interface Service {
  codigo: string;
  descripcion: string;
  precio: number;
}

export const initialServices: Service[] = [
  { codigo: "SRV-001", descripcion: "Primer servicio", precio: 60 },
  { codigo: "SRV-002", descripcion: "Segundo servicio", precio: 100 },
  { codigo: "SRV-003", descripcion: "Mano de obra técnica", precio: 160 },
  {
    codigo: "SRV-004",
    descripcion: "Cambio de aceite hidráulico y filtros",
    precio: 120,
  },
];
