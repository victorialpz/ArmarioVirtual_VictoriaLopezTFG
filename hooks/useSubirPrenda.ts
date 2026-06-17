import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

const API_BASE = "http://192.168.1.135:8000";
const MI_API_URL = `${API_BASE}/quitar-fondo`;
const MI_OCR_URL  = `${API_BASE}/leer-etiqueta`;

export const useSubirPrenda = (onSuccess?: () => void) => {
  // ── Imagen de la prenda ────────────────────────────────────────────
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estadoCarga, setEstadoCarga] = useState('');

  // ── Campos del formulario ─────────────────────────────────────────
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria]     = useState('');
  const [colores, setColores]         = useState<string[]>([]);
  const [tipoTela, setTipoTela]       = useState('');
  const [telaAutoDetectada, setTelaAutoDetectada] = useState(false);
  const [estilos, setEstilos]         = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // ── Etiqueta física (OCR) ─────────────────────────────────────────
  const [labelImageUri, setLabelImageUri] = useState<string | null>(null);
  const [etiquetaOcr, setEtiquetaOcr]     = useState('');
  const [loadingOcr, setLoadingOcr]        = useState(false);

  // ── Tags de organización del usuario ─────────────────────────────
  const [tags, setTags]       = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // ──────────────────────────────────────────────────────────────────
  // GALERÍA — prenda principal
  // ──────────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      logger.warn('useSubirPrenda', 'Permiso denegado');
      Alert.alert('Permiso necesario', '¡Necesitamos permisos para acceder a tu galería!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // ──────────────────────────────────────────────────────────────────
  // GALERÍA — foto de etiqueta física → llama al OCR automáticamente
  // ──────────────────────────────────────────────────────────────────
  const pickLabelImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1.0, // máxima calidad para que el OCR funcione bien
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setLabelImageUri(uri);
    setLoadingOcr(true);

    try {
      const formData = new FormData();
      formData.append('file', { uri, name: 'etiqueta.jpg', type: 'image/jpeg' } as any);

      const response = await fetch(MI_OCR_URL, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('El servidor no pudo leer la etiqueta.');

      const data = await response.json();
      setEtiquetaOcr(data.ocr_text || '');

      if (data.tipo_tela_sugerido && !tipoTela) {
        setTipoTela(data.tipo_tela_sugerido);
        setTelaAutoDetectada(true);
      }
    } catch (error: any) {
      Alert.alert('OCR fallido', `${error.message}\nPuedes escribir el texto manualmente.`);
    } finally {
      setLoadingOcr(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // TAGS — gestión
  // ──────────────────────────────────────────────────────────────────
  const addTag = (input: string) => {
    const clean = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (!clean || tags.includes(clean) || tags.length >= 10) return;
    setTags(prev => [...prev, clean]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  // ──────────────────────────────────────────────────────────────────
  // ESTILOS y COLORES — toggles
  // ──────────────────────────────────────────────────────────────────
  const cambiarTipoTela = (tela: string) => {
    setTipoTela(tela);
    setTelaAutoDetectada(false);
  };

  const toggleEstilo = (estilo: string) => {
    setEstilos(prev => {
      if (prev.includes(estilo)) return prev.filter(e => e !== estilo);
      if (prev.length >= 3) return prev;
      return [...prev, estilo];
    });
  };

  const toggleColor = (color: string) => {
    setColores(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // ──────────────────────────────────────────────────────────────────
  // SUBIR PRENDA — flujo completo
  // ──────────────────────────────────────────────────────────────────
  const subirPrenda = async () => {
    if (!imageUri) return;
    if (!categoria || colores.length === 0 || !tipoTela || estilos.length === 0) {
      Alert.alert('Faltan datos', 'Por favor, rellena los campos obligatorios.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión.');

      setEstadoCarga('Procesando imagen');

      const formData = new FormData();
      formData.append('file', { uri: imageUri, name: 'prenda.jpg', type: 'image/jpeg' } as any);

      const apiResponse = await fetch(MI_API_URL, { method: 'POST', body: formData });
      if (!apiResponse.ok) throw new Error('Fallo al conectar con la IA.');

      const bufferImagen = await apiResponse.arrayBuffer();

      setEstadoCarga('Guardando en tu armario... ☁️');
      const fileName = `${user.id}/${Date.now()}_prenda.png`;

      const { error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, bufferImagen, { contentType: 'image/png', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('prendas').getPublicUrl(fileName);
      const publicUrl = urlData?.publicUrl;

      const coloresString  = colores.join(', ');
      const nombreGenerado = `${categoria} ${coloresString}`;

      const { error: dbError } = await supabase.from('prendas').insert({
        id_usuario:   user.id,
        nombre:       nombreGenerado,
        categoria,
        color:        coloresString,
        tipo_tela:    tipoTela,
        estilo:       estilos,
        imagen_url:   publicUrl,
        temp_lavado:  30,
        es_delicado:  tipoTela === 'Seda' || tipoTela === 'Gasa',
        // ── nuevos campos ──────────────────────────────────────────
        etiqueta_ocr: etiquetaOcr || null,
        tags,
      });
      if (dbError) throw dbError;

      Alert.alert('¡Et voilá!', 'La prenda se ha guardado correctamente.');
      _limpiar();
      if (onSuccess) onSuccess();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setEstadoCarga('');
    }
  };

  const _limpiar = () => {
    setImageUri(null);
    setDescripcion('');
    setCategoria('');
    setColores([]);
    setTipoTela('');
    setTelaAutoDetectada(false);
    setEstilos([]);
    setLabelImageUri(null);
    setEtiquetaOcr('');
    setTags([]);
    setTagInput('');
  };

  return {
    // prenda
    imageUri, setImageUri, estadoCarga,
    // formulario
    descripcion, setDescripcion,
    categoria, setCategoria,
    colores, setColores, toggleColor,
    tipoTela, cambiarTipoTela, telaAutoDetectada,
    estilos, toggleEstilo, setEstilos,
    modalVisible, setModalVisible,
    // etiqueta OCR
    labelImageUri, etiquetaOcr, setEtiquetaOcr, loadingOcr, pickLabelImage,
    // tags
    tags, tagInput, setTagInput, addTag, removeTag,
    // acciones
    pickImage, subirPrenda,
  };
};
