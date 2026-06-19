import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '@/styles/screens/prendas';
import { supabase } from '../../lib/supabase';

// ¡Importaciones completas y corregidas!
import { CATEGORIAS_FILTRO, COLORES_COMUNES, ESTILOS_COMUNES, MAPA_COLORES, OPCIONES_CATEGORIA, TIPOS_TELA } from '../../constants/opciones';
import { useSubirPrenda } from '../../hooks/useSubirPrenda';

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [prendas, setPrendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [prendaSeleccionada, setPrendaSeleccionada] = useState<any | null>(null);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [imageAspect, setImageAspect] = useState(3 / 4);

  const [modalColorVisible, setModalColorVisible] = useState(false);
  const [modalTelaVisible, setModalTelaVisible] = useState(false);
  const [modalEstiloVisible, setModalEstiloVisible] = useState(false);

  const {
    imageUri, estadoCarga,
    categoria, setCategoria,
    colores, toggleColor,
    tipoTela, setTipoTela, cambiarTipoTela, telaAutoDetectada,
    estilos, toggleEstilo,
    modalVisible: modalCategoriaVisible, setModalVisible: setModalCategoriaVisible,
    // etiqueta OCR
    labelImageUri, loadingOcr, pickLabelImage,
    // tags
    tags, removeTag,
    pickImage, subirPrenda, limpiar,
  } = useSubirPrenda(() => cargarPrendas());

  useFocusEffect(
    useCallback(() => { cargarPrendas(); }, [])
  );

  const cargarPrendas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('prendas').select('*').eq('id_usuario', user.id).order('fecha_registro', { ascending: false });

      if (error) throw error;
      if (data) setPrendas(data);
    } catch (error: any) {
      Alert.alert('Error', 'No pudimos cargar tu armario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA PARA ELIMINAR PRENDA ---
  const confirmarEliminacion = (prenda: any) => {
    Alert.alert(
      "Eliminar Prenda",
      "¿Estás segura de que quieres borrar esta prenda? Se eliminará la foto y los datos definitivamente.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => eliminarPrenda(prenda) }
      ]
    );
  };

  const eliminarPrenda = async (prenda: any) => {
    try {
      setLoading(true);
      if (prenda.imagen_url) {
        const rutaImagen = prenda.imagen_url.split('/prendas/')[1];
        if (rutaImagen) {
          await supabase.storage.from('prendas').remove([rutaImagen]);
        }
      }
      const { error } = await supabase.from('prendas').delete().eq('id', prenda.id);
      if (error) throw error;
      
      setModalDetalleVisible(false);
      setPrendas((prevPrendas) => prevPrendas.filter(p => p.id !== prenda.id));
      Alert.alert('¡Limpieza!', 'Prenda eliminada correctamente.');
    } catch (error: any) {
      Alert.alert('Error', 'No pudimos eliminar la prenda: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const prendasFiltradas = prendas.filter(prenda => {
    if (categoriaActiva === 'Todas') return true;
    if (categoriaActiva === 'Favoritos') return prenda.es_favorito;
    if (categoriaActiva === 'Tops') return ['Tops', 'Jerseys', 'Abrigos y chaquetas', 'Camisas y blusas'].includes(prenda.categoria);
    if (categoriaActiva === 'Pantalones') return ['Pantalones', 'Faldas'].includes(prenda.categoria);
    return prenda.categoria === categoriaActiva;
  });

  const verDetalle = (prenda: any) => { setPrendaSeleccionada(prenda); setModalDetalleVisible(true); };

  const renderPrenda = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.cardPrenda} onPress={() => verDetalle(item)}>
      <View style={styles.imagenPrendaContenedor}>
        {item.es_favorito && <MaterialCommunityIcons name="star" size={20} color="#a89078" style={styles.iconoFavorito} />}
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
          horizontal showsHorizontalScrollIndicator={false} data={CATEGORIAS_FILTRO} keyExtractor={(item) => item} style={styles.listaCategorias}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.pildoraCategoria, categoriaActiva === item && styles.pildoraActiva]} onPress={() => setCategoriaActiva(item)}>
              <Text style={[styles.textoCategoria, categoriaActiva === item && styles.textoCategoriaActiva]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#5c4033" /></View>
      ) : (
        <FlatList data={prendasFiltradas} keyExtractor={(item) => item.id} renderItem={renderPrenda} numColumns={2} contentContainerStyle={styles.gridPrendas}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="hanger" size={40} color="#ccc" />
              <Text style={styles.textoVacio}>No hay prendas aquí todavía.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={pickImage}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* --- MODAL PANTALLA COMPLETA DE SUBIDA --- */}
      <Modal visible={!!imageUri} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalAddContainer}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            
            <Text style={styles.modalAddTitle}>Nueva prenda:</Text>
            <Image
              source={{ uri: imageUri || undefined }}
              style={[styles.previewImage, { aspectRatio: imageAspect }]}
              resizeMode="contain"
              onLoad={(e) => {
                const { width: w, height: h } = e.nativeEvent.source;
                if (w && h) setImageAspect(w / h);
              }}
            />
            
            <Text style={[styles.modalAddTitle, { fontSize: 16, marginTop: 10, marginBottom: 10 }]}>Descripción de la prenda</Text>
            
            <TouchableOpacity style={styles.input} onPress={() => setModalCategoriaVisible(true)}>
              <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>{categoria ? categoria : 'Selecciona una categoría...'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.input} onPress={() => setModalColorVisible(true)}>
              <Text style={{ color: colores.length > 0 ? '#333' : '#999', fontSize: 16 }}>
                {colores.length > 0 ? `Colores: ${colores.join(', ')}` : 'Selecciona colores...'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonEtiqueta}
              onPress={pickLabelImage}
              disabled={loadingOcr}
            >
              {loadingOcr ? (
                <>
                  <ActivityIndicator size="small" color="#5c4033" />
                  <Text style={styles.botonEtiquetaTexto}>  Leyendo etiqueta...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={labelImageUri ? 'tag-check' : 'tag-plus-outline'}
                    size={20} color="#5c4033"
                  />
                  <Text style={styles.botonEtiquetaTexto}>
                    {labelImageUri ? '  Etiqueta escaneada ✓' : '  Escanear etiqueta física'}
                  </Text>
                </>
              )}
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
                <View style={styles.badgeAutoDetectado}>
                  <Text style={styles.badgeAutoDetectadoTexto}>Auto</Text>
                </View>
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

            {/* ── TAGS DE ORGANIZACIÓN ──────────────────────────────── */}
            {tags.length > 0 && (
              <View style={styles.tagsWrap}>
                {tags.map(tag => (
                  <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                    <Text style={styles.tagChipTexto}>#{tag}</Text>
                    <MaterialCommunityIcons name="close" size={13} color="#5c4033" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
          </ScrollView>

          {/* Modales Internos */}
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

          <Modal visible={modalCategoriaVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elige la categoría</Text>
              <FlatList data={OPCIONES_CATEGORIA} keyExtractor={(item) => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOpcion} onPress={() => { setCategoria(item); setModalCategoriaVisible(false); }}><Text style={styles.textoOpcion}>{item}</Text></TouchableOpacity>
              )}/>
              <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalCategoriaVisible(false)}><Text style={styles.textoCerrarModal}>Cancelar</Text></TouchableOpacity>
            </View></View>
          </Modal>

          <Modal visible={modalTelaVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elige el tipo de tela</Text>
              <FlatList data={TIPOS_TELA} keyExtractor={(item) => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOpcion} onPress={() => { cambiarTipoTela(item); setModalTelaVisible(false); }}><Text style={styles.textoOpcion}>{item}</Text></TouchableOpacity>
              )}/>
              <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalTelaVisible(false)}><Text style={styles.textoCerrarModal}>Cancelar</Text></TouchableOpacity>
            </View></View>
          </Modal>

          <Modal visible={modalEstiloVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona Estilos (Máx 3)</Text>
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
                <Text style={[styles.textoCerrarModal, { color: '#fff' }]}>Aceptar ({estilos.length}/3)</Text>
              </TouchableOpacity>
            </View></View>
          </Modal>

        </KeyboardAvoidingView>
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
                
                <View style={styles.detalleHeaderRow}>
                  <Text style={styles.detalleNombre}>{prendaSeleccionada.nombre}</Text>
                  <TouchableOpacity onPress={() => confirmarEliminacion(prendaSeleccionada)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={28} color="#d9534f" />
                  </TouchableOpacity>
                </View>

                {prendaSeleccionada.descripcion ? (
                   <Text style={styles.detalleTextoPrincipal}>{prendaSeleccionada.descripcion}</Text>
                ) : null}
                
                <View style={styles.divisor} />
                <View style={styles.detalleFila}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color="#666" />
                  <Text style={styles.detalleTexto}>Categoría: <Text style={styles.bold}>{prendaSeleccionada.categoria}</Text></Text>
                </View>
                <View style={styles.detalleFila}>
                  <MaterialCommunityIcons name="palette-outline" size={20} color="#666" />
                  <Text style={styles.detalleTexto}>Color: <Text style={styles.bold}>{prendaSeleccionada.color}</Text></Text>
                </View>
                {prendaSeleccionada.tipo_tela && (
                  <View style={styles.detalleFila}>
                    <MaterialCommunityIcons name="texture" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>Tela: <Text style={styles.bold}>{prendaSeleccionada.tipo_tela}</Text></Text>
                  </View>
                )}
                {prendaSeleccionada.estilo && (
                  <View style={styles.detalleFila}>
                    <MaterialCommunityIcons name="flash-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>Estilo: <Text style={styles.bold}>{prendaSeleccionada.estilo}</Text></Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>

    </View>
  );
}

