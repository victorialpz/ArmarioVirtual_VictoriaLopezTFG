import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const CATEGORIAS = ['Todas', 'Partes de arriba', 'Pantalones', 'Jerseys', 'Abrigos y chaquetas', 'Favoritos'];

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [prendas, setPrendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NUEVOS ESTADOS PARA EL DETALLE ---
  const [prendaSeleccionada, setPrendaSeleccionada] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarPrendas();
    }, [])
  );

  const cargarPrendas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('prendas')
        .select('*')
        .eq('id_usuario', user.id)
        .order('fecha_registro', { ascending: false });

      if (error) throw error;
      if (data) setPrendas(data);
    } catch (error: any) {
      Alert.alert('Error', 'No pudimos cargar tu armario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const prendasFiltradas = prendas.filter(prenda => {
    if (categoriaActiva === 'Todas') return true;
    if (categoriaActiva === 'Favoritos') return prenda.es_favorito;
    if (categoriaActiva === 'Partes de arriba') {
      return ['Partes de arriba', 'Jerseys', 'Abrigos y chaquetas', 'Camisas y blusas'].includes(prenda.categoria);
    }
    if (categoriaActiva === 'Pantalones') {
      return ['Pantalones', 'Faldas'].includes(prenda.categoria);
    }
    return prenda.categoria === categoriaActiva;
  });

  // --- FUNCIÓN PARA ABRIR EL DETALLE ---
  const verDetalle = (prenda: any) => {
    setPrendaSeleccionada(prenda);
    setModalVisible(true);
  };

  const renderPrenda = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cardPrenda} onPress={() => verDetalle(item)}>
      <View style={styles.imagenPrendaContenedor}>
        {item.es_favorito && (
          <MaterialCommunityIcons name="star" size={20} color="#a89078" style={styles.iconoFavorito} />
        )}
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.imagenMiniatura} />
        ) : (
          <MaterialCommunityIcons name="tshirt-crew" size={40} color="#5c4033" />
        )}
      </View>
      <Text style={styles.nombrePrenda} numberOfLines={1}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Ropa</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIAS_FILTRO}
          keyExtractor={(item) => item}
          style={styles.listaCategorias}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.pildoraCategoria, categoriaActiva === item && styles.pildoraActiva]}
              onPress={() => setCategoriaActiva(item)}
            >
              <Text style={[styles.textoCategoria, categoriaActiva === item && styles.textoCategoriaActiva]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#5c4033" /></View>
      ) : (
        <FlatList
          data={prendasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderPrenda}
          numColumns={2}
          contentContainerStyle={styles.gridPrendas}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="hanger" size={40} color="#ccc" />
              <Text style={styles.textoVacio}>No hay prendas aquí todavía.</Text>
            </View>
          }
        />
      )}

      {/* --- MODAL DE DETALLE (PRENDA EN GRANDE) --- */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* BOTÓN CERRAR */}
          <TouchableOpacity style={styles.botonCerrarDetalle} onPress={() => setModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {prendaSeleccionada && (
            <>
              {/* IMAGEN EN GRANDE */}
              <Image 
                source={{ uri: prendaSeleccionada.imagen_url }} 
                style={styles.imagenGrande} 
                resizeMode="contain"
              />

              {/* PANEL DE INFORMACIÓN (DESCRIPCIÓN) */}
              <View style={styles.infoPanel}>
                <Text style={styles.detalleNombre}>{prendaSeleccionada.nombre}</Text>
                
                <View style={styles.divisor} />
                
                <View style={styles.detalleFila}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color="#666" />
                  <Text style={styles.detalleTexto}>Categoría: <Text style={styles.bold}>{prendaSeleccionada.categoria}</Text></Text>
                </View>

                <View style={styles.detalleFila}>
                  <MaterialCommunityIcons name="palette-outline" size={20} color="#666" />
                  <Text style={styles.detalleTexto}>Color: <Text style={styles.bold}>{prendaSeleccionada.color}</Text></Text>
                </View>

                {prendaSeleccionada.fecha_registro && (
                  <Text style={styles.textoFecha}>
                    Añadida el {new Date(prendaSeleccionada.fecha_registro).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  listaCategorias: { flexGrow: 0 },
  pildoraCategoria: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  pildoraActiva: { backgroundColor: '#5c4033' },
  textoCategoria: { color: '#666', fontWeight: '600' },
  textoCategoriaActiva: { color: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridPrendas: { padding: 10 },
  cardPrenda: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', elevation: 2 },
  imagenPrendaContenedor: { width: '100%', height: 120, backgroundColor: '#f9f5f3', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imagenMiniatura: { width: '100%', height: '100%', borderRadius: 8 },
  iconoFavorito: { position: 'absolute', top: 4, left: 4, zIndex: 1 },
  nombrePrenda: { fontSize: 14, color: '#333', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  textoVacio: { marginTop: 10, color: '#888' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#5c4033', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  // --- ESTILOS DEL DETALLE (MODAL) ---
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  botonCerrarDetalle: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 },
  imagenGrande: { width: width, height: width * 1.3 },
  infoPanel: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10
  },
  detalleNombre: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  divisor: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  detalleFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detalleTexto: { fontSize: 16, color: '#555', marginLeft: 10 },
  bold: { fontWeight: 'bold', color: '#333' },
  textoFecha: { fontSize: 12, color: '#999', marginTop: 15, textAlign: 'right' }
});