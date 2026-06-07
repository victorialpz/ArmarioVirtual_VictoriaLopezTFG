import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { COLORES_COMUNES, ESTILOS_COMUNES, OPCIONES_CATEGORIA, TIPOS_TELA } from '../../constants/opciones';
import { useSubirPrenda } from '../../hooks/useSubirPrenda';

export default function HomeScreen() {
  const [modalColorVisible, setModalColorVisible] = useState(false);
  const [modalTelaVisible, setModalTelaVisible] = useState(false);
  const [modalEstiloVisible, setModalEstiloVisible] = useState(false);

  const { 
    imageUri, setImageUri, estadoCarga, 
    nombre, setNombre, 
    categoria, setCategoria, 
    color, setColor,
    tipoTela, setTipoTela,
    estilos, toggleEstilo,
    modalVisible: modalCategoriaVisible, setModalVisible: setModalCategoriaVisible, 
    pickImage, subirPrenda 
  } = useSubirPrenda();

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
          
          {/* CAMBIADO A DESCRIPCIÓN */}
          <TextInput style={styles.input} placeholder="Descripción (ej: Camiseta básica lisa)" value={nombre} onChangeText={setNombre} placeholderTextColor="#999" />
          
          <TouchableOpacity style={styles.input} onPress={() => setModalCategoriaVisible(true)}>
            <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>{categoria ? categoria : 'Selecciona una categoría...'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.input} onPress={() => setModalColorVisible(true)}>
            <Text style={{ color: color ? '#333' : '#999', fontSize: 16 }}>{color ? color : 'Selecciona un color...'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.input} onPress={() => setModalTelaVisible(true)}>
            <Text style={{ color: tipoTela ? '#333' : '#999', fontSize: 16 }}>{tipoTela ? tipoTela : 'Selecciona el tipo de tela...'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.input} onPress={() => setModalEstiloVisible(true)}>
            <Text style={{ color: estilos.length > 0 ? '#333' : '#999', fontSize: 16 }}>
              {estilos.length > 0 ? `Estilo: ${estilos.join(', ')}` : 'Selecciona estilo (máx 2)...'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.previewButtonsRow}>
            <TouchableOpacity style={[styles.botonSubir, estadoCarga !== '' && { backgroundColor: '#a5d6a7' }]} onPress={subirPrenda} disabled={estadoCarga !== ''}>
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

      {/* --- MODALES INTERNOS --- */}
      <Modal visible={modalCategoriaVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Elige la categoría</Text>
          <FlatList data={OPCIONES_CATEGORIA} keyExtractor={(item) => item} renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalOpcion} onPress={() => { setCategoria(item); setModalCategoriaVisible(false); }}><Text style={styles.textoOpcion}>{item}</Text></TouchableOpacity>
          )}/>
          <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalCategoriaVisible(false)}><Text style={styles.textoCerrarModal}>Cancelar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={modalColorVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Elige el color</Text>
          <FlatList data={COLORES_COMUNES} keyExtractor={(item) => item} renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalOpcion} onPress={() => { setColor(item); setModalColorVisible(false); }}><Text style={styles.textoOpcion}>{item}</Text></TouchableOpacity>
          )}/>
          <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalColorVisible(false)}><Text style={styles.textoCerrarModal}>Cancelar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={modalTelaVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Elige el tipo de tela</Text>
          <FlatList data={TIPOS_TELA} keyExtractor={(item) => item} renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalOpcion} onPress={() => { setTipoTela(item); setModalTelaVisible(false); }}><Text style={styles.textoOpcion}>{item}</Text></TouchableOpacity>
          )}/>
          <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalTelaVisible(false)}><Text style={styles.textoCerrarModal}>Cancelar</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={modalEstiloVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecciona Estilos (Máx 2)</Text>
          <FlatList data={ESTILOS_COMUNES} keyExtractor={(item) => item} renderItem={({ item }) => {
            const seleccionado = estilos.includes(item);
            return (
              <TouchableOpacity style={[styles.modalOpcionRow, seleccionado && styles.opcionSeleccionada]} onPress={() => toggleEstilo(item)}>
                <Text style={[styles.textoOpcion, seleccionado && { fontWeight: 'bold', color: '#5c4033' }]}>{item}</Text>
                {seleccionado && <MaterialCommunityIcons name="check" size={20} color="#5c4033" />}
              </TouchableOpacity>
            );
          }}/>
          <TouchableOpacity style={[styles.botonCerrarModal, { backgroundColor: '#5c4033' }]} onPress={() => setModalEstiloVisible(false)}>
            <Text style={[styles.textoCerrarModal, { color: '#fff' }]}>Aceptar ({estilos.length}/2)</Text>
          </TouchableOpacity>
        </View></View>
      </Modal>

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
  input: { width: '100%', height: 52, backgroundColor: '#f9f5f3', paddingHorizontal: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', color: '#333', justifyContent: 'center' },
  previewButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  botonSubir: { flex: 1, flexDirection: 'row', backgroundColor: '#4CAF50', height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  textoBotonSubir: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  botonCancelar: { width: 52, height: 52, borderRadius: 10, borderWidth: 1, borderColor: '#d9534f', justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  carousel: { flexDirection: 'row' },
  outfitCard: { marginRight: 15, alignItems: 'center' },
  imagePlaceholder: { width: 120, height: 160, backgroundColor: '#e0e0e0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  outfitDate: { fontSize: 14, color: '#555', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  modalOpcion: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOpcionRow: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', justifyContent: 'space-between', alignItems: 'center' },
  opcionSeleccionada: { backgroundColor: '#f9f5f3', borderRadius: 8 },
  textoOpcion: { fontSize: 16, color: '#333', textAlign: 'center' },
  botonCerrarModal: { marginTop: 15, padding: 15, backgroundColor: '#e6dfd9', borderRadius: 10, alignItems: 'center' },
  textoCerrarModal: { color: '#5c4033', fontWeight: 'bold', fontSize: 16 }
});