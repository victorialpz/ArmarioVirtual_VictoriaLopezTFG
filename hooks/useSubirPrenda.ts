import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

// ⚠️ RECUERDA: Cambia esta URL cuando reinicies Colab
const MI_API_URL = "https://odd-animals-cover.loca.lt/quitar-fondo";

export const useSubirPrenda = (onSuccess?: () => void) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estadoCarga, setEstadoCarga] = useState('');
  
  // NUEVO: Añadimos descripción opcional
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [colores, setColores] = useState<string[]>([]); // Cambiado a 'colores' (Array)
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
      mediaTypes: ['images'], // Ojo: ImagePicker.MediaTypeOptions.Images en versiones nuevas de Expo
      allowsEditing: false, // <-- MEJORA 3: Desactivamos el recorte forzado 1:1. Formato libre.
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleEstilo = (estilo: string) => {
    setEstilos((prev) => {
      if (prev.includes(estilo)) return prev.filter((e) => e !== estilo);
      if (prev.length >= 3) return prev; // Límite de 3
      return [...prev, estilo];
    });
  }

  const toggleColor = (colorSeleccionado: string) => {
    setColores((prev) => {
      if (prev.includes(colorSeleccionado)) {
        return prev.filter((c) => c !== colorSeleccionado);
      }
      return [...prev, colorSeleccionado];
    });
  };

  const subirPrenda = async () => {
    if (!imageUri) return;
    
    // Comprobamos que el array de colores no esté vacío
    if (!categoria || colores.length === 0 || !tipoTela || estilos.length === 0) {
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

      // Unimos el array de colores en un texto para el nombre y la base de datos
      const coloresString = colores.join(', ');
      
      // MEJORA 2: Nombre autogenerado para mantener el orden, y la descripción libre va aparte
      const nombreGenerado = `${categoria} ${coloresString}`;

      // En tu función subirPrenda, dentro del .insert(...) de Supabase:
const { error: dbError } = await supabase.from('prendas').insert({
  id_usuario: user.id, 
  nombre: nombreGenerado, 
  categoria: categoria, 
  color: coloresString,
  tipo_tela: tipoTela, 
  estilo: estilos,
  imagen_url: publicUrl,
  // --- NUEVOS CAMPOS PARA LA LAVADORA ---
  temp_lavado: 30, // Ejemplo: esto lo debería detectar tu IA
  es_delicado: tipoTela === 'Seda' || tipoTela === 'Gasa', // Lógica básica de ejemplo
});

      if (dbError) throw dbError;

      Alert.alert('¡Magia propia!', 'La prenda se ha guardado correctamente.');
      
      // Limpieza (Aseguramos limpiar los arrays)
      setImageUri(null); 
      setDescripcion(''); 
      setCategoria(''); 
      setColores([]); 
      setTipoTela(''); 
      setEstilos([]);
      if (onSuccess) onSuccess();

    } catch (error: any) {
     // Alert.alert('Error', 'El servidor de la IA está apagado o la URL ha caducado.');
      Alert.alert('Error Real', error.message);
    } finally {
      setEstadoCarga('');
    }
  };

  return {
    imageUri, setImageUri, estadoCarga, 
    descripcion, setDescripcion, 
    categoria, setCategoria, 
    colores, setColores, toggleColor, // <-- Exportamos colores y toggleColor
    tipoTela, setTipoTela,
    estilos, toggleEstilo, setEstilos,
    modalVisible, setModalVisible, 
    pickImage, subirPrenda
  };
};