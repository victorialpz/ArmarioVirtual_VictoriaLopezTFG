import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

// ⚠️ RECUERDA: Cambia esta URL cuando reinicies Colab
const MI_API_URL = "https://eleven-worlds-open.loca.lt/quitar-fondo";

export const useSubirPrenda = (onSuccess?: () => void) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estadoCarga, setEstadoCarga] = useState('');
  
  // NUEVO: Añadimos descripción opcional
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [color, setColor] = useState('');
  const [tipoTela, setTipoTela] = useState('');
  const [estilos, setEstilos] = useState<string[]>([]); 

  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      logger.warn('useSubirPrenda', 'Permiso denegado');
      Alert.alert('Permiso necesario', '¡Necesitamos permisos para acceder a tu galería!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // <-- MEJORA 3: Desactivamos el recorte forzado 1:1. Formato libre.
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleEstilo = (estilo: string) => {
    if (estilos.includes(estilo)) {
      setEstilos(estilos.filter(e => e !== estilo));
    } else {
      if (estilos.length >= 2) {
        Alert.alert("Límite alcanzado", "Una prenda solo puede pertenecer a un máximo de 2 estilos.");
        return;
      }
      setEstilos([...estilos, estilo]);
    }
  };

  const subirPrenda = async () => {
    if (!imageUri) return;
    
    if (!categoria || !color || !tipoTela || estilos.length === 0) {
      Alert.alert("Faltan datos", "Por favor, rellena los campos obligatorios (la descripción es opcional).");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión.");

      setEstadoCarga('Procesando imagen');

      const formData = new FormData();
      formData.append('file', { uri: imageUri, name: 'prenda.jpg', type: 'image/jpeg' } as any);

      const apiResponse = await fetch(MI_API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });

      if (!apiResponse.ok) throw new Error("Fallo al conectar con la IA.");

      const bufferImagen = await apiResponse.arrayBuffer();

      setEstadoCarga('Guardando en tu armario... ☁️');
      const fileName = `${user.id}/${Date.now()}_prenda.jpeg`;

      const { error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, bufferImagen, { contentType: 'image/jpeg', upsert: false });

      if (uploadError) throw uploadError;

      const urlResponse = supabase.storage.from('prendas').getPublicUrl(fileName);
      const publicUrl = urlResponse.data?.publicUrl || (urlResponse as any).publicURL;

      const estilosString = estilos.join(', ');
      
      // MEJORA 2: Nombre autogenerado para mantener el orden, y la descripción libre va aparte
      const nombreGenerado = `${categoria} ${color}`;

      const { error: dbError } = await supabase.from('prendas').insert({
        id_usuario: user.id, 
        nombre: nombreGenerado, 
        descripcion: descripcion, // Guardamos la descripción libre
        categoria: categoria, 
        color: color, 
        tipo_tela: tipoTela, 
        estilo: estilos, // <-- ¡CORRECCIÓN CRUCIAL! Pasamos el Array directamente a Supabase
        imagen_url: publicUrl,
      });

      if (dbError) throw dbError;

      Alert.alert('¡Magia propia!', 'La prenda se ha guardado correctamente.');
      
      // Limpieza
      setImageUri(null); setDescripcion(''); setCategoria(''); setColor(''); setTipoTela(''); setEstilos([]);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      Alert.alert('Error', 'El servidor de la IA está apagado o la URL ha caducado.');
    } finally {
      setEstadoCarga('');
    }
  };

  return {
    imageUri, setImageUri, estadoCarga, 
    descripcion, setDescripcion, // Exportamos la descripción
    categoria, setCategoria, 
    color, setColor,
    tipoTela, setTipoTela,
    estilos, toggleEstilo, setEstilos,
    modalVisible, setModalVisible, 
    pickImage, subirPrenda
  };
};