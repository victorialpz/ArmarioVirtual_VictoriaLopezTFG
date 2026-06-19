import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/styles/screens/outfit';
import { useGeneradorOutfits } from '../../hooks/useGeneradorOutfits';
import { supabase } from '../../lib/supabase';
import { ESTILOS_COMUNES } from '../../constants/opciones';

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

    const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

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
                        <TouchableOpacity key={index} style={styles.miniPrendaBox} onPress={() => setImagenAmpliada(prenda.imagen_url)} activeOpacity={0.8}>
                            <Image source={{ uri: prenda.imagen_url }} style={styles.miniImagen} resizeMode="contain" />
                        </TouchableOpacity>
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
                            data={ESTILOS_COMUNES}
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
                                            <TouchableOpacity style={{ width: '100%', height: '85%' }} onPress={() => setImagenAmpliada(outfitGenerado.superior.imagen_url)} activeOpacity={0.8}>
                                                <Image source={{ uri: outfitGenerado.superior.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {outfitGenerado.inferior && (
                                        <View style={styles.prendaBox}>
                                            <Text style={styles.prendaLabel}>Inferior</Text>
                                            <TouchableOpacity style={{ width: '100%', height: '85%' }} onPress={() => setImagenAmpliada(outfitGenerado.inferior.imagen_url)} activeOpacity={0.8}>
                                                <Image source={{ uri: outfitGenerado.inferior.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.columnaGrid}>
                                    {outfitGenerado.abrigo && (
                                        <View style={styles.prendaBox}>
                                            <Text style={styles.prendaLabel}>Abrigo / Capa</Text>
                                            <TouchableOpacity style={{ width: '100%', height: '85%' }} onPress={() => setImagenAmpliada(outfitGenerado.abrigo.imagen_url)} activeOpacity={0.8}>
                                                <Image source={{ uri: outfitGenerado.abrigo.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {outfitGenerado.calzado && (
                                        <View style={styles.prendaBox}>
                                            <Text style={styles.prendaLabel}>Calzado</Text>
                                            <TouchableOpacity style={{ width: '100%', height: '85%' }} onPress={() => setImagenAmpliada(outfitGenerado.calzado.imagen_url)} activeOpacity={0.8}>
                                                <Image source={{ uri: outfitGenerado.calzado.imagen_url }} style={styles.prendaImagen} resizeMode="contain" />
                                            </TouchableOpacity>
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
                        <TouchableOpacity style={styles.botonPrimario} onPress={handleGenerar} disabled={loading}>
                            <MaterialCommunityIcons name="magic-staff" size={24} color="#fff" style={styles.iconoBoton} />
                            <Text style={styles.textoBotonPrimario}>Generar con IA</Text>
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
            {/* VISOR DE IMAGEN A TAMAÑO REAL */}
            <Modal visible={!!imagenAmpliada} transparent animationType="fade" onRequestClose={() => setImagenAmpliada(null)}>
                <View style={styles.visorFondo}>
                    <Image source={{ uri: imagenAmpliada! }} style={styles.visorImagen} resizeMode="contain" />
                    <TouchableOpacity style={styles.visorCerrar} onPress={() => setImagenAmpliada(null)}>
                        <MaterialCommunityIcons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

