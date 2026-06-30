import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image,
  Modal, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { styles } from '@/styles/screens/lavado';

// ─── Types ───────────────────────────────────────────────────────────────────

type Colada = {
  id: string;
  nombre: string;
  programa: string;
  temperatura: number;
  descripcion: string;
  prendas: any[];
  esManual: boolean;
  colorGrupo: 'blancos' | 'oscuros' | 'color' | 'mano';
};

// ─── Algorithm ───────────────────────────────────────────────────────────────

const TELAS_DELICADAS  = new Set(['Lana', 'Seda', 'Gasa', 'Cuero']);
const TELAS_SINTETICAS = new Set(['Poliéster', 'Nylon']);
const COLORES_BLANCOS  = new Set(['Blanco', 'Beige', 'Crema']);
const COLORES_OSCUROS  = new Set(['Negro', 'Gris', 'Marrón', 'Marino']);

function getColorBucket(prenda: any): 'blancos' | 'oscuros' | 'color' {
  const primerColor = ((prenda.color as string) || '').split(',')[0].trim();
  if (COLORES_BLANCOS.has(primerColor)) return 'blancos';
  if (COLORES_OSCUROS.has(primerColor)) return 'oscuros';
  return 'color';
}

function calcularColadas(
  prendas: any[],
  simbolosPorPrenda: Record<string, any[]>
): Colada[] {
  const soloMano: any[] = [];
  const aMaquina: any[] = [];

  for (const prenda of prendas) {
    const simbolos = simbolosPorPrenda[prenda.id] || [];
    const noAgua       = simbolos.some((s: any) => ['NO_LAVAR', 'LIMPIEZA_SECO'].includes(s.codigo));
    const soloManoSim  = simbolos.some((s: any) => s.codigo === 'LAVADO_MANO');
    const telaManual   = prenda.tipo_tela === 'Cuero';

    if (noAgua) continue;
    if (soloManoSim || telaManual) soloMano.push(prenda);
    else aMaquina.push(prenda);
  }

  const grupos: Record<string, any[]> = {};

  for (const prenda of aMaquina) {
    const simbolos    = simbolosPorPrenda[prenda.id] || [];
    const colorBucket = getColorBucket(prenda);
    const esDelicado  = prenda.es_delicado
      || simbolos.some((s: any) => s.es_delicado)
      || TELAS_DELICADAS.has(prenda.tipo_tela);
    const esSintetico = !esDelicado && TELAS_SINTETICAS.has(prenda.tipo_tela);
    const subgroup    = esDelicado ? 'delicado' : esSintetico ? 'sintetico' : 'normal';
    const key         = `${colorBucket}_${subgroup}`;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(prenda);
  }

  const NOMBRE_COLOR: Record<string, string> = { blancos: 'Blancos', oscuros: 'Oscuros', color: 'Color' };
  const NOMBRE_SUB:   Record<string, string> = { delicado: '· Delicados', sintetico: '· Sintéticos', normal: '' };

  const coladas: Colada[] = [];

  for (const [key, prendasGrupo] of Object.entries(grupos)) {
    const [colorBucket, subgroup] = key.split('_');

    let tempMax = subgroup === 'delicado' ? 30 : subgroup === 'sintetico' ? 40 : 60;
    for (const p of prendasGrupo) {
      if (p.temp_lavado > 0 && p.temp_lavado < tempMax) tempMax = p.temp_lavado;
      for (const s of (simbolosPorPrenda[p.id] || [])) {
        if (s.temp_maxima && s.temp_maxima < tempMax) tempMax = s.temp_maxima;
      }
    }

    const programa    = subgroup === 'delicado' ? 'Delicado / Lana' : subgroup === 'sintetico' ? 'Sintéticos' : 'Algodón';
    const descripcion = subgroup === 'delicado'
      ? 'Ciclo suave para tejidos delicados y naturales finos'
      : subgroup === 'sintetico'
      ? 'Ciclo para fibras sintéticas y mezclas de poliéster'
      : 'Ciclo estándar para algodón, lino y similares';

    coladas.push({
      id: key,
      nombre: `${NOMBRE_COLOR[colorBucket]} ${NOMBRE_SUB[subgroup]}`.trim(),
      programa,
      temperatura: tempMax,
      descripcion,
      prendas: prendasGrupo,
      esManual: false,
      colorGrupo: colorBucket as any,
    });
  }

  if (soloMano.length > 0) {
    coladas.push({
      id: 'mano',
      nombre: 'Solo a mano',
      programa: 'Lavado a mano',
      temperatura: 30,
      descripcion: 'Estas prendas no deben lavarse a máquina. Usar agua fría y jabón suave.',
      prendas: soloMano,
      esManual: true,
      colorGrupo: 'mano',
    });
  }

  return coladas;
}

const COLADA_TEMA: Record<string, { bg: string; badge: string }> = {
  blancos: { bg: '#FFF9F5', badge: '#F0EBE3' },
  oscuros: { bg: '#F4F4F4', badge: '#E5E5E5' },
  color:   { bg: '#F0F5FF', badge: '#D8E8FF' },
  mano:    { bg: '#FFF3F0', badge: '#FFE0DA' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function LavadoScreen() {
  const [prendas, setPrendas]                     = useState<any[]>([]);
  const [simbolosPorPrenda, setSimbolosPorPrenda] = useState<Record<string, any[]>>({});
  const [lavadora, setLavadora]                   = useState<any | null>(null);
  const [loading, setLoading]                     = useState(true);
  const [modalLavadoraVisible, setModalLavadoraVisible] = useState(false);

  const coladas = useMemo(
    () => calcularColadas(prendas, simbolosPorPrenda),
    [prendas, simbolosPorPrenda]
  );

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: prendasData, error }, { data: lavadoraData }] = await Promise.all([
        supabase
          .from('prendas')
          .select('*, prenda_simbolos(simbolos_lavado(*))')
          .eq('id_usuario', user.id)
          .eq('estado', 'Sucio'),
        supabase
          .from('lavadoras')
          .select('*')
          .eq('id_usuario', user.id)
          .maybeSingle(),
      ]);

      if (error) throw error;

      const simbolosMap: Record<string, any[]> = {};
      for (const prenda of prendasData || []) {
        simbolosMap[prenda.id] = (prenda.prenda_simbolos || [])
          .map((ps: any) => ps.simbolos_lavado)
          .filter(Boolean);
      }

      setPrendas(prendasData || []);
      setSimbolosPorPrenda(simbolosMap);
      setLavadora(lavadoraData);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmarLavado = (colada: Colada) => {
    Alert.alert(
      'Confirmar lavado',
      `¿Marcar ${colada.prendas.length} ${colada.prendas.length === 1 ? 'prenda' : 'prendas'} como lavadas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const { error } = await supabase
              .from('prendas')
              .update({ estado: 'Limpio' })
              .in('id', colada.prendas.map(p => p.id));
            if (error) { Alert.alert('Error', error.message); return; }
            Alert.alert('¡Hecho!', `${colada.prendas.length} ${colada.prendas.length === 1 ? 'prenda enviada' : 'prendas enviadas'} a secado.`);
            cargarDatos();
          },
        },
      ]
    );
  };

  const renderCardPrenda = (prenda: any) => (
    <View key={prenda.id} style={styles.cardColada}>
      <View style={styles.iconoFondo}>
        {prenda.imagen_url ? (
          <Image
            source={{ uri: prenda.imagen_url }}
            style={{ width: 70, height: 70, borderRadius: 35 }}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons name="tshirt-crew" size={40} color="#1A2024" />
        )}
      </View>
      <Text style={styles.nombreColada} numberOfLines={1}>
        {prenda.nombre || prenda.categoria}
      </Text>
      <Text style={styles.tejidoColada}>{prenda.tipo_tela || ''}</Text>
    </View>
  );

  const renderColada = (colada: Colada) => {
    const tema = COLADA_TEMA[colada.colorGrupo] || COLADA_TEMA.color;
    return (
      <View
        key={colada.id}
        style={[styles.seccionGrupo, {
          backgroundColor: tema.bg,
          borderRadius: 16,
          marginHorizontal: 16,
          marginTop: 16,
          padding: 16,
        }]}
      >
        <View style={styles.cabeceraGrupo}>
          <Text style={styles.tituloGrupo}>{colada.nombre}</Text>
          <View style={[styles.etiquetaTag, { backgroundColor: tema.badge }]}>
            <Text style={styles.textoTag}>{colada.temperatura}°C</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialCommunityIcons name="washing-machine" size={14} color="#888" />
          <Text style={[styles.textoDato, { marginLeft: 5, marginBottom: 0, fontSize: 13 }]}>
            Programa: <Text style={styles.textoBold}>{colada.programa}</Text>
          </Text>
        </View>

        <Text style={styles.descripcionGrupo}>{colada.descripcion}</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={colada.prendas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCardPrenda(item)}
          contentContainerStyle={styles.listaColada}
        />

        {colada.esManual ? (
          <View style={[styles.botonLavar, { backgroundColor: '#c8875a' }]}>
            <MaterialCommunityIcons name="hand-water" size={20} color="#fff" />
            <Text style={styles.textoBotonLavar}>Lavar a mano</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.botonLavar} onPress={() => confirmarLavado(colada)}>
            <MaterialCommunityIcons name="water" size={20} color="#fff" />
            <Text style={styles.textoBotonLavar}>
              Confirmar lavado ({colada.prendas.length} {colada.prendas.length === 1 ? 'prenda' : 'prendas'})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Engranaje fijo esquina superior derecha */}
      <TouchableOpacity
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          backgroundColor: '#fff', borderRadius: 22, padding: 7,
          elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
        }}
        onPress={() => setModalLavadoraVisible(true)}
      >
        <MaterialCommunityIcons name="cog" size={24} color="#1A2024" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header lavadora */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="washing-machine" size={80} color="#1A2024" />
          <View style={styles.infoLavadora}>
            {lavadora ? (
              <>
                <Text style={styles.tituloSecundario}>{lavadora.marca}</Text>
                <View style={styles.datosBox}>
                  <Text style={styles.textoDato}>
                    Modelo: <Text style={styles.textoBold}>{lavadora.modelo || '–'}</Text>
                  </Text>
                  {lavadora.carga_maxima_kg ? (
                    <Text style={styles.textoDato}>
                      Carga máx: <Text style={styles.textoBold}>{lavadora.carga_maxima_kg} kg</Text>
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.tituloSecundario}>Sin lavadora</Text>
                <View style={styles.datosBox}>
                  <Text style={styles.textoDato}>Toca el engranaje</Text>
                  <Text style={styles.textoDato}>para configurarla</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {loading ? (
          <View style={[styles.centerContainer, { marginTop: 60 }]}>
            <ActivityIndicator size="large" color="#1A2024" />
          </View>
        ) : prendas.length === 0 ? (
          <View style={[styles.emptyContainer, { marginTop: 60 }]}>
            <MaterialCommunityIcons name="tshirt-crew" size={60} color="#ccc" />
            <Text style={[styles.textoVacio, { fontSize: 16, marginTop: 12 }]}>
              No hay prendas para lavar
            </Text>
            <Text style={[styles.textoVacio, { textAlign: 'center', marginTop: 6, paddingHorizontal: 30 }]}>
              Abre una prenda en "Mi Ropa" y cámbiala a "Sucio"
            </Text>
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <Text style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>
                {prendas.length} {prendas.length === 1 ? 'prenda' : 'prendas'} ·{' '}
                {coladas.length} {coladas.length === 1 ? 'colada recomendada' : 'coladas recomendadas'}
              </Text>
            </View>
            {coladas.map(c => renderColada(c))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal configuración lavadora */}
      <Modal visible={modalLavadoraVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' }}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Mi Lavadora</Text>
              <TouchableOpacity onPress={() => setModalLavadoraVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {lavadora ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <MaterialCommunityIcons name="washing-machine" size={52} color="#1A2024" />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>{lavadora.marca}</Text>
                    <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>{lavadora.modelo || 'Sin modelo'}</Text>
                  </View>
                </View>

                <View style={{ backgroundColor: '#f9f5f2', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  {lavadora.carga_maxima_kg ? (
                    <Text style={styles.textoDato}>Carga máxima: <Text style={styles.textoBold}>{lavadora.carga_maxima_kg} kg</Text></Text>
                  ) : null}
                  {lavadora.temp_maxima ? (
                    <Text style={styles.textoDato}>Temperatura máxima: <Text style={styles.textoBold}>{lavadora.temp_maxima}°C</Text></Text>
                  ) : null}
                  {lavadora.velocidad_max ? (
                    <Text style={styles.textoDato}>Centrifugado: <Text style={styles.textoBold}>{lavadora.velocidad_max} RPM</Text></Text>
                  ) : null}
                  {lavadora.clase_eficiencia ? (
                    <Text style={styles.textoDato}>Clase energética: <Text style={styles.textoBold}>{lavadora.clase_eficiencia}</Text></Text>
                  ) : null}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {lavadora.tiene_delicado ? (
                    <View style={{ backgroundColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ fontSize: 13, color: '#1A2024' }}>Prog. Delicado</Text>
                    </View>
                  ) : null}
                  {lavadora.tiene_lana ? (
                    <View style={{ backgroundColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ fontSize: 13, color: '#1A2024' }}>Prog. Lana</Text>
                    </View>
                  ) : null}
                  {lavadora.tiene_vapor ? (
                    <View style={{ backgroundColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ fontSize: 13, color: '#1A2024' }}>Prog. Vapor</Text>
                    </View>
                  ) : null}
                </View>
              </ScrollView>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <MaterialCommunityIcons name="washing-machine" size={60} color="#ccc" />
                <Text style={{ color: '#666', fontSize: 15, marginTop: 12, textAlign: 'center' }}>
                  Aún no has configurado tu lavadora
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.botonLavar, { marginTop: 8 }]}
              onPress={() => { setModalLavadoraVisible(false); router.navigate('/(tabs)/perfil'); }}
            >
              <MaterialCommunityIcons name="cog" size={20} color="#fff" />
              <Text style={styles.textoBotonLavar}>
                {lavadora ? 'Cambiar configuración' : 'Configurar lavadora'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}
