import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const OPCIONES_CATEGORIA = [
  'Partes de arriba', 'Pantalones', 'Faldas', 'Jerseys', 'Abrigos y chaquetas', 'Vestidos', 'Camisas y blusas', 'Accesorios'
];

// ⚠️ RECUERDA: Cambia esta URL cada vez que arranques Google Colab de nuevo
const MI_API_URL = "https://nine-sloths-mix.loca.lt/quitar-fondo"; 

export default function HomeScreen() {
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estadoCarga, setEstadoCarga] = useState(''); 
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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

      // 1. PREPARAMOS LA FOTO PARA TU API
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'prenda.jpg',
        type: 'image/jpeg',
      } as any);

      // 2. LLAMAMOS A TU CEREBRO EN GOOGLE COLAB
      const apiResponse = await fetch(MI_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Bypass-Tunnel-Reminder': 'true' // <-- ¡Pase VIP para saltar el bloqueo de LocalTunnel!
        }
      });

      if (!apiResponse.ok) {
        throw new Error("Fallo al conectar. Revisa que tu cuaderno de Colab siga abierto y la URL sea correcta.");
      }

// 3. RECIBIMOS LA FOTO EN FORMATO SEGURO (ARRAYBUFFER)
      const bufferImagen = await apiResponse.arrayBuffer(); // <-- ¡Adiós al bug del blob!

      // 4. SUBIMOS A SUPABASE
      setEstadoCarga('Guardando en tu armario... ☁️');
      const fileName = `${user.id}/${Date.now()}_prenda.jpeg`;

      // Subimos el buffer directamente
      const { error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, bufferImagen, { contentType: 'image/jpeg', upsert: false });
// Obtenemos la respuesta de Supabase
      const urlResponse = supabase.storage.from('prendas').getPublicUrl(fileName);
      
      // La extraemos de forma segura (compatible con cualquier versión)
      const publicUrl = urlResponse.data?.publicUrl || (urlResponse as any).publicURL;

      if (!publicUrl) {
          throw new Error("No se pudo generar la URL pública de la imagen.");
      }
      // 5. GUARDAMOS EN BASE DE DATOS
      const { error: dbError } = await supabase.from('prendas').insert({
          id_usuario: user.id,
          nombre: nombre,
          categoria: categoria,
          color: color,
          imagen_url: publicUrl,
        });

      if (dbError) throw dbError;

      Alert.alert('¡Magia propia!', 'La IA ha procesado la imagen y se ha guardado correctamente.');
      setImageUri(null);
      setNombre('');
      setCategoria('');
      setColor('');

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setEstadoCarga('');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola! 👋</Text>
        <Text style={styles.subtitle}>¿Qué nos ponemos hoy?</Text>
      </View>

      <TouchableOpacity style={styles.actionCard}>
        <MaterialCommunityIcons name="hanger" size={32} color="#fff" />
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>Generar nuevo outfit</Text>
          <Text style={styles.actionSubtitle}>Deja que la IA decida por ti</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      {!imageUri && (
        <TouchableOpacity style={styles.botonQuickAdd} onPress={pickImage}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
          <Text style={styles.textoQuickAdd}>Añadir Prenda Rápida</Text>
        </TouchableOpacity>
      )}

      {imageUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.sectionTitle}>Nueva prenda:</Text>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          
          <TextInput style={styles.input} placeholder="Nombre (ej: Camiseta básica)" value={nombre} onChangeText={setNombre} />
          
          <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setModalVisible(true)}>
            <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>
              {categoria ? categoria : 'Selecciona una categoría...'}
            </Text>
          </TouchableOpacity>

          <TextInput style={styles.input} placeholder="Color (ej: Blanco)" value={color} onChangeText={setColor} />
          
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
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Elige la categoría</Text>
            <FlatList
              data={OPCIONES_CATEGORIA}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalOpcion} 
                  onPress={() => { setCategoria(item); setModalVisible(false); }}
                >
                  <Text style={styles.textoOpcion}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalVisible(false)}>
              <Text style={styles.textoCerrarModal}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus últimos outfits</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          <View style={styles.outfitCard}>
            <View style={styles.imagePlaceholder}><MaterialCommunityIcons name="tshirt-crew" size={40} color="#a9a9a9" /></View>
            <Text style={styles.outfitDate}>Hoy</Text>
          </View>
          <View style={styles.outfitCard}>
            <View style={styles.imagePlaceholder}><MaterialCommunityIcons name="tshirt-crew" size={40} color="#a9a9a9" /></View>
            <Text style={styles.outfitDate}>Ayer</Text>
          </View>
        </ScrollView>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { marginTop: 10, marginBottom: 25 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  actionCard: { backgroundColor: '#5c4033', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20, elevation: 3 },
  actionTextContainer: { flex: 1, marginLeft: 15 },
  actionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  actionSubtitle: { color: '#d3c4bc', fontSize: 14, marginTop: 3 },
  botonQuickAdd: { backgroundColor: '#8b5a2b', flexDirection: 'row', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 35, elevation: 3 },
  textoQuickAdd: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  previewContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 35, alignItems: 'center', elevation: 2 },
  previewImage: { width: 200, height: 266, borderRadius: 10, marginBottom: 15, backgroundColor: '#f9f5f3' },
  input: { width: '100%', backgroundColor: '#f9f5f3', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', color: '#333' },
  previewButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  botonSubir: { flex: 1, flexDirection: 'row', backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  textoBotonSubir: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  botonCancelar: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#d9534f', justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  carousel: { flexDirection: 'row' },
  outfitCard: { marginRight: 15, alignItems: 'center' },
  imagePlaceholder: { width: 120, height: 160, backgroundColor: '#e0e0e0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  outfitDate: { fontSize: 14, color: '#555', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  modalOpcion: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  textoOpcion: { fontSize: 16, color: '#333', textAlign: 'center' },
  botonCerrarModal: { marginTop: 15, padding: 15, backgroundColor: '#e6dfd9', borderRadius: 10, alignItems: 'center' },
  textoCerrarModal: { color: '#5c4033', fontWeight: 'bold', fontSize: 16 }
});