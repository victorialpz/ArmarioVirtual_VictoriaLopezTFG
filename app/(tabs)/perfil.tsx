import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    usuario: '',
    correo: '',
    contrasena: '',
    telefono: '',
    nombre: '',
    apellidos: '',
    sexo: '',
    edad: '',
    altura: ''
  });

  // Función para actualizar el estado
  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
  <ScrollView style={styles.container} showsVerticalScrollIndicator={false} 
  keyboardShouldPersistTaps="handled" >
      
      {/* 1. CABECERA DEL PERFIL */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#5c4033" />
        </View>
        <Text style={styles.titulo}>Mi Perfil</Text>
        <Text style={styles.subtitulo}>Configura tus datos personales</Text>
      </View>

      {/* 2. FORMULARIO */}
      <View style={styles.formContainer}>
        
        {/* Usuario */}
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            value={formData.usuario}
            onChangeText={(text) => handleChange('usuario', text)}
          />
        </View>

        {/* Correo */}
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="email" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            value={formData.correo}
            onChangeText={(text) => handleChange('correo', text)}
          />
        </View>

        {/* Contraseña */}
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry={true}
            value={formData.contrasena}
            onChangeText={(text) => handleChange('contrasena', text)}
          />
        </View>

        {/* Teléfono */}
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons name="phone" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            keyboardType="phone-pad"
            value={formData.telefono}
            onChangeText={(text) => handleChange('telefono', text)}
          />
        </View>

        {/* Nombre y Apellidos (En fila) */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              value={formData.apellidos}
              onChangeText={(text) => handleChange('apellidos', text)}
            />
          </View>
        </View>

        {/* Sexo, Edad y Altura (En fila) */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <MaterialCommunityIcons name="gender-male-female" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Sexo"
              value={formData.sexo}
              onChangeText={(text) => handleChange('sexo', text)}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.8, marginRight: 10 }]}>
            <TextInput
              style={styles.input}
              placeholder="Edad"
              keyboardType="numeric"
              value={formData.edad}
              onChangeText={(text) => handleChange('edad', text)}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.8 }]}>
            <MaterialCommunityIcons name="human-male-height" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="cm"
              keyboardType="numeric"
              value={formData.altura}
              onChangeText={(text) => handleChange('altura', text)}
            />
          </View>
        </View>

      </View>

      {/* 3. BOTÓN DE GUARDAR */}
      <TouchableOpacity style={styles.botonGuardar}>
        <Text style={styles.textoBoton}>Guardar Cambios</Text>
      </TouchableOpacity>

      {/* Espaciado extra al final para el scroll */}
      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

// --- ESTILOS VISUALES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 10,
    backgroundColor: '#f9f5f3',
    borderRadius: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonGuardar: {
    backgroundColor: '#5c4033', // Tu color corporativo
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});