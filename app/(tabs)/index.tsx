import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router'; // <-- Importamos el router para navegar
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '@/styles/screens/home';

import { COLORES_COMUNES, ESTILOS_COMUNES, MAPA_COLORES, OPCIONES_CATEGORIA, TIPOS_TELA } from '../../constants/opciones';
import { useGeneradorOutfits } from '../../hooks/useGeneradorOutfits'; // <-- Importamos el cerebro
import { useSubirPrenda } from '../../hooks/useSubirPrenda';

export default function HomeScreen() {
  const [modalColorVisible, setModalColorVisible] = useState(false);
  const [modalTelaVisible, setModalTelaVisible] = useState(false);
  const [modalEstiloVisible, setModalEstiloVisible] = useState(false);

  // 1. Instanciamos el hook del generador para leer el clima
  const { climaActual, obtenerClima } = useGeneradorOutfits();

  const {
    imageUri, estadoCarga,
    descripcion, setDescripcion,
    categoria, setCategoria,
    colores, setColores, toggleColor,
    tipoTela, setTipoTela, telaAutoDetectada,
    estilos, toggleEstilo,
    modalVisible: modalCategoriaVisible, setModalVisible: setModalCategoriaVisible,
    pickImage, subirPrenda, limpiar,
    pickLabelImage, loadingOcr,
  } = useSubirPrenda();
  // 2. Pedimos el clima en cuanto se abre la pantalla
  useEffect(() => {
    obtenerClima();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola! 👋</Text>
        <Text style={styles.subtitle}>¿Qué nos ponemos hoy?</Text>
        
        {/* --- MOSTRADOR DE CLIMA EN TIEMPO REAL --- */}
        {climaActual ? (
          <View style={styles.climaContainer}>
            <MaterialCommunityIcons 
              name={climaActual.temp > 20 ? "white-balance-sunny" : "weather-cloudy"} 
              size={24} 
              color="#5c4033" 
            />
            <Text style={styles.textoClima}>
              {climaActual.temp}ºC - {climaActual.tipo}
            </Text>
          </View>
        ) : (
          <View style={styles.climaContainer}>
            <ActivityIndicator size="small" color="#5c4033" />
            <Text style={styles.textoClima}>Buscando satélites...</Text>
          </View>
        )}
      </View>

      {/* BOTÓN PARA IR AL GENERADOR */}
      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/outfit')}>
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

      {/* RESTO DE TU CÓDIGO DE SUBIDA DE PRENDAS SE MANTIENE IGUAL... */}
      {imageUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.sectionTitle}>Nueva prenda:</Text>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          
          <TextInput style={styles.input} placeholder="Descripción (ej: Camiseta de Zara, nueva)" value={descripcion} onChangeText={setDescripcion} placeholderTextColor="#999" />
          
          <TouchableOpacity style={styles.input} onPress={() => setModalCategoriaVisible(true)}>
            <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>{categoria ? categoria : 'Selecciona una categoría...'}</Text>
          </TouchableOpacity>

<TouchableOpacity style={styles.input} onPress={() => setModalColorVisible(true)}>
  <Text style={{ color: colores.length > 0 ? '#333' : '#999', fontSize: 16 }}>
    {colores.length > 0 ? `Colores: ${colores.join(', ')}` : 'Selecciona colores...'}
  </Text>
</TouchableOpacity>

          <TouchableOpacity
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0ebe7', borderStyle: 'dashed' }]}
            onPress={pickLabelImage}
            disabled={loadingOcr}
          >
            {loadingOcr
              ? <ActivityIndicator size="small" color="#5c4033" style={{ marginRight: 8 }} />
              : <MaterialCommunityIcons name="barcode-scan" size={20} color="#5c4033" style={{ marginRight: 8 }} />
            }
            <Text style={{ color: '#5c4033', fontSize: 15 }}>
              {loadingOcr ? 'Leyendo etiqueta...' : 'Escanear etiqueta (OCR)'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 }]}>
            <TextInput
              style={{ flex: 1, paddingHorizontal: 15, color: '#333', fontSize: 16 }}
              placeholder="Composición (ej: 80% Algodón, 20% Elastán)"
              placeholderTextColor="#999"
              value={tipoTela}
              onChangeText={setTipoTela}
            />
            {telaAutoDetectada && (
              <MaterialCommunityIcons name="robot-outline" size={18} color="#5c4033" style={{ marginRight: 4 }} />
            )}
            <TouchableOpacity onPress={() => setModalTelaVisible(true)} style={{ paddingHorizontal: 12 }}>
              <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.input} onPress={() => setModalEstiloVisible(true)}>
  <Text style={{ color: estilos.length > 0 ? '#333' : '#999', fontSize: 16 }}>
    {estilos.length > 0 ? `Estilos: ${estilos.join(', ')}` : 'Selecciona estilo (máx 3)...'}
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

            <TouchableOpacity style={styles.botonCancelar} onPress={() => { limpiar(); setModalColorVisible(false); setModalTelaVisible(false); setModalEstiloVisible(false); }} disabled={estadoCarga !== ''}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Elige los colores</Text>
            <Text style={{ textAlign: 'center', color: '#999', marginBottom: 10, fontStyle: 'italic' }}>
              ↓ Desliza para ver más ↓
            </Text>
            
            <FlatList 
              data={COLORES_COMUNES} 
              keyExtractor={(item) => item} 
              showsVerticalScrollIndicator={true}
              indicatorStyle="black"
              renderItem={({ item }) => {
                const seleccionado = colores.includes(item);
                return (
                  <TouchableOpacity 
                    style={[styles.modalOpcionRow, seleccionado && styles.opcionSeleccionada]} 
                    onPress={() => toggleColor(item)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.colorBox, { backgroundColor: MAPA_COLORES[item] || '#ccc' }]} />
                      <Text style={[styles.textoOpcion, seleccionado && { fontWeight: 'bold', color: '#5c4033' }]}>
                        {item}
                      </Text>
                    </View>
                    {seleccionado && <MaterialCommunityIcons name="check" size={20} color="#5c4033" />}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={[styles.botonCerrarModal, { backgroundColor: '#5c4033' }]} onPress={() => setModalColorVisible(false)}>
              <Text style={[styles.textoCerrarModal, { color: '#fff' }]}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalTelaVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Elige el tipo de tela</Text>
          <FlatList data={TIPOS_TELA} keyExtractor={(item) => item} renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalOpcion} onPress={() => { setTipoTela(item); setModalTelaVisible(false); }}>
              <Text style={styles.textoOpcion}>{item}</Text>
            </TouchableOpacity>
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

