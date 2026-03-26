import { Prenda } from '../models/tipo';

export const INVENTARIO_MOCK: Prenda[] = [
  {
    id: '1',
    nombre: 'Jersey Grueso',
    categoria: 'Jerseys',
    color: 'Gris',
    tejido: 'Lana',
    temperaturaLavado: 30,
    esDelicado: true,
    tipoAlmacenamiento: 'doblar', // Porque la lana se da de sí en percha
    icono: 'tshirt-crew', // Usamos tshirt-crew o sweater según lo que acepte tu MaterialCommunityIcons
    esFavorito: true,
  },
  {
    id: '2',
    nombre: 'Vaquero Recto',
    categoria: 'Pantalones',
    color: 'Azul oscuro',
    tejido: 'Denim',
    temperaturaLavado: 40,
    esDelicado: false,
    tipoAlmacenamiento: 'colgar', // Porque los vaqueros van en la barra
    icono: 'tshirt-crew', // Icono genérico temporal
    esFavorito: false,
  },
  {
    id: '3',
    nombre: 'Camiseta Básica',
    categoria: 'Partes de arriba',
    color: 'Blanco',
    tejido: 'Algodón',
    temperaturaLavado: 30,
    esDelicado: false,
    tipoAlmacenamiento: 'doblar',
    icono: 'tshirt-crew',
    esFavorito: true,
  },
  {
    id: '4',
    nombre: 'Chaqueta de Cuero',
    categoria: 'Abrigos y chaquetas',
    color: 'Negro',
    tejido: 'Cuero',
    temperaturaLavado: 0, // No se lava en lavadora
    esDelicado: true,
    tipoAlmacenamiento: 'colgar',
    icono: 'tshirt-crew',
    esFavorito: false,
  }
];