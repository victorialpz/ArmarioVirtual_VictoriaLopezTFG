import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router'; // Importante para recargar al cambiar de pestaña
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIAS = ['Todas', 'Partes de arriba', 'Pantalones', 'Jerseys', 'Abrigos y chaquetas', 'Favoritos'];

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  
  // --- NUEVOS ESTADOS PARA LA BASE DE DATOS ---
  const [prendas, setPrendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- RECARGAR PRENDAS CADA VEZ QUE ENTRAMOS EN LA PESTAÑA ---
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

      // Pedimos a Supabase todas las prendas de este usuario, ordenadas por la más reciente
      const { data, error } = await supabase
        .from('prendas')
        .select('*')
        .eq('id_usuario', user.id)
        .order('fecha_registro', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setPrendas(data); // Guardamos la ropa real en la variable
      }
    } catch (error: any) {
      Alert.alert('Error', 'No pudimos cargar tu armario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO CON LOS DATOS REALES ---
  const prendasFiltradas = prendas.filter(prenda => {
    if (categoriaActiva === 'Todas') return true;
    
    // Fíjate que usamos 'es_favorito' con guion bajo, como lo tienes en tu base de datos
    if (categoriaActiva === 'Favoritos') return prenda.es_favorito;

    if (categoriaActiva === 'Partes de arriba') {
      return ['Partes de arriba', 'Jerseys', 'Abrigos y chaquetas', 'Camisas y blusas'].includes(prenda.categoria);
    }

    if (categoriaActiva === 'Pantalones' || categoriaActiva === 'Partes de abajo') {
      return ['Pantalones', 'Faldas', 'Partes de abajo'].includes(prenda.categoria);
    }

    return prenda.categoria === categoriaActiva;
  });

  // --- DIBUJAMOS CADA PRENDA ---
  const renderPrenda = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cardPrenda}>
      <View style={styles.imagenPrenda}>
        
        {item.es_favorito && (
          <MaterialCommunityIcons 
            name="star" 
            size={24} 
            color="#a89078" 
            style={styles.iconoFavorito} 
          />
        )}
        
        {/* MAGIA: Si hay URL, mostramos la foto. Si no, un icono de respaldo */}
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.imagenReal} />
        ) : (
          <MaterialCommunityIcons name="tshirt-crew" size={50} color="#5c4033" />
        )}
      </View>
      
      <Text style={styles.nombrePrenda} numberOfLines={1}>{item.nombre}</Text>
      <Text style={styles.tejidoPrenda}>{item.categoria}</Text>
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

      {/* CONTENIDO PRINCIPAL: RULETA DE CARGA O LISTA DE PRENDAS */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5c4033" />
          <Text style={styles.textoCargando}>Abriendo las puertas del armario...</Text>
        </View>
      ) : (
        <FlatList
          data={prendasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderPrenda}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridPrendas}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="hanger" size={40} color="#ccc" />
              <Text style={styles.textoVacio}>No hay prendas en esta categoría.</Text>
            </View>
          }
        />
      )}

      {/* BOTÓN FLOTANTE PARA AÑADIR */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

// --- ESTILOS VISUALES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  listaCategorias: { flexGrow: 0 },
  pildoraCategoria: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  pildoraActiva: { backgroundColor: '#5c4033' },
  textoCategoria: { color: '#666', fontWeight: '600' },
  textoCategoriaActiva: { color: '#fff' },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoCargando: { marginTop: 10, color: '#666', fontSize: 16 },
  
  gridPrendas: { padding: 10 },
  cardPrenda: { flex: 1, margin: 10, backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', elevation: 2 },
  
  imagenPrenda: {
    width: '100%',
    height: 120, // Lo hemos hecho un poco más alto para que las fotos queden bien
    backgroundColor: '#f9f5f3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagenReal: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover', // Asegura que la foto ocupe todo el espacio sin deformarse
  },
  iconoFavorito: { position: 'absolute', top: 5, left: 5, zIndex: 1 },
  
  nombrePrenda: { fontSize: 15, color: '#333', fontWeight: '600', textAlign: 'center' },
  tejidoPrenda: { fontSize: 12, color: '#888', marginTop: 4 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  textoVacio: { marginTop: 10, color: '#888', fontSize: 16 },
  
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#5c4033', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});