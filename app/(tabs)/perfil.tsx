import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '@/styles/screens/perfil';

type CatalogoLavadora = {
  id: string;
  marca: string;
  modelo: string;
  carga_maxima_kg: number | null;
  temp_maxima: number | null;
  programas_temp: number[] | null;
  velocidad_max: number | null;
  tiene_delicado: boolean;
  tiene_lana: boolean;
  tiene_vapor: boolean;
  clase_eficiencia: string | null;
};

type LavadoraData = {
  id_catalogo: string | null;
  marca: string;
  modelo: string;
  carga_maxima_kg: string;
  temp_maxima: string;
  velocidad_max: string;
  tiene_delicado: boolean;
  tiene_lana: boolean;
  tiene_vapor: boolean;
  clase_eficiencia: string;
};

const LAVADORA_VACIA: LavadoraData = {
  id_catalogo: null,
  marca: '',
  modelo: '',
  carga_maxima_kg: '',
  temp_maxima: '',
  velocidad_max: '',
  tiene_delicado: false,
  tiene_lana: false,
  tiene_vapor: false,
  clase_eficiencia: '',
};

export default function PerfilScreen() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    usuario: '',
    correo: '',
    telefono: '',
    nombre: '',
    apellidos: '',
    sexo: '',
    edad: '',
    altura: '',
  });

  const [lavadora, setLavadora] = useState<LavadoraData>(LAVADORA_VACIA);
  const [catalogo, setCatalogo] = useState<CatalogoLavadora[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<'catalogo' | 'manual'>('catalogo');
  const [showMarcaPicker, setShowMarcaPicker] = useState(false);
  const [showModeloPicker, setShowModeloPicker] = useState(false);

  const marcasDisponibles = [...new Set(catalogo.map(l => l.marca))].sort();
  const modelosFiltrados = catalogo.filter(l => l.marca === lavadora.marca);

  useEffect(() => {
    Promise.all([cargarDatosDelUsuario(), cargarCatalogo()]);
  }, []);

  const cargarCatalogo = async () => {
    const { data, error } = await supabase
      .from('catalogo_lavadoras')
      .select('*')
      .order('marca');
    if (!error && data) setCatalogo(data);
  };

  const cargarDatosDelUsuario = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const [{ data: usuarioData }, { data: lavadoraData }] = await Promise.all([
          supabase.from('usuarios').select('*').eq('id', user.id).single(),
          supabase.from('lavadoras').select('*').eq('id_usuario', user.id).maybeSingle(),
        ]);

        if (usuarioData) {
          logger.info('PerfilScreen', 'Datos de usuario cargados', { userId: user.id });
          setFormData({
            usuario:   usuarioData.usuario   || '',
            correo:    usuarioData.email     || '',
            telefono:  usuarioData.telefono  || '',
            nombre:    usuarioData.nombre    || '',
            apellidos: usuarioData.apellidos || '',
            sexo:      usuarioData.sexo      || '',
            edad:      usuarioData.edad   ? usuarioData.edad.toString()   : '',
            altura:    usuarioData.altura ? usuarioData.altura.toString() : '',
          });
        }

        if (lavadoraData) {
          setLavadora({
            id_catalogo:     lavadoraData.id_catalogo     || null,
            marca:           lavadoraData.marca           || '',
            modelo:          lavadoraData.modelo          || '',
            carga_maxima_kg: lavadoraData.carga_maxima_kg ? lavadoraData.carga_maxima_kg.toString() : '',
            temp_maxima:     lavadoraData.temp_maxima     ? lavadoraData.temp_maxima.toString()     : '',
            velocidad_max:   lavadoraData.velocidad_max   ? lavadoraData.velocidad_max.toString()   : '',
            tiene_delicado:  lavadoraData.tiene_delicado  || false,
            tiene_lana:      lavadoraData.tiene_lana      || false,
            tiene_vapor:     lavadoraData.tiene_vapor     || false,
            clase_eficiencia: lavadoraData.clase_eficiencia || '',
          });
          setModoSeleccion(lavadoraData.id_catalogo ? 'catalogo' : 'manual');
        }
      }
    } catch (error: any) {
      logger.error('PerfilScreen', error);
      Alert.alert('Error', 'No se pudieron cargar tus datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarModeloCatalogo = (item: CatalogoLavadora) => {
    setLavadora({
      id_catalogo:     item.id,
      marca:           item.marca,
      modelo:          item.modelo,
      carga_maxima_kg: item.carga_maxima_kg ? item.carga_maxima_kg.toString() : '',
      temp_maxima:     item.temp_maxima     ? item.temp_maxima.toString()     : '',
      velocidad_max:   item.velocidad_max   ? item.velocidad_max.toString()   : '',
      tiene_delicado:  item.tiene_delicado,
      tiene_lana:      item.tiene_lana,
      tiene_vapor:     item.tiene_vapor,
      clase_eficiencia: item.clase_eficiencia || '',
    });
    setShowModeloPicker(false);
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const guardarCambios = async () => {
    try {
      logger.info('PerfilScreen', 'Guardando cambios de perfil');
      setGuardando(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const updateUsuario = supabase
          .from('usuarios')
          .update({
            usuario:   formData.usuario,
            nombre:    formData.nombre,
            apellidos: formData.apellidos,
            telefono:  formData.telefono,
            sexo:      formData.sexo,
            edad:      formData.edad   ? parseInt(formData.edad)      : null,
            altura:    formData.altura ? parseFloat(formData.altura)  : null,
          })
          .eq('id', user.id);

        const upsertLavadora = supabase
          .from('lavadoras')
          .upsert({
            id_usuario:      user.id,
            id_catalogo:     lavadora.id_catalogo,
            marca:           lavadora.marca || 'Desconocida',
            modelo:          lavadora.modelo          || null,
            carga_maxima_kg: lavadora.carga_maxima_kg ? parseFloat(lavadora.carga_maxima_kg) : null,
            temp_maxima:     lavadora.temp_maxima     ? parseInt(lavadora.temp_maxima)        : null,
            velocidad_max:   lavadora.velocidad_max   ? parseInt(lavadora.velocidad_max)      : null,
            tiene_delicado:  lavadora.tiene_delicado,
            tiene_lana:      lavadora.tiene_lana,
            tiene_vapor:     lavadora.tiene_vapor,
            clase_eficiencia: lavadora.clase_eficiencia || null,
          }, { onConflict: 'id_usuario' });

        const [{ error: e1 }, { error: e2 }] = await Promise.all([updateUsuario, upsertLavadora]);
        if (e1) throw e1;
        if (e2) throw e2;

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

          {/* --- SECCIÓN LAVADORA --- */}
          <Text style={[styles.subtitulo, { alignSelf: 'flex-start', marginTop: 15, marginBottom: 10, fontWeight: 'bold' }]}>Mi Lavadora</Text>

          {/* Toggle catálogo / manual */}
          <View style={[styles.row, { marginBottom: 15, backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4 }]}>
            <TouchableOpacity
              style={[{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
                modoSeleccion === 'catalogo' && { backgroundColor: '#5c4033' }]}
              onPress={() => setModoSeleccion('catalogo')}
            >
              <Text style={{ color: modoSeleccion === 'catalogo' ? '#fff' : '#666', fontWeight: '600', fontSize: 13 }}>
                Del catálogo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
                modoSeleccion === 'manual' && { backgroundColor: '#5c4033' }]}
              onPress={() => { setModoSeleccion('manual'); setLavadora(l => ({ ...l, id_catalogo: null })); }}
            >
              <Text style={{ color: modoSeleccion === 'manual' ? '#fff' : '#666', fontWeight: '600', fontSize: 13 }}>
                Introducir manualmente
              </Text>
            </TouchableOpacity>
          </View>

          {modoSeleccion === 'catalogo' ? (
            <>
              {/* Picker de marca */}
              <TouchableOpacity style={styles.inputGroup} onPress={() => setShowMarcaPicker(true)}>
                <MaterialCommunityIcons name="washing-machine" size={20} color="#666" style={styles.icon} />
                <Text style={[styles.input, { color: lavadora.marca ? '#333' : '#aaa' }]}>
                  {lavadora.marca || 'Selecciona una marca'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {/* Picker de modelo — solo visible tras elegir marca */}
              {lavadora.marca ? (
                <TouchableOpacity style={styles.inputGroup} onPress={() => setShowModeloPicker(true)}>
                  <MaterialCommunityIcons name="tag-outline" size={20} color="#666" style={styles.icon} />
                  <Text style={[styles.input, { color: lavadora.modelo ? '#333' : '#aaa' }]}>
                    {lavadora.modelo || 'Selecciona un modelo'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              ) : null}

              {/* Specs del modelo seleccionado (solo lectura) */}
              {lavadora.modelo ? (
                <View style={{ backgroundColor: '#f9f5f2', borderRadius: 12, padding: 15, marginBottom: 15 }}>
                  <Text style={{ fontWeight: '600', color: '#5c4033', marginBottom: 8 }}>Especificaciones</Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>
                    Carga máx: <Text style={{ fontWeight: '600', color: '#333' }}>{lavadora.carga_maxima_kg} kg</Text>
                  </Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>
                    Temp. máxima: <Text style={{ fontWeight: '600', color: '#333' }}>{lavadora.temp_maxima}°C</Text>
                  </Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>
                    Centrifugado máx: <Text style={{ fontWeight: '600', color: '#333' }}>{lavadora.velocidad_max} RPM</Text>
                  </Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>
                    Clase eficiencia: <Text style={{ fontWeight: '600', color: '#333' }}>{lavadora.clase_eficiencia}</Text>
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 }}>
                    {lavadora.tiene_delicado && (
                      <View style={{ backgroundColor: '#e8d5c4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: '#5c4033' }}>Delicado</Text>
                      </View>
                    )}
                    {lavadora.tiene_lana && (
                      <View style={{ backgroundColor: '#e8d5c4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: '#5c4033' }}>Lana</Text>
                      </View>
                    )}
                    {lavadora.tiene_vapor && (
                      <View style={{ backgroundColor: '#e8d5c4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: '#5c4033' }}>Vapor</Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            /* Modo manual: solo marca y modelo a mano */
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <MaterialCommunityIcons name="washing-machine" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Marca (Ej: Bosch)"
                  value={lavadora.marca}
                  onChangeText={(t) => setLavadora(l => ({ ...l, marca: t, id_catalogo: null }))}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Modelo (Ej: Serie 6)"
                  value={lavadora.modelo}
                  onChangeText={(t) => setLavadora(l => ({ ...l, modelo: t }))}
                />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.botonGuardar} onPress={guardarCambios} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Guardar Cambios</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonLogout} onPress={cerrarSesion}>
          <MaterialCommunityIcons name="logout" size={20} color="#d9534f" style={{ marginRight: 8 }} />
          <Text style={styles.textoBotonLogout}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal picker de marca */}
      <Modal visible={showMarcaPicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Selecciona la marca</Text>
              <TouchableOpacity onPress={() => setShowMarcaPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={marcasDisponibles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setLavadora(() => ({ ...LAVADORA_VACIA, marca: item }));
                    setShowMarcaPicker(false);
                  }}
                >
                  <MaterialCommunityIcons name="washing-machine" size={20} color="#5c4033" style={{ marginRight: 12 }} />
                  <Text style={{ fontSize: 16, color: '#333', fontWeight: lavadora.marca === item ? '700' : '400' }}>{item}</Text>
                  {lavadora.marca === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#5c4033" style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal picker de modelo */}
      <Modal visible={showModeloPicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Modelos de {lavadora.marca}</Text>
              <TouchableOpacity onPress={() => setShowModeloPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modelosFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => seleccionarModeloCatalogo(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: '#333', fontWeight: lavadora.id_catalogo === item.id ? '700' : '400' }}>
                      {item.modelo}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {item.carga_maxima_kg} kg · {item.temp_maxima}°C · {item.velocidad_max} RPM · Clase {item.clase_eficiencia}
                    </Text>
                  </View>
                  {lavadora.id_catalogo === item.id && (
                    <MaterialCommunityIcons name="check" size={20} color="#5c4033" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
