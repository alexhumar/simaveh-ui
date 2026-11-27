import type { EntitySet } from '../api/generated/entities';

/**
 * Presentacion de cada entity set: lo que el contrato no sabe (textos, agrupacion, que mostrar).
 * La estructura (campos, tipos, relaciones) viene de la metadata generada.
 */
export interface EntityConfig {
  singular: string;
  plural: string;
  group: MenuGroup;
  /** Genero gramatical, para "Nuevo"/"Nueva". */
  femenino?: boolean;
  /** Columnas del listado (por defecto: todos los campos y relaciones simples). */
  listColumns?: string[];
  /** Campos de texto para la busqueda (por defecto: todos los string). */
  searchFields?: string[];
  /** Orden inicial del listado (por defecto: el primer campo a mostrar, o Id). */
  defaultSort?: string;
}

export const MENU_GROUPS = [
  'Vehículos',
  'Mantenimiento',
  'Repuestos e insumos',
  'Reparadores',
  'Personas',
  'Geografía',
  'Monedas',
  'Catálogos',
] as const;
export type MenuGroup = (typeof MENU_GROUPS)[number];

export const ENTITY_CONFIG = {
  // Vehiculos
  Automoviles: { singular: 'Automóvil', plural: 'Automóviles', group: 'Vehículos', defaultSort: 'Patente' },
  ModelosVehiculo: {
    singular: 'Modelo de vehículo',
    plural: 'Modelos de vehículo',
    group: 'Vehículos',
    defaultSort: 'Version',
  },
  GruposModelo: { singular: 'Grupo de modelo', plural: 'Grupos de modelo', group: 'Vehículos' },
  Marcas: { singular: 'Marca', plural: 'Marcas', group: 'Vehículos', femenino: true },
  CategoriasMarca: {
    singular: 'Categoría de marca',
    plural: 'Categorías de marca',
    group: 'Vehículos',
    femenino: true,
  },
  EquipamientosAirbags: {
    singular: 'Equipamiento de airbags',
    plural: 'Equipamientos de airbags',
    group: 'Vehículos',
    defaultSort: 'Id',
  },
  // Mantenimiento
  Mantenimientos: { singular: 'Mantenimiento', plural: 'Mantenimientos', group: 'Mantenimiento', defaultSort: 'Id' },
  ServiciosReparadores: {
    singular: 'Servicio de reparador',
    plural: 'Servicios de reparadores',
    group: 'Mantenimiento',
    defaultSort: 'FechaInicio',
  },
  PeriodicidadesMantenimiento: {
    singular: 'Periodicidad de mantenimiento',
    plural: 'Periodicidades de mantenimiento',
    group: 'Mantenimiento',
    femenino: true,
    defaultSort: 'Id',
  },
  // Repuestos e insumos
  Repuestos: {
    singular: 'Repuesto',
    plural: 'Repuestos',
    group: 'Repuestos e insumos',
    defaultSort: 'CodigoIdentificador',
  },
  KitsRepuestos: { singular: 'Kit de repuestos', plural: 'Kits de repuestos', group: 'Repuestos e insumos' },
  Piezas: { singular: 'Pieza', plural: 'Piezas', group: 'Repuestos e insumos', femenino: true },
  UbicacionesPieza: {
    singular: 'Ubicación de pieza',
    plural: 'Ubicaciones de pieza',
    group: 'Repuestos e insumos',
    femenino: true,
    defaultSort: 'Id',
  },
  Aceites: { singular: 'Aceite', plural: 'Aceites', group: 'Repuestos e insumos' },
  Fluidos: { singular: 'Fluido', plural: 'Fluidos', group: 'Repuestos e insumos' },
  Neumaticos: { singular: 'Neumático', plural: 'Neumáticos', group: 'Repuestos e insumos', defaultSort: 'Modelo' },
  PresionesNeumatico: {
    singular: 'Presión de neumático',
    plural: 'Presiones de neumático',
    group: 'Repuestos e insumos',
    femenino: true,
    defaultSort: 'Id',
  },
  FuentesEnergia: {
    singular: 'Fuente de energía',
    plural: 'Fuentes de energía',
    group: 'Repuestos e insumos',
    femenino: true,
  },
  // Reparadores
  EntidadesReparadoras: {
    singular: 'Entidad reparadora',
    plural: 'Entidades reparadoras',
    group: 'Reparadores',
    femenino: true,
  },
  Reparadores: { singular: 'Reparador', plural: 'Reparadores', group: 'Reparadores', defaultSort: 'Apellido' },
  // Personas
  Usuarios: { singular: 'Usuario', plural: 'Usuarios', group: 'Personas', defaultSort: 'Apellido' },
  Telefonos: { singular: 'Teléfono', plural: 'Teléfonos', group: 'Personas', defaultSort: 'Numero' },
  Direcciones: {
    singular: 'Dirección',
    plural: 'Direcciones',
    group: 'Personas',
    femenino: true,
    defaultSort: 'Calle',
  },
  // Geografia
  Paises: { singular: 'País', plural: 'Países', group: 'Geografía' },
  Provincias: { singular: 'Provincia', plural: 'Provincias', group: 'Geografía', femenino: true },
  Partidos: { singular: 'Partido', plural: 'Partidos', group: 'Geografía' },
  Localidades: { singular: 'Localidad', plural: 'Localidades', group: 'Geografía', femenino: true },
  // Monedas
  Monedas: { singular: 'Moneda', plural: 'Monedas', group: 'Monedas', femenino: true },
  TiposCambio: { singular: 'Tipo de cambio', plural: 'Tipos de cambio', group: 'Monedas', defaultSort: 'Fecha' },
  // Catalogos
  TiposDocumento: { singular: 'Tipo de documento', plural: 'Tipos de documento', group: 'Catálogos' },
  TiposEntidadReparadora: {
    singular: 'Tipo de entidad reparadora',
    plural: 'Tipos de entidad reparadora',
    group: 'Catálogos',
  },
  TiposFuenteEnergia: {
    singular: 'Tipo de fuente de energía',
    plural: 'Tipos de fuente de energía',
    group: 'Catálogos',
  },
  TiposTelefono: { singular: 'Tipo de teléfono', plural: 'Tipos de teléfono', group: 'Catálogos' },
} satisfies Record<EntitySet, EntityConfig>;

/**
 * Campos que representan a una entidad cuando aparece como relacion o en un selector,
 * por tipo (las navegaciones apuntan a tipos, que pueden ser abstractos como Persona).
 * Sin entrada: Nombre, si existe; si no, Id.
 */
export const TYPE_DISPLAY_FIELDS: Record<string, string[]> = {
  Automovil: ['Patente'],
  Vehiculo: ['Patente'],
  ModeloVehiculo: ['Version'],
  Reparador: ['Apellido', 'Nombre'],
  Usuario: ['Apellido', 'Nombre'],
  Persona: ['Apellido', 'Nombre'],
  Repuesto: ['CodigoIdentificador'],
  Recambio: ['CodigoIdentificador', 'Nombre'],
  Neumatico: ['Modelo'],
  Telefono: ['Numero'],
  Direccion: ['Calle', 'NumeroCalle'],
  TipoCambio: ['Fecha'],
  ServicioReparador: ['FechaInicio'],
  Mantenimiento: ['Accion', 'Id'],
  PresionNeumatico: ['RuedasDelanteras', 'RuedasTraseras'],
  PeriodicidadMantenimiento: ['Kilometros'],
  EquipamientoAirbags: ['Id'],
  UbicacionPieza: ['Id'],
};

/** Etiquetas de campos que no salen bien al separar el PascalCase. */
export const FIELD_LABELS: Record<string, string> = {
  Id: 'Id',
  CPA: 'CPA',
  DiametroLLanta: 'Diámetro de llanta',
  ViscosidadSAEBajaTemperatura: 'Viscosidad SAE baja temperatura',
  ViscosidadSAEAltaTemperatura: 'Viscosidad SAE alta temperatura',
  MonedaMontoRecambio: 'Moneda del monto de recambio',
  MonedaMontoManoObra: 'Moneda del monto de mano de obra',
  MontoManoObra: 'Monto de mano de obra',
  NumeroCalle: 'Número',
  EsDefault: 'Por defecto',
  Airbags: 'Airbags',
  TargetMantenimiento: 'Objetivo de mantenimiento',
  RecomendacionesModeloVehiculo: 'Modelos de vehículo que lo recomiendan',
};
