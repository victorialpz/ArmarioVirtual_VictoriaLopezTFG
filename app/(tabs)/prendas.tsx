import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Dimensions, FlatList, Image,
  KeyboardAvoidingView, Modal, Platform, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  CATEGORIAS_FILTRO, COLORES_COMUNES, ESTILOS_COMUNES,
  MAPA_COLORES, OPCIONES_CATEGORIA, TIPOS_TELA,
} from '@/constants/opciones';
import { useSubirPrenda } from '@/hooks/useSubirPrenda';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/screens/prendas';

// ─── Estado config ────────────────────────────────────────────────────────────

const ESTADOS = [
  { key: 'Limpio',   label: 'Limpio',   icon: 'check-circle-outline', color: '#4CAF50' },
  { key: 'A medias', label: 'A medias', icon: 'circle-half-full',     color: '#FF9800' },
  { key: 'En uso',   label: 'En uso',   icon: 'account-check',        color: '#2196F3' },
  { key: 'Sucio',    label: 'Sucio',    icon: 'washing-machine',      color: '#795548' },
] as const;

type EstadoKey = typeof ESTADOS[number]['key'];

const ESTADO_DOT: Record<EstadoKey, string> = {
  'Limpio':   '#4CAF50',
  'A medias': '#FF9800',
  'En uso':   '#2196F3',
  'Sucio':    '#795548',
};

// ─── Símbolo icono config ─────────────────────────────────────────────────────

type SimboloConfig = { icon: string; color: string; bg: string; tempText?: string };

const SIMBOLO_CONFIG: Record<string, SimboloConfig> = {
  MAQUINA_30:     { icon: 'washing-machine', color: '#2196F3', bg: '#E3F2FD', tempText: '30°' },
  MAQUINA_40:     { icon: 'washing-machine', color: '#FF9800', bg: '#FFF3E0', tempText: '40°' },
  MAQUINA_60:     { icon: 'washing-machine', color: '#F44336', bg: '#FFEBEE', tempText: '60°' },
  MAQUINA_90:     { icon: 'washing-machine', color: '#B71C1C', bg: '#FFCDD2', tempText: '90°' },
  DELICADO_30:    { icon: 'hand-water',      color: '#29B6F6', bg: '#E1F5FE', tempText: '30°' },
  DELICADO_40:    { icon: 'hand-water',      color: '#26C6DA', bg: '#E0F7FA', tempText: '40°' },
  LAVADO_MANO:    { icon: 'hand-water',      color: '#1E88E5', bg: '#BBDEFB' },
  NO_LAVAR:       { icon: 'cancel',          color: '#EF5350', bg: '#FFEBEE' },
  LIMPIEZA_SECO:  { icon: 'tshirt-crew',     color: '#AB47BC', bg: '#F3E5F5' },
  NO_CENTRIFUGAR: { icon: 'rotate-right',    color: '#EF5350', bg: '#FFEBEE' },
  NO_BLANQUEAR:   { icon: 'water',           color: '#EF5350', bg: '#FFEBEE' },
  NO_SECADORA:    { icon: 'cancel',          color: '#8D6E63', bg: '#EFEBE9' },
  TENDER_PLANO:   { icon: 'minus',           color: '#78909C', bg: '#ECEFF1' },
  TENDER_SOMBRA:  { icon: 'weather-cloudy',  color: '#90A4AE', bg: '#ECEFF1' },
  NO_PLANCHAR:    { icon: 'cancel',          color: '#EF5350', bg: '#FFEBEE' },
  PLANCHA_BAJA:   { icon: 'iron',            color: '#66BB6A', bg: '#E8F5E9', tempText: '110°' },
  PLANCHA_MEDIA:  { icon: 'iron',            color: '#FFA726', bg: '#FFF3E0', tempText: '150°' },
  PLANCHA_ALTA:   { icon: 'iron',            color: '#EF5350', bg: '#FFEBEE', tempText: '200°' },
};

const SimboloIcono = ({ codigo }: { codigo: string }) => {
  const cfg = SIMBOLO_CONFIG[codigo] || { icon: 'tag-outline', color: '#888', bg: '#F4F6F8' };
  return (
    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: cfg.bg, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
      <MaterialCommunityIcons name={cfg.icon as any} size={cfg.tempText ? 18 : 26} color={cfg.color} />
      {cfg.tempText ? (
        <Text style={{ fontSize: 9, fontWeight: 'bold', color: cfg.color, marginTop: 1 }}>{cfg.tempText}</Text>
      ) : null}
    </View>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PrendasScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [prendas, setPrendas]                 = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);

  const [prendaSeleccionada, setPrendaSeleccionada] = useState<any | null>(null);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [imageAspect, setImageAspect]               = useState(3 / 4);

  const [modalColorVisible, setModalColorVisible]   = useState(false);
  const [modalTelaVisible, setModalTelaVisible]     = useState(false);
  const [modalEstiloVisible, setModalEstiloVisible] = useState(false);

  const [estadoPrenda, setEstadoPrenda]                 = useState<EstadoKey>('Limpio');
  const [simbolosDePrenda, setSimbolosDePrenda]         = useState<any[]>([]);
  const [todosSimbolos, setTodosSimbolos]               = useState<any[]>([]);
  const [modalSimbolosVisible, setModalSimbolosVisible] = useState(false);
  const [cargandoSimbolos, setCargandoSimbolos]         = useState(false);

  // ── Panel de detalle: toggle expandido / colapsado ───────────────────────
  const PANEL_SNAP     = Dimensions.get('window').height * 0.48;
  const panelAnim      = useRef(new Animated.Value(0)).current;
  const [panelColapsado, setPanelColapsado] = useState(false);

  const togglePanel = () => {
    const toValue = panelColapsado ? 0 : PANEL_SNAP;
    setPanelColapsado(v => !v);
    Animated.spring(panelAnim, { toValue, useNativeDriver: true, tension: 60, friction: 10 }).start();
  };

  useEffect(() => {
    if (modalDetalleVisible) {
      panelAnim.setValue(0);
      setPanelColapsado(false);
    }
  }, [modalDetalleVisible]);
  // ─────────────────────────────────────────────────────────────────────────

  const {
    imageUri, estadoCarga,
    categoria, setCategoria,
    colores, toggleColor,
    tipoTela, cambiarTipoTela, telaAutoDetectada,
    estilos, toggleEstilo,
    modalVisible: modalCategoriaVisible, setModalVisible: setModalCategoriaVisible,
    labelImageUri, loadingOcr, pickLabelImage,
    tags, removeTag,
    pickImage, subirPrenda, limpiar,
  } = useSubirPrenda(() => cargarPrendas());

  const { autoAdd } = useLocalSearchParams<{ autoAdd?: string }>();

  useEffect(() => {
    if (autoAdd === '1') {
      pickImage();
      router.setParams({ autoAdd: undefined });
    }
  }, [autoAdd]);

  useFocusEffect(useCallback(() => { cargarPrendas(); }, []));

  // ─── Data ─────────────────────────────────────────────────────────────────

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

  // ─── Detalle ──────────────────────────────────────────────────────────────

  const verDetalle = async (prenda: any) => {
    setPrendaSeleccionada(prenda);
    setEstadoPrenda((prenda.estado as EstadoKey) || 'Limpio');
    setSimbolosDePrenda([]);
    setModalDetalleVisible(true);
    setCargandoSimbolos(true);
    try {
      const { data } = await supabase
        .from('prenda_simbolos')
        .select('simbolos_lavado(*)')
        .eq('id_prenda', prenda.id);
      setSimbolosDePrenda(data?.map((s: any) => s.simbolos_lavado).filter(Boolean) || []);
    } finally {
      setCargandoSimbolos(false);
    }
  };

  const actualizarEstado = async (nuevoEstado: EstadoKey) => {
    if (!prendaSeleccionada) return;
    setEstadoPrenda(nuevoEstado);
    await supabase.from('prendas').update({ estado: nuevoEstado }).eq('id', prendaSeleccionada.id);
    setPrendas(prev => prev.map(p => p.id === prendaSeleccionada.id ? { ...p, estado: nuevoEstado } : p));
  };

  const cargarTodosSimbolos = async () => {
    if (todosSimbolos.length > 0) return;
    const { data } = await supabase.from('simbolos_lavado').select('*').order('categoria');
    if (data) setTodosSimbolos(data);
  };

  const toggleSimbolo = async (simbolo: any) => {
    if (!prendaSeleccionada) return;
    const yaSeleccionado = simbolosDePrenda.some(s => s.id === simbolo.id);
    if (yaSeleccionado) {
      await supabase.from('prenda_simbolos')
        .delete().eq('id_prenda', prendaSeleccionada.id).eq('id_simbolo', simbolo.id);
      setSimbolosDePrenda(prev => prev.filter(s => s.id !== simbolo.id));
    } else {
      await supabase.from('prenda_simbolos')
        .insert({ id_prenda: prendaSeleccionada.id, id_simbolo: simbolo.id });
      setSimbolosDePrenda(prev => [...prev, simbolo]);
    }
  };

  // ─── Eliminación ──────────────────────────────────────────────────────────

  const confirmarEliminacion = (prenda: any) => {
    Alert.alert(
      'Eliminar Prenda',
      '¿Estás segura de que quieres borrar esta prenda? Se eliminará la foto y los datos definitivamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarPrenda(prenda) },
      ]
    );
  };

  const eliminarPrenda = async (prenda: any) => {
    try {
      setLoading(true);

      // 1. Averiguar qué outfits contienen esta prenda
      const { data: relaciones } = await supabase
        .from('outfit_prendas')
        .select('id_outfit')
        .eq('id_prenda', prenda.id);

      const outfitsAfectados = [...new Set((relaciones ?? []).map((r: any) => r.id_outfit))];

      // 2. Borrar las filas de outfit_prendas que apuntan a esta prenda
      await supabase.from('outfit_prendas').delete().eq('id_prenda', prenda.id);

      // 3. Eliminar los outfits que hayan quedado sin ninguna prenda
      if (outfitsAfectados.length > 0) {
        const { data: restantes } = await supabase
          .from('outfit_prendas')
          .select('id_outfit')
          .in('id_outfit', outfitsAfectados);

        const conPrendas = new Set((restantes ?? []).map((r: any) => r.id_outfit));
        const vacios = outfitsAfectados.filter(id => !conPrendas.has(id));
        if (vacios.length > 0) {
          await supabase.from('outfits').delete().in('id', vacios);
        }
      }

      // 4. Borrar imagen del storage
      if (prenda.imagen_url) {
        const rutaImagen = prenda.imagen_url.split('/prendas/')[1];
        if (rutaImagen) await supabase.storage.from('prendas').remove([rutaImagen]);
      }

      // 5. Borrar la prenda
      const { error } = await supabase.from('prendas').delete().eq('id', prenda.id);
      if (error) throw error;

      setModalDetalleVisible(false);
      setPrendas(prev => prev.filter(p => p.id !== prenda.id));
      Alert.alert('¡Limpieza!', 'Prenda eliminada correctamente.');
    } catch (error: any) {
      Alert.alert('Error', 'No pudimos eliminar la prenda: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtrado ─────────────────────────────────────────────────────────────

  const prendasFiltradas = prendas.filter(prenda => {
    if (categoriaActiva === 'Todas') return true;
    if (categoriaActiva === 'Favoritos') return prenda.es_favorito;
    if (categoriaActiva === 'Tops') return ['Tops', 'Jerseys', 'Abrigos y chaquetas', 'Camisas y blusas'].includes(prenda.categoria);
    if (categoriaActiva === 'Pantalones') return ['Pantalones', 'Faldas'].includes(prenda.categoria);
    return prenda.categoria === categoriaActiva;
  });

  // ─── Render prenda card ───────────────────────────────────────────────────

  const renderPrenda = ({ item }: { item: any }) => {
    const dotColor = ESTADO_DOT[(item.estado as EstadoKey)] ?? ESTADO_DOT['Limpio'];
    return (
      <TouchableOpacity style={styles.cardPrenda} onPress={() => verDetalle(item)}>
        <View style={styles.imagenPrendaContenedor}>
          {item.es_favorito && (
            <MaterialCommunityIcons name="star" size={20} color="#5E7E91" style={styles.iconoFavorito} />
          )}
          {item.imagen_url ? (
            <Image source={{ uri: item.imagen_url }} style={styles.imagenMiniatura} />
          ) : (
            <MaterialCommunityIcons name="tshirt-crew" size={40} color="#1A2024" />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 2 }}>
          <Text style={[styles.nombrePrenda, { flex: 1 }]} numberOfLines={1}>{item.nombre}</Text>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor, marginLeft: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Ropa</Text>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={CATEGORIAS_FILTRO} keyExtractor={(item) => item} style={styles.listaCategorias}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pildoraCategoria, categoriaActiva === item && styles.pildoraActiva]}
              onPress={() => setCategoriaActiva(item)}
            >
              <Text style={[styles.textoCategoria, categoriaActiva === item && styles.textoCategoriaActiva]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1A2024" /></View>
      ) : (
        <FlatList
          data={prendasFiltradas} keyExtractor={(item) => item.id}
          renderItem={renderPrenda} numColumns={2} contentContainerStyle={styles.gridPrendas}
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

      {/* ─── MODAL DE SUBIDA ─────────────────────────────────────────────── */}
      <Modal visible={!!imageUri} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalAddContainer}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">

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
              <Text style={{ color: categoria ? '#333' : '#999', fontSize: 16 }}>
                {categoria || 'Selecciona una categoría...'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.input} onPress={() => setModalColorVisible(true)}>
              <Text style={{ color: colores.length > 0 ? '#333' : '#999', fontSize: 16 }}>
                {colores.length > 0 ? `Colores: ${colores.join(', ')}` : 'Selecciona colores...'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonEtiqueta} onPress={pickLabelImage} disabled={loadingOcr}>
              {loadingOcr ? (
                <>
                  <ActivityIndicator size="small" color="#1A2024" />
                  <Text style={styles.botonEtiquetaTexto}>  Leyendo etiqueta...</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name={labelImageUri ? 'tag-check' : 'tag-plus-outline'} size={20} color="#1A2024" />
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
                onChangeText={cambiarTipoTela}
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

            {tags.length > 0 && (
              <View style={styles.tagsWrap}>
                {tags.map(tag => (
                  <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                    <Text style={styles.tagChipTexto}>#{tag}</Text>
                    <MaterialCommunityIcons name="close" size={13} color="#1A2024" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.previewButtonsRow}>
              <TouchableOpacity
                style={[styles.botonSubir, estadoCarga !== '' && { backgroundColor: '#a5d6a7' }]}
                onPress={subirPrenda} disabled={estadoCarga !== ''}
              >
                {estadoCarga !== '' ? (
                  <>
                    <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.textoBotonSubir}>{estadoCarga}</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.textoBotonSubir}>Guardar prenda</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => { limpiar(); setModalColorVisible(false); setModalTelaVisible(false); setModalEstiloVisible(false); }}
                disabled={estadoCarga !== ''}
              >
                <MaterialCommunityIcons name="close" size={24} color="#d9534f" />
              </TouchableOpacity>
            </View>

          </ScrollView>

          <Modal visible={modalColorVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elige los colores</Text>
              <Text style={{ textAlign: 'center', color: '#999', marginBottom: 10, fontStyle: 'italic' }}>↓ Desliza para ver más ↓</Text>
              <FlatList
                data={COLORES_COMUNES} keyExtractor={(item) => item}
                showsVerticalScrollIndicator indicatorStyle="black"
                renderItem={({ item }) => {
                  const sel = colores.includes(item);
                  return (
                    <TouchableOpacity style={[styles.modalOpcionRow, sel && styles.opcionSeleccionada]} onPress={() => toggleColor(item)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.colorBox, { backgroundColor: MAPA_COLORES[item] || '#ccc' }]} />
                        <Text style={[styles.textoOpcion, sel && { fontWeight: 'bold', color: '#1A2024' }]}>{item}</Text>
                      </View>
                      {sel && <MaterialCommunityIcons name="check" size={20} color="#1A2024" />}
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity style={[styles.botonCerrarModal, { backgroundColor: '#1A2024' }]} onPress={() => setModalColorVisible(false)}>
                <Text style={[styles.textoCerrarModal, { color: '#fff' }]}>Aceptar</Text>
              </TouchableOpacity>
            </View></View>
          </Modal>

          <Modal visible={modalCategoriaVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elige la categoría</Text>
              <FlatList data={OPCIONES_CATEGORIA} keyExtractor={(item) => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOpcion} onPress={() => { setCategoria(item); setModalCategoriaVisible(false); }}>
                  <Text style={styles.textoOpcion}>{item}</Text>
                </TouchableOpacity>
              )} />
              <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalCategoriaVisible(false)}>
                <Text style={styles.textoCerrarModal}>Cancelar</Text>
              </TouchableOpacity>
            </View></View>
          </Modal>

          <Modal visible={modalTelaVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elige el tipo de tela</Text>
              <FlatList data={TIPOS_TELA} keyExtractor={(item) => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOpcion} onPress={() => { cambiarTipoTela(item); setModalTelaVisible(false); }}>
                  <Text style={styles.textoOpcion}>{item}</Text>
                </TouchableOpacity>
              )} />
              <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalTelaVisible(false)}>
                <Text style={styles.textoCerrarModal}>Cancelar</Text>
              </TouchableOpacity>
            </View></View>
          </Modal>

          <Modal visible={modalEstiloVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona Estilos (Máx 3)</Text>
              <FlatList data={ESTILOS_COMUNES} keyExtractor={(item) => item} renderItem={({ item }) => {
                const sel = estilos.includes(item);
                return (
                  <TouchableOpacity style={[styles.modalOpcionRow, sel && styles.opcionSeleccionada]} onPress={() => toggleEstilo(item)}>
                    <Text style={[styles.textoOpcion, sel && { fontWeight: 'bold', color: '#1A2024' }]}>{item}</Text>
                    {sel && <MaterialCommunityIcons name="check" size={20} color="#1A2024" />}
                  </TouchableOpacity>
                );
              }} />
              <TouchableOpacity style={[styles.botonCerrarModal, { backgroundColor: '#1A2024' }]} onPress={() => setModalEstiloVisible(false)}>
                <Text style={[styles.textoCerrarModal, { color: '#fff' }]}>Aceptar ({estilos.length}/3)</Text>
              </TouchableOpacity>
            </View></View>
          </Modal>

        </KeyboardAvoidingView>
      </Modal>

      {/* ─── MODAL DE DETALLE ────────────────────────────────────────────── */}
      <Modal visible={modalDetalleVisible} animationType="fade" transparent={false} onRequestClose={() => setModalDetalleVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.botonCerrarDetalle} onPress={() => setModalDetalleVisible(false)}>
            <MaterialCommunityIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {prendaSeleccionada && (
            <>
              {prendaSeleccionada.imagen_url ? (
                <Image source={{ uri: prendaSeleccionada.imagen_url }} style={styles.imagenGrande} resizeMode="contain" />
              ) : (
                <View style={[styles.imagenGrande, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0ece8' }]}>
                  <MaterialCommunityIcons name="tshirt-crew" size={80} color="#ccc" />
                </View>
              )}

              <Animated.View style={[styles.infoPanel, { maxHeight: '72%', transform: [{ translateY: panelAnim }] }]}>
                <TouchableOpacity style={styles.panelHandle} onPress={togglePanel} activeOpacity={0.6}>
                  <View style={styles.panelDragBar} />
                  <MaterialCommunityIcons
                    name={panelColapsado ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#bbb"
                    style={{ marginTop: 2 }}
                  />
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                  {/* Nombre + eliminar */}
                  <View style={styles.detalleHeaderRow}>
                    <Text style={styles.detalleNombre}>{prendaSeleccionada.nombre}</Text>
                    <TouchableOpacity onPress={() => confirmarEliminacion(prendaSeleccionada)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={28} color="#d9534f" />
                    </TouchableOpacity>
                  </View>

                  {/* Estado */}
                  <View style={styles.divisor} />
                  <Text style={{ fontWeight: '700', color: '#444', marginBottom: 10, fontSize: 14 }}>Estado</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                    {ESTADOS.map(e => {
                      const activo = estadoPrenda === e.key;
                      return (
                        <TouchableOpacity
                          key={e.key}
                          style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: 12, paddingVertical: 8,
                            borderRadius: 20, borderWidth: 2,
                            borderColor: activo ? e.color : '#E2E8F0',
                            backgroundColor: activo ? e.color + '18' : '#f9f9f9',
                          }}
                          onPress={() => actualizarEstado(e.key)}
                        >
                          <MaterialCommunityIcons name={e.icon as any} size={16} color={activo ? e.color : '#bbb'} />
                          <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: activo ? '700' : '400', color: activo ? e.color : '#999' }}>
                            {e.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Detalles */}
                  <View style={styles.divisor} />
                  <View style={styles.detalleFila}>
                    <MaterialCommunityIcons name="tag-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>Categoría: <Text style={styles.bold}>{prendaSeleccionada.categoria}</Text></Text>
                  </View>
                  <View style={styles.detalleFila}>
                    <MaterialCommunityIcons name="palette-outline" size={20} color="#666" />
                    <Text style={styles.detalleTexto}>Color: <Text style={styles.bold}>{prendaSeleccionada.color}</Text></Text>
                  </View>
                  {prendaSeleccionada.tipo_tela ? (
                    <View style={styles.detalleFila}>
                      <MaterialCommunityIcons name="texture" size={20} color="#666" />
                      <Text style={styles.detalleTexto}>Tela: <Text style={styles.bold}>{prendaSeleccionada.tipo_tela}</Text></Text>
                    </View>
                  ) : null}
                  {prendaSeleccionada.estilo ? (
                    <View style={styles.detalleFila}>
                      <MaterialCommunityIcons name="flash-outline" size={20} color="#666" />
                      <Text style={styles.detalleTexto}>Estilo: <Text style={styles.bold}>{Array.isArray(prendaSeleccionada.estilo) ? prendaSeleccionada.estilo.join(', ') : prendaSeleccionada.estilo}</Text></Text>
                    </View>
                  ) : null}

                  {/* Símbolos de lavado */}
                  <View style={styles.divisor} />
                  <Text style={{ fontWeight: '700', color: '#444', marginBottom: 8, fontSize: 14 }}>Símbolos de la etiqueta</Text>

                  {cargandoSimbolos ? (
                    <ActivityIndicator size="small" color="#1A2024" style={{ marginBottom: 10 }} />
                  ) : simbolosDePrenda.length > 0 ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {simbolosDePrenda.map(s => (
                        <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text style={{ fontSize: 12, color: '#1A2024', marginRight: 4 }}>{s.nombre}</Text>
                          <TouchableOpacity onPress={() => toggleSimbolo(s)}>
                            <MaterialCommunityIcons name="close" size={12} color="#1A2024" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ color: '#bbb', fontSize: 13, marginBottom: 10, fontStyle: 'italic' }}>
                      Sin símbolos añadidos
                    </Text>
                  )}

                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#1A2024', borderStyle: 'dashed', borderRadius: 10, padding: 12, marginBottom: 16 }}
                    onPress={() => { cargarTodosSimbolos(); setModalSimbolosVisible(true); }}
                  >
                    <MaterialCommunityIcons name="tag-plus-outline" size={18} color="#1A2024" />
                    <Text style={{ marginLeft: 8, color: '#1A2024', fontWeight: '600', fontSize: 14 }}>
                      {simbolosDePrenda.length > 0 ? 'Editar símbolos de lavado' : 'Añadir símbolos de lavado'}
                    </Text>
                  </TouchableOpacity>

                </ScrollView>
              </Animated.View>
            </>
          )}

          {/* ─── MODAL DE SÍMBOLOS — anidado dentro del de detalle ── */}
          {/* Esto es necesario en React Native para que aparezca sobre el modal padre */}
          <Modal
            visible={modalSimbolosVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setModalSimbolosVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: '#fff' }}>

              <View style={{ paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 }}>
                    ¿Qué símbolos aparecen en tu etiqueta?
                  </Text>
                  <TouchableOpacity onPress={() => setModalSimbolosVisible(false)}>
                    <MaterialCommunityIcons name="close" size={26} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                  {simbolosDePrenda.length} seleccionado{simbolosDePrenda.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {todosSimbolos.length === 0 ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#1A2024" />
                </View>
              ) : (
                <FlatList
                  data={todosSimbolos}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const sel = simbolosDePrenda.some(s => s.id === item.id);
                    return (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row', alignItems: 'center',
                          paddingHorizontal: 20, paddingVertical: 14,
                          borderBottomWidth: 1, borderBottomColor: '#F4F6F8',
                          backgroundColor: sel ? '#faf6f2' : '#fff',
                        }}
                        onPress={() => toggleSimbolo(item)}
                      >
                        {/* Icono visual del símbolo */}
                        <SimboloIcono codigo={item.codigo} />

                        {/* Texto */}
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '600', color: sel ? '#1A2024' : '#333', fontSize: 15 }}>
                            {item.nombre}
                          </Text>
                          {item.descripcion ? (
                            <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{item.descripcion}</Text>
                          ) : null}
                          <View style={{ flexDirection: 'row', marginTop: 5, gap: 6 }}>
                            <View style={{ backgroundColor: '#F4F6F8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                              <Text style={{ color: '#888', fontSize: 11, textTransform: 'capitalize' }}>{item.categoria}</Text>
                            </View>
                            {item.temp_maxima ? (
                              <View style={{ backgroundColor: '#E2E8F0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                                <Text style={{ color: '#1A2024', fontSize: 11, fontWeight: '600' }}>máx {item.temp_maxima}°C</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>

                        {/* Check */}
                        {sel ? (
                          <MaterialCommunityIcons name="check-circle" size={26} color="#1A2024" style={{ marginLeft: 10 }} />
                        ) : (
                          <MaterialCommunityIcons name="circle-outline" size={26} color="#E2E8F0" style={{ marginLeft: 10 }} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </Modal>

        </View>
      </Modal>

    </View>
  );
}
