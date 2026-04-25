import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegistroDatosScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    usuario: '',
    nombre: '',
    apellidos: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegistroCompleto = async () => {
    Keyboard.dismiss();
    const { email, password, usuario, nombre, apellidos, telefono } = formData;

    if (!email || !password || !usuario) {
      Alert.alert('Error', 'Correo, Contraseña y Usuario son obligatorios.');
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert('Error en el registro', authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('usuarios') 
        .insert([
          {
            id: authData.user.id,
            usuario,
            nombre,
            apellidos,
            telefono,
            email
          }
        ]);

      if (profileError) {
        if (profileError.code === '23505') {
          Alert.alert('Error', 'Ese nombre de usuario ya está cogido. Prueba otro.');
        } else {
          Alert.alert('Error al guardar perfil', profileError.message);
        }
      } else {
        Alert.alert('¡Bienvenido!', 'Cuenta creada con éxito.');
        router.replace('/(tabs)');
      }
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 40 }}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-plus" size={60} color="#5c4033" />
        <Text style={styles.titulo}>Crea tu cuenta</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Datos de acceso</Text>
        <TextInput style={styles.input} placeholder="Correo electrónico" value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Contraseña (mín. 6 caracteres)" value={formData.password} onChangeText={(t) => setFormData({...formData, password: t})} secureTextEntry />
        
        <Text style={styles.label}>Información de perfil</Text>
        <TextInput style={styles.input} placeholder="Nombre de Usuario (único)" value={formData.usuario} onChangeText={(t) => setFormData({...formData, usuario: t})} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Nombre" value={formData.nombre} onChangeText={(t) => setFormData({...formData, nombre: t})} />
        <TextInput style={styles.input} placeholder="Apellidos" value={formData.apellidos} onChangeText={(t) => setFormData({...formData, apellidos: t})} />
        <TextInput style={styles.input} placeholder="Teléfono" value={formData.telefono} onChangeText={(t) => setFormData({...formData, telefono: t})} keyboardType="phone-pad" />

        {loading ? (
          <ActivityIndicator size="large" color="#5c4033" />
        ) : (
          <TouchableOpacity style={styles.boton} onPress={handleRegistroCompleto}>
            <Text style={styles.textoBoton}>Registrarme y empezar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f5f3', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#5c4033', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  boton: { backgroundColor: '#5c4033', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});