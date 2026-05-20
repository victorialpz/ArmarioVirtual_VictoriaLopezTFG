import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const CATEGORIAS_FILTRO = ['Todas', 'Partes de arriba', 'Pantalones', 'Jerseys', 'Abrigos y chaquetas', 'Favoritos'];
const OPCIONES_CATEGORIA = ['Partes de arriba', 'Pantalones', 'Faldas', 'Jerseys', 'Abrigos y chaquetas', 'Vestidos', 'Camisas y blusas', 'Accesorios'];

// ⚠️ RECUERDA: Cambia esta URL cada vez que arranques Google Colab de nuevo
const MI_API_URL = "https://poor-rockets-divide.loca.lt/quitar-fondo";

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [prendas, setPrendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA EL DETALLE DE LA PRENDA ---
  const [prendaSeleccionada, setPrendaSeleccionada] = useState<any | null>(null);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);

  // --- ESTADOS PARA AÑADIR NUEVA PRENDA ---
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estadoCarga, setEstadoCarga] = useState(''); 
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState(''); 
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);

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

  const verDetalle = (prenda: any) => {
    setPrendaSeleccionada(prenda);
    setModalDetalleVisible(true);
  };

  // --- LÓGICA PARA SELECCIONAR FOTO ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', '¡Necesitamos permisos para acceder a tu galería!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 0.8, 
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const subirPrenda = async () => {
    if (!imageUri) return;
    if (!nombre || !categoria || !color) {
        Alert.alert("Faltan datos", "Por favor, rellena el nombre, la categoría y el color.");
        return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para subir prendas.");

      setEstadoCarga('Procesando con la IA... 🧠');

      // 1. PREPARAMOS LA FOTO (Lógica blindada para iOS)
      const nombreArchivo = imageUri.split('/').pop() || 'prenda.jpg';
      const match = /\.(\w+)$/.exec(nombreArchivo);
      const tipoArchivo = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: nombreArchivo,
        type: tipoArchivo,
      } as any);

      // 2. LLAMAMOS A TU CEREBRO EN GOOGLE COLAB
      const apiResponse = await fetch(MI_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'Accept': 'application/json'
        }
      });

      if (!apiResponse.ok) {
        throw new Error("Fallo al conectar con la IA. Revisa Google Colab.");
      }

      const bufferImagen = await apiResponse.arrayBuffer(); 

      setEstadoCarga('Guardando en tu armario... ☁️');
      const fileName = `${user.id}/${Date.now()}_prenda.jpeg`;

      const { error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, bufferImagen, { contentType: 'image/jpeg', upsert: false });

      if (uploadError) throw uploadError;

      const urlResponse = supabase.storage.from('prendas').getPublicUrl(fileName);
      const publicUrl = urlResponse.data?.publicUrl || (urlResponse as any).publicURL;

      if (!publicUrl) throw new Error("No se pudo generar la URL pública de la imagen.");

      const { error: dbError } = await supabase.from('prendas').insert({
          id_usuario: user.id,
          nombre: nombre,
          categoria: categoria,
          color: color,
          imagen_url: publicUrl,
        });

      if (dbError) throw dbError;

      Alert.alert('¡Magia lista!', 'La prenda se ha guardado en tu armario virtual.');
      
      setImageUri(null);
      setNombre('');
      setCategoria('');
      setColor('');
      
      cargarPrendas();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setEstadoCarga('');
    }
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

      {/* --- BOTÓN FLOTANTE (+) --- */}
      <TouchableOpacity style={styles.fab} onPress={pickImage}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* --- MODAL PRINCIPAL: FORMULARIO DE NUEVA PRENDA (PANTALLA COMPLETA) --- */}
      <Modal visible={!!imageUri} animationType="slide" transparent={false}>
        <View style={styles.modalAddContainer}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.modalAddTitle}>Nueva prenda:</Text>
            
            <Image source={{ uri: imageUri || undefined }} style={styles.previewImage} resizeMode="contain" />
            
            <TextInput 
              style={styles.input} 
              placeholder="Nombre (ej: Camiseta básica)" 
              value={nombre} 
              onChangeText={setNombre} 
              placeholderTextColor="#999" 
            />
            
            {/* BOTÓN SELECCIONAR CATEGORÍA CON MISMO ESTILO QUE TEXTINPUT */}
            <TouchableOpacity style={styles.input} onPress={() => setModalCategoriaVisible(true)}>
              <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>
                {categoria ? categoria : 'Selecciona una categoría...'}
              </Text>
            </TouchableOpacity>

            <TextInput 
              style={styles.input} 
              placeholder="Color (ej: Blanco)" 
              value={color} 
              onChangeText={setColor} 
              placeholderTextColor="#999" 
            />
            
            <View style={styles.previewButtonsRow}>
              <TouchableOpacity 
                style={[styles.botonSubir, estadoCarga !== '' && { backgroundColor: '#a5d6a7' }]}
                onPress={subirPrenda}
                disabled={estadoCarga !== ''}
              >
                {estadoCarga !== '' ? (
                  <>
                    <ActivityIndicator color="#fff" style={{marginRight: 10}} />
                    <Text style={styles.textoBotonSubir}>{estadoCarga}</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save" size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.textoBotonSubir}>Guardar prenda</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.botonCancelar} onPress={() => setImageUri(null)} disabled={estadoCarga !== ''}>
                <MaterialCommunityIcons name="close" size={24} color="#d9534f" />
              </TouchableOpacity>
            </View>

          </ScrollView>

          {/* --- MODAL DE CATEGORÍAS (AHORA SÍ FUNCIONA EN IOS) --- */}
          <Modal visible={modalCategoriaVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Elige la categoría</Text>
                <FlatList
                  data={OPCIONES_CATEGORIA}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.modalOpcion} 
                      onPress={() => { setCategoria(item); setModalCategoriaVisible(false); }}
                    >
                      <Text style={styles.textoOpcion}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalCategoriaVisible(false)}>
                  <Text style={styles.textoCerrarModal}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>
      </Modal>

      {/* --- MODAL DE DETALLE (PRENDA EN GRANDE) --- */}
      <Modal visible={modalDetalleVisible} animationType="fade" transparent={false} onRequestClose={() => setModalDetalleVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.botonCerrarDetalle} onPress={() => setModalDetalleVisible(false)}>
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {prendaSeleccionada && (
            <>
              <Image source={{ uri: prendaSeleccionada.imagen_url }} style={styles.imagenGrande} resizeMode="contain" />

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

    </View>
  );
}

const styles = StyleSheet.create({
  // Armario y Filtros
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginTop: 10 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  listaCategorias: { flexGrow: 0 },
  pildoraCategoria: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  pildoraActiva: { backgroundColor: '#5c4033' },
  textoCategoria: { color: '#666', fontWeight: '600' },
  textoCategoriaActiva: { color: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridPrendas: { padding: 10, paddingBottom: 100 },
  cardPrenda: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', elevation: 2 },
  imagenPrendaContenedor: { width: '100%', height: 120, backgroundColor: '#f9f5f3', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imagenMiniatura: { width: '100%', height: '100%', borderRadius: 8 },
  iconoFavorito: { position: 'absolute', top: 4, left: 4, zIndex: 1 },
  nombrePrenda: { fontSize: 14, color: '#333', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  textoVacio: { marginTop: 10, color: '#888' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#5c4033', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  // --- CONTENEDORES DEL FORMULARIO DE SUBIDA (PANTALLA COMPLETA) ---
  modalAddContainer: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  modalScrollContent: { alignItems: 'center', paddingBottom: 30 },
  modalAddTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, alignSelf: 'flex-start' },
  previewImage: { width: 200, height: 266, borderRadius: 10, marginBottom: 25, backgroundColor: '#f9f5f3' },
  
  // --- ELEMENTOS DEL FORMULARIO 100% FIJOS Y SIMÉTRICOS ---
  input: { 
    width: '100%', 
    height: 52, 
    backgroundColor: '#f9f5f3', 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    color: '#333',
    fontSize: 16,
    justifyContent: 'center'
  },
  previewButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  botonSubir: { flex: 1, flexDirection: 'row', backgroundColor: '#4CAF50', height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  textoBotonSubir: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  botonCancelar: { width: 52, height: 52, borderRadius: 10, borderWidth: 1, borderColor: '#d9534f', justifyContent: 'center', alignItems: 'center' },

  // --- ESTILOS MODAL CATEGORÍA ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  modalOpcion: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  textoOpcion: { fontSize: 16, color: '#333', textAlign: 'center' },
  botonCerrarModal: { marginTop: 15, padding: 15, backgroundColor: '#e6dfd9', borderRadius: 10, alignItems: 'center' },
  textoCerrarModal: { color: '#5c4033', fontWeight: 'bold', fontSize: 16 },

  // --- ESTILOS MODAL DETALLE ---
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  botonCerrarDetalle: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 },
  imagenGrande: { width: width, height: width * 1.3 },
  infoPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, elevation: 10 },
  detalleNombre: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  divisor: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  detalleFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detalleTexto: { fontSize: 16, color: '#555', marginLeft: 10 },
  bold: { fontWeight: 'bold', color: '#333' },
  textoFecha: { fontSize: 12, color: '#999', marginTop: 15, textAlign: 'right' }
});