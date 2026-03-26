import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. IMPORTAMOS NUESTROS DATOS Y EL MODELO
import { INVENTARIO_MOCK } from '@/data/mockData';
import { Prenda } from '@/models/tipo';

// Categorías extraídas de tu prototipo (Página 4)
const CATEGORIAS = ['Todas', 'Partes de arriba', 'Pantalones', 'Jerseys', 'Abrigos y chaquetas', 'Favoritos'];

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  // 2. LÓGICA DE FILTRADO INTELIGENTE
  const prendasFiltradas = INVENTARIO_MOCK.filter(prenda => {
    // Si elige "Todas", lo devolvemos todo
    if (categoriaActiva === 'Todas') return true;
    
    // Si elige "Favoritos", miramos el campo booleano
    if (categoriaActiva === 'Favoritos') return prenda.esFavorito;

    // MAGIA: Agrupamos subcategorías lógicas
    if (categoriaActiva === 'Partes de arriba') {
      // Si la prenda es cualquiera de estas cosas, la consideramos parte de arriba
      return ['Partes de arriba', 'Jerseys', 'Abrigos y chaquetas', 'Camisas y blusas'].includes(prenda.categoria);
    }

    if (categoriaActiva === 'Pantalones' || categoriaActiva === 'Partes de abajo') {
      return ['Pantalones', 'Faldas', 'Partes de abajo'].includes(prenda.categoria);
    }

    // Para el resto de filtros (ej. si toca específicamente el botón "Jerseys")
    return prenda.categoria === categoriaActiva;
  });

  // 3. FUNCIÓN PARA DIBUJAR CADA TARJETA
  const renderPrenda = ({ item }: { item: Prenda }) => (
    <TouchableOpacity style={styles.cardPrenda}>
      <View style={styles.imagenPrenda}>
        
        {/* Estrella de favorito inspirada en la página 6 de tu prototipo */}
        {item.esFavorito && (
          <MaterialCommunityIcons 
            name="star" 
            size={24} 
            color="#a89078" // Un tono dorado/marrón claro
            style={styles.iconoFavorito} 
          />
        )}
        
        <MaterialCommunityIcons name={item.icono as any} size={50} color="#5c4033" />
      </View>
      
      <Text style={styles.nombrePrenda} numberOfLines={1}>{item.nombre}</Text>
      <Text style={styles.tejidoPrenda}>{item.tejido}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* CABECERA Y FILTROS */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Ropa</Text>
        
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

      {/* CUADRÍCULA DE PRENDAS */}
      <FlatList
        data={prendasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderPrenda}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridPrendas}
        // Mensaje por si la categoría no tiene ropa aún
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="hanger" size={40} color="#ccc" />
            <Text style={styles.textoVacio}>No hay prendas en esta categoría.</Text>
          </View>
        }
      />

      {/* BOTÓN FLOTANTE PARA AÑADIR (FAB) */}
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
    backgroundColor: '#5c4033',
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
    width: '100%',
    height: 100,
    backgroundColor: '#f9f5f3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative', // Necesario para posicionar la estrella
  },
  iconoFavorito: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 1,
  },
  nombrePrenda: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  tejidoPrenda: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  textoVacio: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
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