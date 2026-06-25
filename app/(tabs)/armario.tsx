import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GruposAlmacenamiento, useAlmacenamiento } from '@/hooks/useAlmacenamiento';
import { ArmarioConfig, calcularCapacidad, CONFIG_DEFECTO, useArmarioConfig } from '@/hooks/useArmarioConfig';
import { METODO_META, Metodo, PERCHA_LABEL } from '@/lib/reglasAlmacenamiento';
import { Colors } from '@/styles/colors';
import { styles } from '@/styles/screens/armario';

// ── Constantes ────────────────────────────────────────────────────────

const ORDEN_GRUPOS: Metodo[] = ['colgar', 'doblar', 'enrollar', 'zapatero'];

const TIPOS_ARMARIO: { key: ArmarioConfig['tipo']; label: string }[] = [
  { key: 'independiente', label: 'Independiente' },
  { key: 'empotrado',     label: 'Empotrado'     },
  { key: 'vestidor',      label: 'Vestidor'       },
];

// ── Asignación de ubicaciones ─────────────────────────────────────────
// Calcula en qué barra/balda/cajón concreto va cada prenda

function asignarUbicaciones(
  grupos: GruposAlmacenamiento,
  config: ArmarioConfig
): Map<string, string> {
  const mapa = new Map<string, string>();

  // Colgar → barras (distribuidas equitativamente)
  if (config.num_barras > 0 && grupos.colgar.length > 0) {
    const porBarra = Math.ceil(grupos.colgar.length / config.num_barras);
    grupos.colgar.forEach((item, i) => {
      const n = Math.min(Math.floor(i / porBarra) + 1, config.num_barras);
      mapa.set(item.prenda.id, `Barra ${n}`);
    });
  }

  // Enrollar (tops/camisetas) → cajón 1
  grupos.enrollar.forEach(item => {
    mapa.set(item.prenda.id, config.num_cajones >= 1 ? 'Cajón 1' : 'Cajón');
  });

  // Doblar: jerseys/sudaderas → baldas; resto → cajones (a partir del 2 si hay enrollar)
  const esJersey = (cat?: string) =>
    ['Jersey', 'Sudadera'].some(c => cat?.includes(c));

  const jerseys    = grupos.doblar.filter(p => esJersey(p.prenda.categoria));
  const restoDoblar= grupos.doblar.filter(p => !esJersey(p.prenda.categoria));

  if (config.num_baldas > 0 && jerseys.length > 0) {
    const porBalda = Math.ceil(jerseys.length / config.num_baldas);
    jerseys.forEach((item, i) => {
      mapa.set(item.prenda.id, `Balda ${Math.min(Math.floor(i / porBalda) + 1, config.num_baldas)}`);
    });
  } else {
    jerseys.forEach(item => mapa.set(item.prenda.id, 'Balda/Cajón'));
  }

  const cajonInicio = grupos.enrollar.length > 0 && config.num_cajones > 1 ? 2 : 1;
  const cajonesDisp = Math.max(config.num_cajones - cajonInicio + 1, 1);
  if (restoDoblar.length > 0 && config.num_cajones > 0) {
    const porCajon = Math.ceil(restoDoblar.length / cajonesDisp);
    restoDoblar.forEach((item, i) => {
      const n = cajonInicio + Math.floor(i / Math.max(porCajon, 1));
      mapa.set(item.prenda.id, `Cajón ${Math.min(n, config.num_cajones)}`);
    });
  }

  // Zapatero
  grupos.zapatero.forEach(item => {
    mapa.set(item.prenda.id, config.tiene_zapatero ? 'Zapatero' : 'Base del armario');
  });

  return mapa;
}

// ── Componente Stepper ────────────────────────────────────────────────

function Stepper({
  label, value, min, max, step = 1, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; onChange: (v: number) => void;
}) {
  return (
    <View style={styles.numericRow}>
      <Text style={styles.numericLabel}>{label}</Text>
      <View style={styles.numericStepper}>
        <TouchableOpacity style={styles.numericBtn} onPress={() => onChange(Math.max(min, value - step))}>
          <Text style={styles.numericBtnTexto}>−</Text>
        </TouchableOpacity>
        <Text style={styles.numericValue}>{value}</Text>
        <TouchableOpacity style={styles.numericBtn} onPress={() => onChange(Math.min(max, value + step))}>
          <Text style={styles.numericBtnTexto}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Pantalla ──────────────────────────────────────────────────────────

export default function ArmarioScreen() {
  const [modalConfigVisible, setModalConfigVisible] = useState(false);
  const [configEdit, setConfigEdit]             = useState<ArmarioConfig>(CONFIG_DEFECTO);
  const [guardando, setGuardando]               = useState(false);

  const { grupos, loading, total, cargar } = useAlmacenamiento();
  const { config, configurado, cargar: cargarConfig, guardar } = useArmarioConfig();

  useFocusEffect(
    useCallback(() => {
      cargar();
      cargarConfig();
    }, [cargar, cargarConfig])
  );

  const abrirConfig = () => {
    setConfigEdit({ ...config });
    setModalConfigVisible(true);
  };

  const onGuardar = async () => {
    try {
      setGuardando(true);
      await guardar(configEdit);
      setModalConfigVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  };

  // Capacidad
  const { barraMax, cajonesMax } = useMemo(() => calcularCapacidad(config), [config]);
  const nColgar          = grupos.colgar.length;
  const nDoblaryEnrollar = grupos.doblar.length + grupos.enrollar.length;

  const pctBarra   = Math.min(nColgar / Math.max(barraMax, 1), 1);
  const pctCajones = Math.min(nDoblaryEnrollar / Math.max(cajonesMax, 1), 1);
  const excesoBarra   = configurado && nColgar > barraMax;
  const excesoCajones = configurado && nDoblaryEnrollar > cajonesMax;

  // Ubicaciones concretas (solo si el armario está configurado)
  const ubicaciones = useMemo(
    () => configurado ? asignarUbicaciones(grupos, config) : new Map<string, string>(),
    [grupos, config, configurado]
  );

  const resumenTipo = TIPOS_ARMARIO.find(t => t.key === config.tipo)?.label ?? '';

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Mi Armario</Text>
          <Text style={styles.subtitulo}>Optimización y organización espacial</Text>
        </View>

        {/* Banner de configuración */}
        <TouchableOpacity style={styles.bannerConfig} onPress={abrirConfig} activeOpacity={0.7}>
          <MaterialCommunityIcons name="wardrobe-outline" size={22} color="#5E7E91" />
          {configurado ? (
            <>
              <Text style={styles.bannerConfigTexto}>
                {resumenTipo} · {config.num_barras} barra{config.num_barras !== 1 ? 's' : ''} ·{' '}
                {config.num_cajones} cajón{config.num_cajones !== 1 ? 'es' : ''} ·{' '}
                {config.num_baldas} balda{config.num_baldas !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.bannerConfigLink}>Editar</Text>
            </>
          ) : (
            <>
              <Text style={styles.bannerConfigTexto}>
                Configura tu armario para recomendaciones personalizadas
              </Text>
              <Text style={styles.bannerConfigLink}>Configurar →</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resumen de conteo */}
            {total > 0 && (
              <View style={styles.resumenBar}>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenNum}>{nColgar}</Text>
                  <Text style={styles.resumenLabel}>en percha</Text>
                </View>
                <View style={styles.resumenDiv} />
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenNum}>{nDoblaryEnrollar}</Text>
                  <Text style={styles.resumenLabel}>doblar/enrollar</Text>
                </View>
                <View style={styles.resumenDiv} />
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenNum}>{grupos.zapatero.length}</Text>
                  <Text style={styles.resumenLabel}>zapatero</Text>
                </View>
              </View>
            )}

            {/* Barras de capacidad */}
            {configurado && total > 0 && (
              <View style={styles.capacidadContainer}>
                <View style={styles.capacidadRow}>
                  <View style={styles.capacidadHeaderRow}>
                    <Text style={styles.capacidadLabel}>
                      Barra de perchas ({config.num_barras > 1 ? `${config.num_barras}×` : ''}{config.longitud_barra_cm} cm)
                    </Text>
                    <Text style={[styles.capacidadLabel, excesoBarra && { color: '#d9534f', fontWeight: '700' }]}>
                      {nColgar}/{barraMax}
                    </Text>
                  </View>
                  <View style={styles.capacidadTrack}>
                    <View style={[styles.capacidadFill, {
                      width: `${pctBarra * 100}%`,
                      backgroundColor: excesoBarra ? '#d9534f' : Colors.primary,
                    }]} />
                  </View>
                </View>

                {cajonesMax > 0 && (
                  <View style={styles.capacidadRow}>
                    <View style={styles.capacidadHeaderRow}>
                      <Text style={styles.capacidadLabel}>
                        Cajones ({config.num_cajones} cajón{config.num_cajones !== 1 ? 'es' : ''})
                      </Text>
                      <Text style={[styles.capacidadLabel, excesoCajones && { color: '#d9534f', fontWeight: '700' }]}>
                        {nDoblaryEnrollar}/{cajonesMax}
                      </Text>
                    </View>
                    <View style={styles.capacidadTrack}>
                      <View style={[styles.capacidadFill, {
                        width: `${pctCajones * 100}%`,
                        backgroundColor: excesoCajones ? '#d9534f' : Colors.primaryLight,
                      }]} />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Alertas de desbordamiento */}
            {excesoBarra && (
              <View style={styles.alertaDesbordamiento}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#7B5800" />
                <Text style={styles.alertaDesbordamientoTexto}>
                  No caben todas las prendas en la barra ({nColgar} prendas, capacidad {barraMax}).
                  Dobla algunos jerseys o pantalones casuales para liberar espacio.
                </Text>
              </View>
            )}
            {excesoCajones && (
              <View style={styles.alertaDesbordamiento}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#7B5800" />
                <Text style={styles.alertaDesbordamientoTexto}>
                  Los cajones disponibles no alcanzan para {nDoblaryEnrollar} prendas (capacidad ~{cajonesMax}).
                  Considera añadir más cajones o baldas.
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#1A2024" />
              </View>
            )}

            {!loading && total === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="wardrobe-outline" size={52} color="#CBD5E0" />
                <Text style={styles.emptyTexto}>
                  Añade prendas a tu armario{'\n'}para ver cómo organizarlas.
                </Text>
              </View>
            )}

            {/* Grupos por método */}
            {!loading && ORDEN_GRUPOS.map(metodo => {
              const items = grupos[metodo];
              if (items.length === 0) return null;
              const meta = METODO_META[metodo];

              return (
                <View key={metodo} style={styles.grupoContainer}>
                  <View style={[styles.grupoHeader, { backgroundColor: meta.bg }]}>
                    <View style={styles.grupoHeaderLeft}>
                      <MaterialCommunityIcons name={meta.icono as any} size={20} color={meta.color} />
                      <Text style={[styles.grupoLabel, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Text style={[styles.grupoCount, { color: meta.color }]}>
                      {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
                    </Text>
                  </View>

                  {items.map(({ prenda, sugerencia }) => {
                    const ubicacion = ubicaciones.get(prenda.id);
                    return (
                      <View key={prenda.id} style={styles.prendaCard}>
                        <View style={styles.prendaImgBox}>
                          {prenda.imagen_url ? (
                            <Image source={{ uri: prenda.imagen_url }} style={styles.prendaImg} resizeMode="cover" />
                          ) : (
                            <MaterialCommunityIcons name="hanger" size={30} color="#CBD5E0" />
                          )}
                        </View>

                        <View style={styles.prendaInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                            <Text style={[styles.prendaNombre, { flex: 1 }]} numberOfLines={1}>
                              {prenda.nombre}
                            </Text>
                            {ubicacion && (
                              <View style={styles.ubicacionChip}>
                                <Text style={styles.ubicacionChipTexto}>{ubicacion}</Text>
                              </View>
                            )}
                          </View>

                          {sugerencia.tipoPercha && (
                            <View style={styles.perchaChip}>
                              <Text style={styles.perchaChipTexto}>
                                {PERCHA_LABEL[sugerencia.tipoPercha] ?? sugerencia.tipoPercha}
                              </Text>
                            </View>
                          )}

                          <Text style={styles.prendaZona}>
                            {'📍 '}{sugerencia.zona}
                          </Text>

                          <Text style={styles.prendaConsejo} numberOfLines={2}>
                            {sugerencia.consejo}
                          </Text>

                          {sugerencia.alerta && (
                            <View style={styles.alertaBox}>
                              <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#7B5800" />
                              <Text style={styles.alertaTexto}>{sugerencia.alerta}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* ── Modal configuración ──────────────────────────────────── */}
      <Modal
        visible={modalConfigVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalConfigVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <Text style={styles.modalSheetTitle}>Configurar mi armario</Text>
              <TouchableOpacity onPress={() => setModalConfigVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1A2024" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tipo */}
              <Text style={styles.configLabel}>Tipo de armario</Text>
              <View style={styles.tipoRow}>
                {TIPOS_ARMARIO.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tipoBtn, configEdit.tipo === t.key && styles.tipoBtnActivo]}
                    onPress={() => setConfigEdit(c => ({ ...c, tipo: t.key }))}
                  >
                    <Text style={[styles.tipoBtnTexto, configEdit.tipo === t.key && styles.tipoBtnTextoActivo]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Barras */}
              <Text style={styles.configLabel}>Barras de perchas</Text>
              <Stepper
                label="Número de barras"
                value={configEdit.num_barras}
                min={1} max={6}
                onChange={v => setConfigEdit(c => ({ ...c, num_barras: v }))}
              />
              <Stepper
                label="Longitud por barra (cm)"
                value={configEdit.longitud_barra_cm}
                min={40} max={300} step={10}
                onChange={v => setConfigEdit(c => ({ ...c, longitud_barra_cm: v }))}
              />

              {/* Almacenamiento */}
              <Text style={styles.configLabel}>Almacenamiento</Text>
              <Stepper
                label="Baldas / Estantes"
                value={configEdit.num_baldas}
                min={0} max={8}
                onChange={v => setConfigEdit(c => ({ ...c, num_baldas: v }))}
              />
              <Stepper
                label="Cajones"
                value={configEdit.num_cajones}
                min={0} max={12}
                onChange={v => setConfigEdit(c => ({ ...c, num_cajones: v }))}
              />

              {/* Zapatero */}
              <Text style={styles.configLabel}>Zapatero</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>¿Tienes zapatero?</Text>
                <Switch
                  value={configEdit.tiene_zapatero}
                  onValueChange={v => setConfigEdit(c => ({ ...c, tiene_zapatero: v }))}
                  trackColor={{ true: '#1A2024', false: '#E2E8F0' }}
                  thumbColor="#fff"
                />
              </View>
              {configEdit.tiene_zapatero && (
                <Stepper
                  label="Pares que caben"
                  value={configEdit.capacidad_zapatero}
                  min={5} max={60} step={5}
                  onChange={v => setConfigEdit(c => ({ ...c, capacidad_zapatero: v }))}
                />
              )}

              <TouchableOpacity
                style={[styles.botonGuardar, guardando && { opacity: 0.6 }]}
                onPress={onGuardar}
                disabled={guardando}
              >
                {guardando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.botonGuardarTexto}>Guardar configuración</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

