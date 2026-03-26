// Archivo: models/types.ts

export interface Prenda {
  id: string;
  nombre: string;
  categoria: string;         
  color: string;               
  tejido: string;              
  temperaturaLavado: number;  
  esDelicado: boolean;        
  tipoAlmacenamiento: 'colgar' | 'doblar'; 
  icono: string;              
  esFavorito: boolean;        
}