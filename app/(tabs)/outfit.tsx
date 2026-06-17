import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGeneradorOutfits } from '../../hooks/useGeneradorOutfits';
import { supabase } from '../../lib/supabase';

const EVENTOS = ['Diario', 'Casual', 'Elegante', 'Fiesta', 'Deportivo'];

export default function OutfitScreen() {
    // Estado para controlar qué pestaña vemos
    const [vistaActiva, setVistaActiva] = useState<'generador' | 'guardados'>('generador');
    
    // Estados del Generador IA
    const [eventoActivo, setEventoActivo] = useState<string>('Diario');
    const { loading, climaActual, outfitGenerado, generarOutfit, guardarOutfit, calcularClimaDesdeTemp } = useGeneradorOutfits();
    const [modoTemp, setModoTemp] = useState<'gps' | 'manual'>('gps');
    const [tempManual, setTempManual] = useState(20);

    const handleGenerar = () => {
        if (modoTemp === 'manual') {
            generarOutfit(calcularClimaDesdeTemp(tempManual));
        } else {
            generarOutfit();
        }
    };

    // Estados de la Galería de Guardados
    const [outfitsGuardados, setOutfitsGuardados] = useState<any[]>([]);
    const [loadingGuardados, setLoadingGuardados] = useState(false);

    // Cargar los outfits cuando entramos en la pestaña "Guardados"
    useFocusEffect(
        useCallback(() => {
            if (vistaActiva === 'guardados') {
                cargarGuardados();
            }
        }, [vistaActiva])
    );

    const cargarGuardados = async () => {
        try {
            setLoadingGuardados(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Consulta mágica: Trae el outfit y cruza las tablas para traer las fotos de sus prendas
            const { data, error } = await supabase
                .from('outfits')
                .select(`
                    id, nombre, clima_ideal, evento_ideal, fecha_creacion,
                    outfit_prendas (
                        prendas ( id, imagen_url, categoria )
                    )
                `)
                .eq('id_usuario', user.id)
                .order('fecha_creacion', { ascending: false });

            if (error) throw error;
            if (data) setOutfitsGuardados(data);
        } catch (error: any) {
            Alert.alert('Error', 'No pudimos cargar tus looks: ' + error.message);
        } finally {
            setLoadingGuardados(false);
        }
    };

    const eliminarOutfit = async (id_outfit: string) => {
        Alert.alert(
            "Borrar Look",
            "¿Estás segura de que quieres eliminar este conjunto de tus favoritos?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        // Supabase borrará en cascada las relaciones en outfit_prendas si lo configuraste así, 
                        // pero por seguridad borramos explícitamente el outfit padre.
                        const { error } = await supabase.from('outfits').delete().eq('id', id_outfit);
                        if (!error) {
                            setOutfitsGuardados(prev => prev.filter(o => o.id !== id_outfit));
                        }
                    }
                }
            ]
        );
    };

    const renderOutfitGuardado = ({ item }: { item: any }) => {
        // Extraemos las imágenes de la relación compleja de Supabase
        const prendasDelLook = item.outfit_prendas.map((op: any) => op.prendas).filter(Boolean);

        return (
            <View style={styles.cardGuardado}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.nombreLook}>{item.nombre}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <Text style={styles.tagLook}>{item.evento_ideal}</Text>
                            <Text style={styles.tagLook}>{item.clima_ideal}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => eliminarOutfit(item.id)} style={styles.botonBorrar}>
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#d9534f" />
                    </TouchableOpacity>
                </View>

                {/* Mini Moodboard del conjunto */}
                <View style={styles.miniMoodboard}>
                    {prendasDelLook.map((prenda: any, index: number) => (
                        <View key={index} style={styles.miniPrendaBox}>
                            <Image source={{ uri: prenda.imagen_url }} style={styles.miniImagen} resizeMode="contain" />
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            
            {/* CABECERA COMÚN */}
            <View style={styles.header}>
                <Text style={styles.titulo}>Mis Outfits</Text>
                <Text style={styles.subtitulo}>Tus looks para cada ocasión</Text>
            </View>

            {/* SELECTOR DE PESTAÑAS */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, vistaActiva === 'generador' && styles.tabActiva]}
                    onPress={() => setVistaActiva('generador')}
                >
                    <Text style={[styles.tabText, vistaActiva === 'generador' && styles.tabTextActiva]}>
                        Generar Nuevo
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, vistaActiva === 'guardados' && styles.tabActiva]}
                    onPress={() => setVistaActiva('guardados')}
                >
                    <Text style={[styles.tabText, vistaActiva === 'guardados' && styles.tabTextActiva]}>
                        Looks Guardados
                    </Text>
                </TouchableOpacity>
            </View>

            {/* CONDICIONAL DE VISTAS */}
            {vistaActiva === 'generador' ? (
                // ----------------------------------------------------
                // VISTA 1: EL GENERADOR DE IA (Moodboard)
                // ----------------------------------------------------
                <ScrollView showsVerticalScrollIndicator={false}>
                    {climaActual ? (
                        <View style={styles.climaInfo}>
                            <MaterialCommunityIcons name={climaActual.temp > 20 ? "white-balance-sunny" : "weather-cloudy"} size={20} color="#5c4033" />
                            <Text style={styles.textoClima}>Hoy hace {climaActual.temp}ºC. Buscando capas para el {climaActual.tipo.toLowerCase()}...</Text>
                        </View>
                    ) : null}

                    {/* SELECTOR DE TEMPERATURA */}
                    <View style={styles.sectionFiltro}>
                        <Text style={styles.tituloSeccion}>Temperatura</Text>
                        <View style={styles.modoTempRow}>
                            <TouchableOpacity
                                style={[styles.modoTempBtn, modoTemp === 'gps' && styles.modoTempBtnActivo]}
                                onPress={() => setModoTemp('gps')}
                            >
                                <MaterialCommunityIcons name="map-marker" size={15} color={modoTemp === 'gps' ? '#fff' : '#666'} />
                                <Text style={[styles.modoTempTexto, modoTemp === 'gps' && styles.modoTempTextoActivo]}>  GPS actual</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modoTempBtn, modoTemp === 'manual' && styles.modoTempBtnActivo]}
                                onPress={() => setModoTemp('manual')}
                            >
                                <MaterialCommunityIcons name="thermometer" size={15} color={modoTemp === 'manual' ? '#fff' : '#666'} />
                                <Text style={[styles.modoTempTexto, modoTemp === 'manual' && styles.modoTempTextoActivo]}>  Introducir a mano</Text>
                            </TouchableOpacity>
                        </View>
                        {modoTemp === 'manual' && (
                            <View style={styles.tempManualRow}>
                                <TouchableOpacity style={styles.tempBtn} onPress={() => setTempManual(t => Math.max(-10, t - 1))}>
                                    <Text style={styles.tempBtnTexto}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.tempValor}>{tempManual}°C</Text>
                                <TouchableOpacity style={styles.tempBtn} onPress={() => setTempManual(t => Math.min(45, t + 1))}>
                                    <Text style={styles.tempBtnTexto}>+</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.sectionFiltro}>
                        <Text style={styles.tituloSeccion}>¿A dónde vas hoy?</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={EVENTOS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.pildoraEvento, eventoActivo === item && styles.pildoraActiva]} 
                                    onPress={() => setEventoActivo(item)}
                                >
                                    <Text style={[styles.textoEvento, eventoActivo === item && styles.textoEventoActivo]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <View style={styles.outfitCard}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#5c4033" />
                                <Text style={styles.textoCargando}>Buscando en tu armario...</Text>
                            </View>
                        ) : outfitGenerado ? (
                            <View style={styles.ropaContainer}>
                                <View style={styles.columnaGrid}>
                                    {outfitGenerado.superior && (
                                        <View style={[styles.prendaBox, !outfitGenerado.inferior && styles.vestidoBox]}>
                                            <Text style={styles.prendaLabel}>{!outfitGenerado.inferior ? 'Vestido' : 'Superior'}</Text>
                                            <Image source={{ uri: outfitGenerado.superior.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                        </View>
                                    )}
                                    {outfitGenerado.inferior && (
                                        <View style={styles.prendaBox}>
                                            <Text style={styles.prendaLabel}>Inferior</Text>
                                            <Image source={{ uri: outfitGenerado.inferior.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.columnaGrid}>
                                    {outfitGenerado.abrigo && (
                                        <View style={styles.prendaBox}>
                                            <Text style={styles.prendaLabel}>Abrigo / Capa</Text>
                                            <Image source={{ uri: outfitGenerado.abrigo.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                        </View>
                                    )}
                                    {outfitGenerado.calzado && (
                                        <View style={styles.prendaBox}>
                                            <Text style={styles.prendaLabel}>Calzado</Text>
                                            <Image source={{ uri: outfitGenerado.calzado.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                        </View>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.ropaContainerPlaceholder}>
                                <MaterialCommunityIcons name="hanger" size={60} color="#ccc" />
                                <Text style={styles.textoVacio}>Pulsa "Generar con IA" para crear un conjunto basado en tu armario y el clima actual.</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.accionesContainer}>
                        <TouchableOpacity style={styles.botonPrincipal} onPress={handleGenerar} disabled={loading}>
                            <MaterialCommunityIcons name="magic-staff" size={24} color="#fff" style={styles.iconoBoton} />
                            <Text style={styles.textoBotonPrincipal}>Generar con IA</Text>
                        </TouchableOpacity>

                        {outfitGenerado && (
                            <TouchableOpacity style={styles.botonSecundario} onPress={() => guardarOutfit(eventoActivo)} disabled={loading}>
                                <MaterialCommunityIcons name="heart-outline" size={24} color="#5c4033" style={styles.iconoBoton} />
                                <Text style={styles.textoBotonSecundario}>Guardar Outfit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>

            ) : (
                // ----------------------------------------------------
                // VISTA 2: LISTA DE LOOKS GUARDADOS
                // ----------------------------------------------------
                <View style={{ flex: 1 }}>
                    {loadingGuardados ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#5c4033" />
                        </View>
                    ) : (
                        <FlatList
                            data={outfitsGuardados}
                            keyExtractor={(item) => item.id}
                            renderItem={renderOutfitGuardado}
                            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.ropaContainerPlaceholder}>
                                    <MaterialCommunityIcons name="heart-broken-outline" size={60} color="#ccc" />
                                    <Text style={styles.textoVacio}>Aún no has guardado ningún look. ¡Ve al generador y crea magia!</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            )}
        </View>
    );
}

// --- ESTILOS VISUALES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, paddingTop: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    titulo: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitulo: { fontSize: 16, color: '#666', marginTop: 5 },
    
    // Estilos del Toggle (Pestañas)
    tabContainer: { flexDirection: 'row', margin: 20, backgroundColor: '#e0e0e0', borderRadius: 10, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabActiva: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: 15, fontWeight: '600', color: '#666' },
    tabTextActiva: { color: '#5c4033' },

    climaInfo: { flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', marginBottom: 10 },
    textoClima: { fontSize: 14, color: '#666', marginLeft: 8, fontStyle: 'italic' },
    sectionFiltro: { paddingHorizontal: 20, marginBottom: 15 },
    tituloSeccion: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    pildoraEvento: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 },
    pildoraActiva: { backgroundColor: '#5c4033' },
    textoEvento: { color: '#666', fontWeight: 'bold' },
    textoEventoActivo: { color: '#fff' },
    outfitCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    ropaContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
    columnaGrid: { width: '48%', flexDirection: 'column' },
    prendaBox: { backgroundColor: '#fff', borderRadius: 15, padding: 10, marginBottom: 15, alignItems: 'center', height: 220, borderWidth: 1, borderColor: '#f0eade' },
    vestidoBox: { height: 455 },
    prendaLabel: { fontSize: 12, fontWeight: 'bold', color: '#8b5a2b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    prendaImagen: { width: '100%', height: '85%' },
    ropaContainerPlaceholder: { height: 450, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f5f3', borderRadius: 15, padding: 20 },
    loadingContainer: { height: 450, justifyContent: 'center', alignItems: 'center' },
    textoCargando: { marginTop: 15, color: '#666', fontWeight: 'bold' },
    textoVacio: { marginTop: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
    accionesContainer: { paddingHorizontal: 20, marginTop: 25 },
    botonPrincipal: { flexDirection: 'row', backgroundColor: '#5c4033', borderRadius: 15, paddingVertical: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#5c4033', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    textoBotonPrincipal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    botonSecundario: { flexDirection: 'row', backgroundColor: '#e6dfd9', borderRadius: 15, paddingVertical: 18, justifyContent: 'center', alignItems: 'center' },
    textoBotonSecundario: { color: '#5c4033', fontSize: 16, fontWeight: 'bold' },
    iconoBoton: { marginRight: 10 },

    // --- Estilos para la lista de Looks Guardados ---
    cardGuardado: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    nombreLook: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    tagLook: { backgroundColor: '#e6dfd9', color: '#5c4033', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8, overflow: 'hidden' },
    botonBorrar: { padding: 5, backgroundColor: '#fcebea', borderRadius: 10 },
    miniMoodboard: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    miniPrendaBox: { width: '47%', height: 120, backgroundColor: '#fff', borderRadius: 12, padding: 5, borderWidth: 1, borderColor: '#eee' },
    miniImagen: { width: '100%', height: '100%' },
    // Temperatura manual
    modoTempRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
    modoTempBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#e0e0e0' },
    modoTempBtnActivo: { backgroundColor: '#5c4033' },
    modoTempTexto: { fontSize: 13, fontWeight: '600', color: '#666' },
    modoTempTextoActivo: { color: '#fff' },
    tempManualRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 20 },
    tempBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5c4033', justifyContent: 'center', alignItems: 'center' },
    tempBtnTexto: { color: '#fff', fontSize: 22, fontWeight: 'bold', lineHeight: 26 },
    tempValor: { fontSize: 32, fontWeight: 'bold', color: '#333', minWidth: 80, textAlign: 'center' }
});