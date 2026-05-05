import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- LISTA DE CATEGORÍAS FIJAS ---
const OPCIONES_CATEGORIA = [
  'Partes de arriba', 'Pantalones', 'Faldas', 'Jerseys', 'Abrigos y chaquetas', 'Vestidos', 'Camisas y blusas', 'Accesorios'
];

export default function HomeScreen() {
  
  // --- ESTADOS PARA LA FOTO Y CARGA ---
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  // --- ESTADOS PARA EL FORMULARIO DE LA BASE DE DATOS ---
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState('');

  // --- ESTADO PARA MOSTRAR/OCULTAR EL MENÚ DE CATEGORÍAS ---
  const [modalVisible, setModalVisible] = useState(false);

  // --- FUNCIÓN PARA ABRIR LA GALERÍA ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', '¡Necesitamos permisos para acceder a tu galería!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // --- FUNCIÓN PARA SUBIR A STORAGE E INSERTAR EN LA TABLA ---
  const subirPrenda = async () => {
    if (!imageUri) return;
    if (!nombre || !categoria || !color) {
        Alert.alert("Faltan datos", "Por favor, rellena el nombre, la categoría y el color.");
        return;
    }

    try {
      setSubiendo(true); 
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para subir prendas.");

      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `${user.id}/${Date.now()}_prenda.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('prendas').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from('prendas')
        .insert({
          id_usuario: user.id,
          nombre: nombre,
          categoria: categoria,
          color: color,
          imagen_url: publicUrl,
        });

      if (dbError) throw dbError;

      Alert.alert('¡Prenda guardada!', 'Tu prenda ya está en la base de datos y en tu armario.');
      setImageUri(null);
      setNombre('');
      setCategoria('');
      setColor('');

    } catch (error: any) {
      Alert.alert('Error al subir', error.message);
    } finally {
      setSubiendo(false); 
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
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          
          {/* CAMPO DE TEXTO PARA NOMBRE (Igual que antes) */}
          <TextInput 
            style={styles.input} 
            placeholder="Nombre (ej: Camiseta básica)" 
            value={nombre} 
            onChangeText={setNombre} 
          />
          
          {/* NUEVO: BOTÓN QUE ABRE EL MENÚ DE CATEGORÍA */}
          <TouchableOpacity 
            style={[styles.input, { justifyContent: 'center' }]} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>
              {categoria ? categoria : 'Selecciona una categoría...'}
            </Text>
          </TouchableOpacity>

          {/* CAMPO DE TEXTO PARA COLOR (Igual que antes) */}
          <TextInput 
            style={styles.input} 
            placeholder="Color (ej: Blanco)" 
            value={color} 
            onChangeText={setColor} 
          />
          
          <View style={styles.previewButtonsRow}>
            <TouchableOpacity 
              style={[styles.botonSubir, subiendo && { backgroundColor: '#a5d6a7' }]}
              onPress={subirPrenda}
              disabled={subiendo}
            >
              {subiendo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.textoBotonSubir}>Guardar prenda</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botonCancelar} 
              onPress={() => setImageUri(null)}
              disabled={subiendo}
            >
              <MaterialCommunityIcons name="close" size={24} color="#d9534f" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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

      {/* NUEVO: MENÚ EMERGENTE (MODAL) PARA SELECCIONAR CATEGORÍA */}
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
                  onPress={() => {
                    setCategoria(item);
                    setModalVisible(false); // Cierra el menú al elegir
                  }}
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

    </ScrollView>
  );
}

// --- ESTILOS VISUALES ---
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
  previewImage: { width: 200, height: 266, borderRadius: 10, marginBottom: 15 },
  
  input: { 
    width: '100%', 
    backgroundColor: '#f9f5f3', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    color: '#333'
  },

  previewButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  botonSubir: { flex: 1, flexDirection: 'row', backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  textoBotonSubir: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botonCancelar: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#d9534f', justifyContent: 'center', alignItems: 'center' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  carousel: { flexDirection: 'row' },
  outfitCard: { marginRight: 15, alignItems: 'center' },
  imagePlaceholder: { width: 120, height: 160, backgroundColor: '#e0e0e0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  outfitDate: { fontSize: 14, color: '#555', fontWeight: '500' },

  // --- ESTILOS NUEVOS PARA EL MENÚ (MODAL) ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  modalOpcion: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  textoOpcion: { fontSize: 16, color: '#333', textAlign: 'center' },
  botonCerrarModal: { marginTop: 15, padding: 15, backgroundColor: '#e6dfd9', borderRadius: 10, alignItems: 'center' },
  textoCerrarModal: { color: '#5c4033', fontWeight: 'bold', fontSize: 16 }
});