// --- TELAS Y ESTILOS ---
export const TIPOS_TELA = ['Algodón', 'Lana', 'Poliéster', 'Lino', 'Seda', 'Vaquero/Denim', 'Cuero', 'Gasa', 'Otro'];
export const ESTILOS_COMUNES = ['Diario', 'Casual', 'Elegante', 'Fiesta', 'Deportivo', 'Trabajo', 'Bohemio', 'Minimalista'];
export const OPCIONES_CATEGORIA = ['Top / Camiseta', 'Camisa / Blusa', 'Jersey / Sudadera', 'Pantalón', 'Falda', 'Vestido', 'Abrigo / Chaqueta', 'Zapatos / Calzado'];
export const CATEGORIAS_FILTRO = ['Todas', 'Favoritos', 'Tops', 'Pantalones', 'Faldas', 'Vestidos', 'Abrigos', 'Zapatos'];
// --- COLORES CON SUS CÓDIGOS VISUALES ---
export const COLORES_COMUNES = ['Blanco', 'Negro', 'Gris', 'Beige', 'Marrón', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Naranja', 'Rosa', 'Morado', 'Dorado', 'Plateado'];

export const MAPA_COLORES: Record<string, string> = {
  'Blanco': '#FFFFFF', 'Negro': '#000000', 'Gris': '#808080', 
  'Beige': '#F5F5DC', 'Marrón': '#8B4513', 'Azul': '#0000FF', 
  'Rojo': '#FF0000', 'Verde': '#008000', 'Amarillo': '#FFFF00', 
  'Naranja': '#FFA500', 'Rosa': '#FFC0CB', 'Morado': '#800080', 
  'Dorado': '#FFD700', 'Plateado': '#C0C0C0'
};

// --- BASE DE DATOS DE LAVADORAS ---
export const MARCAS_LAVADORAS = ['Bosch', 'Balay', 'Samsung', 'LG', 'Siemens', 'Beko', 'AEG', 'Zanussi'];

export const MODELOS_LAVADORAS: Record<string, string[]> = {
  'Bosch': ['Serie 2', 'Serie 4', 'Serie 6', 'Serie 8', 'HomeProfessional'],
  'Balay': ['Extra Silencio', 'AutoDosificación', 'Integrable'],
  'Samsung': ['EcoBubble', 'QuickDrive', 'AddWash', 'Bespoke'],
  'LG': ['Direct Drive', 'ThinQ', 'TurboWash'],
  'Siemens': ['iQ300', 'iQ500', 'iQ700', 'iQ800'],
  'Beko': ['AquaTech', 'ProSmart', 'IronFast'],
  'AEG': ['Serie 6000', 'Serie 7000', 'Serie 8000', 'Serie 9000'],
  'Zanussi': ['Lindo100', 'Lindo300', 'AutoAdjust']
};