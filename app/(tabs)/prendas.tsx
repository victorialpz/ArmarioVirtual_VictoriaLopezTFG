import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. DATOS DE PRUEBA (Mock data)
// Cuando conectes tu base de datos, esto vendrá de ahí.
const PRENDAS_MOCK = [
  { id: '1', nombre: 'Camiseta Básica', categoria: 'Partes de arriba', icono: 'tshirt-crew' },
  { id: '2', nombre: 'Vaqueros Azules', categoria: 'Partes de abajo', icono: 'jeans' },
  { id: '3', nombre: 'Chaqueta Cuero', categoria: 'Abrigos', icono: 'jacket' },
  { id: '4', nombre: 'Deportivas Blancas', categoria: 'Calzado', icono: 'shoe-sneaker' },
  { id: '5', nombre: 'Sudadera Gris', categoria: 'Partes de arriba', icono: 'hoodie' },
  { id: '6', nombre: 'Pantalón Corto', categoria: 'Partes de abajo', icono: 'shorts' },
];

const CATEGORIAS = ['Todas', 'Partes de arriba', 'Partes de abajo', 'Abrigos', 'Calzado'];

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  // Función para dibujar cada prenda de la cuadrícula
  const renderPrenda = ({ item }: any) => (
    <TouchableOpacity style={styles.cardPrenda}>
      <View style={styles.imagenPrenda}>
        {/* Usamos iconos de ropa temporales hasta que tengas fotos reales */}
        <MaterialCommunityIcons name={item.icono} size={50} color="#5c4033" />
      </View>
      <Text style={styles.nombrePrenda} numberOfLines={1}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* 2. CABECERA Y FILTROS */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Ropa</Text>
        
        {/* Píldoras de categorías desplazables */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIAS}
          keyExtractor={(item) => item}
          style={styles.listaCategorias}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.pildoraCategoria, 
                categoriaActiva === item && styles.pildoraActiva
              ]}
              onPress={() => setCategoriaActiva(item)}
            >
              <Text style={[
                styles.textoCategoria,
                categoriaActiva === item && styles.textoCategoriaActiva
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 3. CUADRÍCULA DE PRENDAS */}
      <FlatList
        data={PRENDAS_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderPrenda}
        numColumns={2} // ¡La magia para hacer la cuadrícula!
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridPrendas}
      />

      {/* 4. BOTÓN FLOTANTE PARA AÑADIR (FAB) */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

// --- ESTILOS VISUALES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listaCategorias: {
    flexGrow: 0,
  },
  pildoraCategoria: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  pildoraActiva: {
    backgroundColor: '#5c4033', // Tu color corporativo
  },
  textoCategoria: {
    color: '#666',
    fontWeight: '600',
  },
  textoCategoriaActiva: {
    color: '#fff',
  },
  gridPrendas: {
    padding: 10,
  },
  cardPrenda: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imagenPrenda: {
    width: 100,
    height: 100,
    backgroundColor: '#f9f5f3', // Un tono muy suave derivado de tu marrón
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nombrePrenda: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#5c4033',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
