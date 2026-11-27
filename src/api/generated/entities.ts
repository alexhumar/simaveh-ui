/**
 * Generado por scripts/gen-entity-metadata.ts a partir de openapi/simaveh.json.
 * No editar a mano: se regenera con `npm run api:gen`.
 */
import type { EntityMeta } from '../../entities/types';

export type EntitySet = 'Aceites' | 'Automoviles' | 'CategoriasMarca' | 'Direcciones' | 'EntidadesReparadoras' | 'EquipamientosAirbags' | 'Fluidos' | 'FuentesEnergia' | 'GruposModelo' | 'KitsRepuestos' | 'Localidades' | 'Mantenimientos' | 'Marcas' | 'ModelosVehiculo' | 'Monedas' | 'Neumaticos' | 'Paises' | 'Partidos' | 'PeriodicidadesMantenimiento' | 'Piezas' | 'PresionesNeumatico' | 'Provincias' | 'Reparadores' | 'Repuestos' | 'ServiciosReparadores' | 'Telefonos' | 'TiposCambio' | 'TiposDocumento' | 'TiposEntidadReparadora' | 'TiposFuenteEnergia' | 'TiposTelefono' | 'UbicacionesPieza' | 'Usuarios';

export const ENTITY_SETS = ["Aceites","Automoviles","CategoriasMarca","Direcciones","EntidadesReparadoras","EquipamientosAirbags","Fluidos","FuentesEnergia","GruposModelo","KitsRepuestos","Localidades","Mantenimientos","Marcas","ModelosVehiculo","Monedas","Neumaticos","Paises","Partidos","PeriodicidadesMantenimiento","Piezas","PresionesNeumatico","Provincias","Reparadores","Repuestos","ServiciosReparadores","Telefonos","TiposCambio","TiposDocumento","TiposEntidadReparadora","TiposFuenteEnergia","TiposTelefono","UbicacionesPieza","Usuarios"] as const satisfies readonly EntitySet[];

export const ENTITY_METADATA: Record<EntitySet, EntityMeta> = {
  "Aceites": {
    "set": "Aceites",
    "type": "Aceite",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      },
      {
        "name": "ViscosidadSAEBajaTemperatura",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "ViscosidadSAEAltaTemperatura",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      }
    ],
    "navigations": [
      {
        "name": "RecomendacionesModeloVehiculo",
        "collection": true,
        "targetType": "ModeloVehiculo",
        "targetSets": [
          "ModelosVehiculo"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "Automoviles": {
    "set": "Automoviles",
    "type": "Automovil",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Kilometraje",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "AnioFabricacion",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      },
      {
        "name": "Patente",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "NumeroChasis",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "CodigoColorPintura",
        "nullable": true,
        "kind": "string"
      }
    ],
    "navigations": [
      {
        "name": "ModeloVehiculo",
        "collection": false,
        "targetType": "ModeloVehiculo",
        "targetSets": [
          "ModelosVehiculo"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Usuario",
        "collection": false,
        "targetType": "Usuario",
        "targetSets": [
          "Usuarios"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "ServiciosReparadores",
        "collection": true,
        "targetType": "ServicioReparador",
        "targetSets": [
          "ServiciosReparadores"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      }
    ]
  },
  "CategoriasMarca": {
    "set": "CategoriasMarca",
    "type": "CategoriaMarca",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Marcas",
        "collection": true,
        "targetType": "Marca",
        "targetSets": [
          "Marcas"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "Direcciones": {
    "set": "Direcciones",
    "type": "Direccion",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Calle",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "NumeroCalle",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Localidad",
        "collection": false,
        "targetType": "Localidad",
        "targetSets": [
          "Localidades"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "EntidadesReparadoras": {
    "set": "EntidadesReparadoras",
    "type": "EntidadReparadora",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "TipoEntidadReparadora",
        "collection": false,
        "targetType": "TipoEntidadReparadora",
        "targetSets": [
          "TiposEntidadReparadora"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "ServiciosReparadores",
        "collection": true,
        "targetType": "ServicioReparador",
        "targetSets": [
          "ServiciosReparadores"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "Reparadores",
        "collection": true,
        "targetType": "Reparador",
        "targetSets": [
          "Reparadores"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "Direccion",
        "collection": false,
        "targetType": "Direccion",
        "targetSets": [
          "Direcciones"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "EquipamientosAirbags": {
    "set": "EquipamientosAirbags",
    "type": "EquipamientoAirbags",
    "key": {
      "name": "Id",
      "kind": "string"
    },
    "fields": [
      {
        "name": "Id",
        "nullable": false,
        "kind": "string"
      },
      {
        "name": "Conductor",
        "nullable": false,
        "kind": "boolean"
      },
      {
        "name": "Acompanante",
        "nullable": false,
        "kind": "boolean"
      },
      {
        "name": "DelanteroIzquierdo",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "NoPosee",
          "Lateral",
          "Cortina",
          "Ambos"
        ]
      },
      {
        "name": "DelanteroDerecho",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "NoPosee",
          "Lateral",
          "Cortina",
          "Ambos"
        ]
      },
      {
        "name": "TraseroIzquierdo",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "NoPosee",
          "Lateral",
          "Cortina",
          "Ambos"
        ]
      },
      {
        "name": "TraseroDerecho",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "NoPosee",
          "Lateral",
          "Cortina",
          "Ambos"
        ]
      }
    ],
    "navigations": []
  },
  "Fluidos": {
    "set": "Fluidos",
    "type": "Fluido",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": []
  },
  "FuentesEnergia": {
    "set": "FuentesEnergia",
    "type": "FuenteEnergia",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Marca",
        "collection": false,
        "targetType": "Marca",
        "targetSets": [
          "Marcas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "TipoFuenteEnergia",
        "collection": false,
        "targetType": "TipoFuenteEnergia",
        "targetSets": [
          "TiposFuenteEnergia"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "RecomendacionesModeloVehiculo",
        "collection": true,
        "targetType": "ModeloVehiculo",
        "targetSets": [
          "ModelosVehiculo"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "GruposModelo": {
    "set": "GruposModelo",
    "type": "GrupoModelo",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Marca",
        "collection": false,
        "targetType": "Marca",
        "targetSets": [
          "Marcas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "KitsRepuestos": {
    "set": "KitsRepuestos",
    "type": "Kit",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      },
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      }
    ],
    "navigations": [
      {
        "name": "Marca",
        "collection": false,
        "targetType": "Marca",
        "targetSets": [
          "Marcas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Repuestos",
        "collection": true,
        "targetType": "Repuesto",
        "targetSets": [
          "Repuestos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "Localidades": {
    "set": "Localidades",
    "type": "Localidad",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "CPA",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Partido",
        "collection": false,
        "targetType": "Partido",
        "targetSets": [
          "Partidos"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "Mantenimientos": {
    "set": "Mantenimientos",
    "type": "Mantenimiento",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Accion",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "Reparacion",
          "Reemplazo"
        ]
      },
      {
        "name": "MontoRecambio",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Recambio",
        "collection": false,
        "targetType": "Recambio",
        "targetSets": [
          "KitsRepuestos",
          "Repuestos"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "MonedaMontoRecambio",
        "collection": false,
        "targetType": "Moneda",
        "targetSets": [
          "Monedas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "ServicioReparador",
        "collection": false,
        "targetType": "ServicioReparador",
        "targetSets": [
          "ServiciosReparadores"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Reparador",
        "collection": false,
        "targetType": "Reparador",
        "targetSets": [
          "Reparadores"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "Marcas": {
    "set": "Marcas",
    "type": "Marca",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Categorias",
        "collection": true,
        "targetType": "CategoriaMarca",
        "targetSets": [
          "CategoriasMarca"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "ModelosVehiculo": {
    "set": "ModelosVehiculo",
    "type": "ModeloVehiculo",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Version",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "GrupoModelo",
        "collection": false,
        "targetType": "GrupoModelo",
        "targetSets": [
          "GruposModelo"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Airbags",
        "collection": false,
        "targetType": "EquipamientoAirbags",
        "targetSets": [
          "EquipamientosAirbags"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "TipoFuenteEnergia",
        "collection": false,
        "targetType": "TipoFuenteEnergia",
        "targetSets": [
          "TiposFuenteEnergia"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "AceitesRecomendados",
        "collection": true,
        "targetType": "Aceite",
        "targetSets": [
          "Aceites"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "FuentesEnergiaRecomendadas",
        "collection": true,
        "targetType": "FuenteEnergia",
        "targetSets": [
          "FuentesEnergia"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "RepuestosRecomendados",
        "collection": true,
        "targetType": "Repuesto",
        "targetSets": [
          "Repuestos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "PresionesNeumaticoRecomendadas",
        "collection": true,
        "targetType": "PresionNeumatico",
        "targetSets": [
          "PresionesNeumatico"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "Monedas": {
    "set": "Monedas",
    "type": "Moneda",
    "key": {
      "name": "Id",
      "kind": "string"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "string"
      }
    ],
    "navigations": []
  },
  "Neumaticos": {
    "set": "Neumaticos",
    "type": "Neumatico",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Modelo",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Tipo",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "Pasajero",
          "CamionLigero",
          "TrailerEspecial",
          "UsoTemporal"
        ]
      },
      {
        "name": "ConstruccionCarcasa",
        "nullable": false,
        "kind": "enum",
        "enumValues": [
          "CintasOpuestas",
          "Diagonal",
          "Radial"
        ]
      },
      {
        "name": "RelacionAnchoAlto",
        "nullable": true,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "DiametroLLanta",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "AnchuraSeccionalNominal",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "IndiceCarga",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "IndiceVelocidad",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Marca",
        "collection": false,
        "targetType": "Marca",
        "targetSets": [
          "Marcas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "Paises": {
    "set": "Paises",
    "type": "Pais",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Provincias",
        "collection": true,
        "targetType": "Provincia",
        "targetSets": [
          "Provincias"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      }
    ]
  },
  "Partidos": {
    "set": "Partidos",
    "type": "Partido",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Provincia",
        "collection": false,
        "targetType": "Provincia",
        "targetSets": [
          "Provincias"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Localidades",
        "collection": true,
        "targetType": "Localidad",
        "targetSets": [
          "Localidades"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      }
    ]
  },
  "PeriodicidadesMantenimiento": {
    "set": "PeriodicidadesMantenimiento",
    "type": "PeriodicidadMantenimiento",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Kilometros",
        "nullable": false,
        "kind": "integer"
      },
      {
        "name": "Dias",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "Meses",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "Anios",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "EsDefault",
        "nullable": false,
        "kind": "boolean"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "ModeloVehiculo",
        "collection": false,
        "targetType": "ModeloVehiculo",
        "targetSets": [
          "ModelosVehiculo"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Repuesto",
        "collection": false,
        "targetType": "Repuesto",
        "targetSets": [
          "Repuestos"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "Piezas": {
    "set": "Piezas",
    "type": "Pieza",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "UbicacionPieza",
        "collection": false,
        "targetType": "UbicacionPieza",
        "targetSets": [
          "UbicacionesPieza"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "PresionesNeumatico": {
    "set": "PresionesNeumatico",
    "type": "PresionNeumatico",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "RuedasDelanteras",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "RuedasTraseras",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "VehiculoCargado",
        "nullable": false,
        "kind": "boolean"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Neumatico",
        "collection": false,
        "targetType": "Neumatico",
        "targetSets": [
          "Neumaticos"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "RecomendacionesModeloVehiculo",
        "collection": true,
        "targetType": "ModeloVehiculo",
        "targetSets": [
          "ModelosVehiculo"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "Provincias": {
    "set": "Provincias",
    "type": "Provincia",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Pais",
        "collection": false,
        "targetType": "Pais",
        "targetSets": [
          "Paises"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Partidos",
        "collection": true,
        "targetType": "Partido",
        "targetSets": [
          "Partidos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      }
    ]
  },
  "Reparadores": {
    "set": "Reparadores",
    "type": "Reparador",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Apellido",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "NumeroDocumento",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "TipoDocumento",
        "collection": false,
        "targetType": "TipoDocumento",
        "targetSets": [
          "TiposDocumento"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Telefonos",
        "collection": true,
        "targetType": "Telefono",
        "targetSets": [
          "Telefonos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "EntidadesReparadoras",
        "collection": true,
        "targetType": "EntidadReparadora",
        "targetSets": [
          "EntidadesReparadoras"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "Repuestos": {
    "set": "Repuestos",
    "type": "Repuesto",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      },
      {
        "name": "CodigoIdentificador",
        "nullable": true,
        "kind": "string"
      }
    ],
    "navigations": [
      {
        "name": "Marca",
        "collection": false,
        "targetType": "Marca",
        "targetSets": [
          "Marcas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "TargetMantenimiento",
        "collection": false,
        "targetType": "TargetMantenimiento",
        "targetSets": [
          "Aceites",
          "Fluidos",
          "Piezas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "PeriodicidadesMantenimiento",
        "collection": true,
        "targetType": "PeriodicidadMantenimiento",
        "targetSets": [
          "PeriodicidadesMantenimiento"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "Kits",
        "collection": true,
        "targetType": "Kit",
        "targetSets": [
          "KitsRepuestos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      },
      {
        "name": "RecomendacionesModeloVehiculo",
        "collection": true,
        "targetType": "ModeloVehiculo",
        "targetSets": [
          "ModelosVehiculo"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": true
      }
    ]
  },
  "ServiciosReparadores": {
    "set": "ServiciosReparadores",
    "type": "ServicioReparador",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "FechaInicio",
        "nullable": false,
        "kind": "datetime"
      },
      {
        "name": "FechaFin",
        "nullable": false,
        "kind": "datetime"
      },
      {
        "name": "MontoManoObra",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "KilometrajeVehiculo",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "Mantenimientos",
        "collection": true,
        "targetType": "Mantenimiento",
        "targetSets": [
          "Mantenimientos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      },
      {
        "name": "EntidadReparadora",
        "collection": false,
        "targetType": "EntidadReparadora",
        "targetSets": [
          "EntidadesReparadoras"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Vehiculo",
        "collection": false,
        "targetType": "Vehiculo",
        "targetSets": [
          "Automoviles"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "MonedaMontoManoObra",
        "collection": false,
        "targetType": "Moneda",
        "targetSets": [
          "Monedas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "Telefonos": {
    "set": "Telefonos",
    "type": "Telefono",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Numero",
        "nullable": false,
        "kind": "integer",
        "min": -2147483648,
        "max": 2147483647
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "TipoTelefono",
        "collection": false,
        "targetType": "TipoTelefono",
        "targetSets": [
          "TiposTelefono"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Persona",
        "collection": false,
        "targetType": "Persona",
        "targetSets": [
          "Reparadores",
          "Usuarios"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "TiposCambio": {
    "set": "TiposCambio",
    "type": "TipoCambio",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "CoeficienteCambio",
        "nullable": false,
        "kind": "decimal"
      },
      {
        "name": "Fecha",
        "nullable": false,
        "kind": "datetime"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "MonedaOrigen",
        "collection": false,
        "targetType": "Moneda",
        "targetSets": [
          "Monedas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "MonedaDestino",
        "collection": false,
        "targetType": "Moneda",
        "targetSets": [
          "Monedas"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      }
    ]
  },
  "TiposDocumento": {
    "set": "TiposDocumento",
    "type": "TipoDocumento",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": []
  },
  "TiposEntidadReparadora": {
    "set": "TiposEntidadReparadora",
    "type": "TipoEntidadReparadora",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": []
  },
  "TiposFuenteEnergia": {
    "set": "TiposFuenteEnergia",
    "type": "TipoFuenteEnergia",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": []
  },
  "TiposTelefono": {
    "set": "TiposTelefono",
    "type": "TipoTelefono",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Descripcion",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": []
  },
  "UbicacionesPieza": {
    "set": "UbicacionesPieza",
    "type": "UbicacionPieza",
    "key": {
      "name": "Id",
      "kind": "string"
    },
    "fields": [
      {
        "name": "Id",
        "nullable": false,
        "kind": "string"
      },
      {
        "name": "Izquierda",
        "nullable": false,
        "kind": "boolean"
      },
      {
        "name": "Superior",
        "nullable": false,
        "kind": "boolean"
      }
    ],
    "navigations": []
  },
  "Usuarios": {
    "set": "Usuarios",
    "type": "Usuario",
    "key": {
      "name": "Id",
      "kind": "number"
    },
    "fields": [
      {
        "name": "Nombre",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Apellido",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "NumeroDocumento",
        "nullable": true,
        "kind": "string"
      },
      {
        "name": "Id",
        "nullable": false,
        "kind": "integer"
      }
    ],
    "navigations": [
      {
        "name": "TipoDocumento",
        "collection": false,
        "targetType": "TipoDocumento",
        "targetSets": [
          "TiposDocumento"
        ],
        "canSet": true,
        "canAdd": false,
        "canRemove": false
      },
      {
        "name": "Telefonos",
        "collection": true,
        "targetType": "Telefono",
        "targetSets": [
          "Telefonos"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      },
      {
        "name": "Vehiculos",
        "collection": true,
        "targetType": "Vehiculo",
        "targetSets": [
          "Automoviles"
        ],
        "canSet": false,
        "canAdd": true,
        "canRemove": false
      }
    ]
  }
};
