import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Importante para redireccionar al login
import React, { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function PerfilScreen() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    usuario: '',
    correo: '',
    contrasena: '********',
    telefono: '',
    nombre: '',
    apellidos: '',
    sexo: '',
    edad: '',
    altura: ''
  });

  useEffect(() => {
    cargarDatosDelUsuario();
  }, []);

  const cargarDatosDelUsuario = async () => {
    try {
      logger.info('PerfilScreen', 'Cargando datos de usuario');
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          logger.info('PerfilScreen', 'Datos de usuario cargados', { userId: user.id });
          setFormData({
            usuario: data.usuario || '',
            correo: data.email || '',
            contrasena: '********',
            telefono: data.telefono || '',
            nombre: data.nombre || '',
            apellidos: data.apellidos || '',
            sexo: data.sexo || '',
            edad: data.edad ? data.edad.toString() : '',
            altura: data.altura ? data.altura.toString() : ''
          });
        }
      }
    } catch (error: any) {
      logger.error('PerfilScreen', error);
      Alert.alert('Error', 'No se pudieron cargar tus datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const guardarCambios = async () => {
    try {
      logger.info('PerfilScreen', 'Guardando cambios de perfil', { formData: { usuario: formData.usuario, telefono: formData.telefono, sexo: formData.sexo } });
      setGuardando(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('usuarios')
          .update({
            usuario: formData.usuario,
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            telefono: formData.telefono,
            sexo: formData.sexo,
            edad: formData.edad ? parseInt(formData.edad) : null,
            altura: formData.altura ? parseFloat(formData.altura) : null,
          })
          .eq('id', user.id);

        if (error) throw error;
        logger.info('PerfilScreen', 'Perfil actualizado correctamente', { userId: user.id });
        Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.');
      }
    } catch (error: any) {
      logger.error('PerfilScreen', error);
      Alert.alert('Error', error.message);
    } finally {
      setGuardando(false);
    }
  };

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir de tu armario virtual?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar Sesión", 
          style: "destructive", 
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              logger.error('PerfilScreen', error, { action: 'signOut' });
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            } else {
              logger.info('PerfilScreen', 'Sesión cerrada por el usuario');
              router.replace('/login');
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5c4033" />
      </View>
    );
  }

  return (
    // KeyboardAvoidingView ajusta la vista cuando aparece el teclado
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#5c4033" />
          </View>
          <Text style={styles.titulo}>Mi Perfil</Text>
          <Text style={styles.subtitulo}>Configura tus datos personales</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Usuario" value={formData.usuario} onChangeText={(text) => handleChange('usuario', text)} />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: '#f0f0f0' }]}>
            <MaterialCommunityIcons name="email" size={20} color="#999" style={styles.icon} />
            <TextInput style={[styles.input, { color: '#999' }]} placeholder="Correo electrónico" value={formData.correo} editable={false} />
          </View>

          <View style={styles.inputGroup}>
            <MaterialCommunityIcons name="phone" size={20} color="#666" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Teléfono" keyboardType="phone-pad" value={formData.telefono} onChangeText={(text) => handleChange('telefono', text)} />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Nombre" value={formData.nombre} onChangeText={(text) => handleChange('nombre', text)} />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput style={styles.input} placeholder="Apellidos" value={formData.apellidos} onChangeText={(text) => handleChange('apellidos', text)} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <MaterialCommunityIcons name="gender-male-female" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Sexo" value={formData.sexo} onChangeText={(text) => handleChange('sexo', text)} />
            </View>
            <View style={[styles.inputGroup, { flex: 0.8, marginRight: 10 }]}>
              <TextInput style={styles.input} placeholder="Edad" keyboardType="numeric" value={formData.edad} onChangeText={(text) => handleChange('edad', text)} />
            </View>
            <View style={[styles.inputGroup, { flex: 0.8 }]}>
              <MaterialCommunityIcons name="human-male-height" size={20} color="#666" style={styles.icon} />
              <TextInput style={styles.input} placeholder="cm" keyboardType="numeric" value={formData.altura} onChangeText={(text) => handleChange('altura', text)} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.botonGuardar} onPress={guardarCambios} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Guardar Cambios</Text>}
        </TouchableOpacity>

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity style={styles.botonLogout} onPress={cerrarSesion}>
          <MaterialCommunityIcons name="logout" size={20} color="#d9534f" style={{ marginRight: 8 }} />
          <Text style={styles.textoBotonLogout}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  avatarContainer: { marginBottom: 10, backgroundColor: '#f9f5f3', borderRadius: 50 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
  formContainer: { padding: 20 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 55, elevation: 2 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  botonGuardar: { backgroundColor: '#5c4033', marginHorizontal: 20, borderRadius: 15, paddingVertical: 18, alignItems: 'center', elevation: 3 },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Estilos nuevos para el botón de logout
  botonLogout: { 
    flexDirection: 'row',
    marginTop: 25, 
    marginHorizontal: 20, 
    paddingVertical: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d9534f',
    borderRadius: 15,
  },
  textoBotonLogout: { color: '#d9534f', fontSize: 16, fontWeight: '600' }
});