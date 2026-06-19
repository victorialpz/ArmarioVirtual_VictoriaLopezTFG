import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useGeneradorOutfits } from '@/hooks/useGeneradorOutfits';
import { styles } from '@/styles/screens/home';

function weatherIcon(temp: number, descripcion: string): string {
  const d = descripcion.toLowerCase();
  if (d.includes('lluvia') || d.includes('llovizna')) return 'weather-rainy';
  if (d.includes('nieve'))   return 'weather-snowy';
  if (d.includes('tormenta')) return 'weather-lightning-rainy';
  if (d.includes('nubla') || d.includes('nube')) return 'weather-cloudy';
  if (temp > 20) return 'white-balance-sunny';
  return 'weather-partly-cloudy';
}

export default function HomeScreen() {
  const { climaActual, obtenerClima } = useGeneradorOutfits();

  const [prendasEnUso,      setPrendasEnUso]      = useState<any[]>([]);
  const [outfitsAnteriores, setOutfitsAnteriores] = useState<any[]>([]);
  const [cargando,          setCargando]          = useState(true);

  useFocusEffect(
    useCallback(() => {
      obtenerClima();
      cargarDatos();
    }, []),
  );

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Look del día: prendas con estado "En uso"
      const { data: enUso } = await supabase
        .from('prendas')
        .select('id, nombre, categoria, imagen_url')
        .eq('id_usuario', user.id)
        .eq('estado', 'En uso');
      setPrendasEnUso(enUso || []);

      // Outfits anteriores con imágenes de sus prendas
      const { data: outfits } = await supabase
        .from('outfits')
        .select('id, nombre, clima_ideal, fecha_creacion, outfit_prendas(prendas(id, imagen_url, categoria))')
        .eq('id_usuario', user.id)
        .order('fecha_creacion', { ascending: false })
        .limit(10);

      setOutfitsAnteriores(
        (outfits || []).map(o => ({
          ...o,
          imagenes: (o.outfit_prendas || [])
            .map((op: any) => op.prendas?.imagen_url)
            .filter(Boolean)
            .slice(0, 4),
        })),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.subtitle}>
            {prendasEnUso.length > 0 ? 'Tu look de hoy' : '¿Qué nos ponemos hoy?'}
          </Text>
        </View>

        {climaActual ? (
          <View style={styles.climaCard}>
            <MaterialCommunityIcons
              name={weatherIcon(climaActual.temp, climaActual.descripcion) as any}
              size={28} color="#1A2024"
            />
            <Text style={styles.climaTemp}>{climaActual.temp}°</Text>
            <Text style={styles.climaTipo}>{climaActual.tipo}</Text>
            {climaActual.localidad ? (
              <Text style={styles.climaLocalidad}>{climaActual.localidad}</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.climaCard}>
            <ActivityIndicator size="small" color="#1A2024" />
            <Text style={styles.climaCargandoTexto}>Buscando...</Text>
          </View>
        )}
      </View>

      {/* ── Look del día ─────────────────────────────────────────────── */}
      {cargando ? (
        <ActivityIndicator size="large" color="#1A2024" style={{ marginVertical: 30 }} />
      ) : prendasEnUso.length > 0 ? (
        <View style={styles.lookHoyCard}>
          <Text style={styles.sectionTitle}>Look de hoy</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {prendasEnUso.map(p => (
              <View key={p.id} style={styles.lookPrendaBox}>
                {p.imagen_url ? (
                  <Image source={{ uri: p.imagen_url }} style={styles.lookPrendaImg} resizeMode="contain" />
                ) : (
                  <MaterialCommunityIcons name="tshirt-crew" size={40} color="#ccc" />
                )}
                <Text style={styles.lookPrendaCategoria} numberOfLines={1}>{p.categoria}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.botonCambiarLook} onPress={() => router.push('/outfit')}>
            <Text style={styles.botonCambiarLookTexto}>Cambiar look</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.promptCard} onPress={() => router.push('/outfit')}>
          <MaterialCommunityIcons name="hanger" size={44} color="#1A2024" />
          <Text style={styles.promptTitle}>¿Qué te vas a poner hoy?</Text>
          <Text style={styles.promptSubtitle}>Toca aquí y te ayudo a elegir</Text>
        </TouchableOpacity>
      )}

      {/* ── Acción rápida: generar outfit ───────────────────────────── */}
      <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/outfit')}>
        <MaterialCommunityIcons name="hanger" size={32} color="#fff" />
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>Generar nuevo outfit</Text>
          <Text style={styles.actionSubtitle}>Deja que la IA decida por ti</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonQuickAdd}
        onPress={() => router.push('/(tabs)/prendas?autoAdd=1')}
      >
        <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
        <Text style={styles.textoQuickAdd}>Añadir Prenda Rápida</Text>
      </TouchableOpacity>

      {/* ── Outfits anteriores ──────────────────────────────────────── */}
      {outfitsAnteriores.length > 0 && (
        <View style={styles.anterioresSection}>
          <Text style={styles.sectionTitle}>Outfits anteriores</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={outfitsAnteriores}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <View style={styles.outfitCard}>
                <View style={styles.outfitCardImgs}>
                  {item.imagenes.length > 0 ? (
                    item.imagenes.map((uri: string, i: number) => (
                      <Image key={i} source={{ uri }} style={styles.outfitCardImg} resizeMode="contain" />
                    ))
                  ) : (
                    <MaterialCommunityIcons name="hanger" size={32} color="#ccc" />
                  )}
                </View>
                <Text style={styles.outfitCardNombre} numberOfLines={2}>{item.nombre}</Text>
                {item.clima_ideal ? (
                  <Text style={styles.outfitCardClima}>{item.clima_ideal}</Text>
                ) : null}
              </View>
            )}
          />
        </View>
      )}

    </ScrollView>
  );
}
