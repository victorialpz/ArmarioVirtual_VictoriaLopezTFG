import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { styles } from '@/styles/screens/outfit';
import { useGeneradorOutfits } from '../../hooks/useGeneradorOutfits';
import { supabase } from '../../lib/supabase';
import { ESTILOS_COMUNES } from '../../constants/opciones';

export default function OutfitScreen() {
    // Estado para controlar qué pestaña vemos
    const [vistaActiva, setVistaActiva] = useState<'generador' | 'guardados' | 'crear'>('generador');
    
    // Estados del Generador IA
    const [eventoActivo, setEventoActivo] = useState<string>('Diario');
    const { loading, climaActual, outfitGenerado, generarOutfit, guardarOutfit, guardarOutfitManual, calcularClimaDesdeTemp } = useGeneradorOutfits();
    const [modoTemp, setModoTemp] = useState<'gps' | 'manual'>('gps');
    const [tempManual, setTempManual] = useState(20);
    const [localidadManual, setLocalidadManual] = useState('');

    const handleGenerar = () => {
        if (modoTemp === 'manual') {
            generarOutfit(calcularClimaDesdeTemp(tempManual, localidadManual));
        } else {
            generarOutfit();
        }
    };

    const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
    const [outfitParaDescargar, setOutfitParaDescargar] = useState<any | null>(null);
    const [guardandoImagen, setGuardandoImagen] = useState(false);
    const captureViewRef = useRef<ViewShot>(null);

    const descargarOutfit = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso necesario', 'Necesitamos acceso a la galería para guardar el outfit.');
            return;
        }
        try {
            setGuardandoImagen(true);
            const uri = await captureViewRef.current!.capture!();
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('¡Guardado!', 'El outfit se ha guardado en tu galería.');
            setOutfitParaDescargar(null);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudo guardar la imagen: ' + e.message);
        } finally {
            setGuardandoImagen(false);
        }
    };

    // Estados de la Galería de Guardados
    const [outfitsGuardados, setOutfitsGuardados] = useState<any[]>([]);
    const [loadingGuardados, setLoadingGuardados] = useState(false);

    // Estados del Creador Manual
    const [prendasDisponibles, setPrendasDisponibles] = useState<any[]>([]);
    const [prendasSeleccionadas, setPrendasSeleccionadas] = useState<Set<string>>(new Set());
    const [nombreManual, setNombreManual] = useState('');
    const [eventoManual, setEventoManual] = useState('Diario');

    // Cargar los outfits cuando entramos en la pestaña "Guardados"
    useFocusEffect(
        useCallback(() => {
            if (vistaActiva === 'guardados') cargarGuardados();
            if (vistaActiva === 'crear') cargarPrendasDisponibles();
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

    const cargarPrendasDisponibles = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('prendas')
            .select('id, nombre, imagen_url, categoria')
            .eq('id_usuario', user.id)
            .order('fecha_registro', { ascending: false });
        if (data) setPrendasDisponibles(data);
    };

    const toggleSeleccionPrenda = (id: string) => {
        setPrendasSeleccionadas(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleGuardarManual = async () => {
        const exito = await guardarOutfitManual(nombreManual, [...prendasSeleccionadas], eventoManual);
        if (exito) {
            setPrendasSeleccionadas(new Set());
            setNombreManual('');
            setEventoManual('Diario');
            setVistaActiva('guardados');
        }
    };

    const renderOutfitGuardado = ({ item }: { item: any }) => {
        const prendasDelLook = item.outfit_prendas.map((op: any) => op.prendas);

        return (
            <View style={styles.cardGuardado}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.nombreLook}>{item.nombre}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            {item.evento_ideal ? <Text style={styles.tagLook}>{item.evento_ideal}</Text> : null}
                            {item.clima_ideal && item.clima_ideal !== 'Cualquiera' ? <Text style={styles.tagLook}>{item.clima_ideal}</Text> : null}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => setOutfitParaDescargar(item)}>
                            <MaterialCommunityIcons name="download-outline" size={24} color="#5E7E91" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => eliminarOutfit(item.id)} style={styles.botonBorrar}>
                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#d9534f" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Mini Moodboard del conjunto */}
                <View style={styles.miniMoodboard}>
                    {prendasDelLook.map((prenda: any, index: number) =>
                        prenda ? (
                            <TouchableOpacity key={index} style={styles.miniPrendaBox} onPress={() => setImagenAmpliada(prenda.imagen_url)} activeOpacity={0.8}>
                                <Image source={{ uri: prenda.imagen_url }} style={styles.miniImagen} resizeMode="contain" />
                            </TouchableOpacity>
                        ) : (
                            <View key={index} style={[styles.miniPrendaBox, styles.prendaEliminadaBox]}>
                                <MaterialCommunityIcons name="hanger" size={26} color="#ccc" />
                                <Text style={styles.prendaEliminadaTexto}>Prenda{'\n'}eliminada</Text>
                            </View>
                        )
                    )}
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
                        Generar
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, vistaActiva === 'crear' && styles.tabActiva]}
                    onPress={() => setVistaActiva('crear')}
                >
                    <Text style={[styles.tabText, vistaActiva === 'crear' && styles.tabTextActiva]}>
                        Crear
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, vistaActiva === 'guardados' && styles.tabActiva]}
                    onPress={() => setVistaActiva('guardados')}
                >
                    <Text style={[styles.tabText, vistaActiva === 'guardados' && styles.tabTextActiva]}>
                        Guardados
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
                            <MaterialCommunityIcons name={climaActual.temp > 20 ? "white-balance-sunny" : "weather-cloudy"} size={20} color="#1A2024" />
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
                            <>
                                <View style={styles.tempManualRow}>
                                    <TouchableOpacity style={styles.tempBtn} onPress={() => setTempManual(t => Math.max(-10, t - 1))}>
                                        <Text style={styles.tempBtnTexto}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.tempValor}>{tempManual}°C</Text>
                                    <TouchableOpacity style={styles.tempBtn} onPress={() => setTempManual(t => Math.min(45, t + 1))}>
                                        <Text style={styles.tempBtnTexto}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.localidadInput}
                                    placeholder="Localidad (ej: Madrid)"
                                    placeholderTextColor="#999"
                                    value={localidadManual}
                                    onChangeText={setLocalidadManual}
                                />
                            </>
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
                                <ActivityIndicator size="large" color="#1A2024" />
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
                                <MaterialCommunityIcons name="heart-outline" size={24} color="#1A2024" style={styles.iconoBoton} />
                                <Text style={styles.textoBotonSecundario}>Guardar Outfit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>

            ) : vistaActiva === 'guardados' ? (
                // ----------------------------------------------------
                // VISTA 2: LISTA DE LOOKS GUARDADOS
                // ----------------------------------------------------
                <View style={{ flex: 1 }}>
                    {loadingGuardados ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#1A2024" />
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
            ) : (
                // ----------------------------------------------------
                // VISTA 3: CREADOR MANUAL
                // ----------------------------------------------------
                <View style={{ flex: 1 }}>
                    <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 }}>
                        <TextInput
                            style={styles.inputNombreLook}
                            placeholder="Nombre del look (opcional)"
                            placeholderTextColor="#999"
                            value={nombreManual}
                            onChangeText={setNombreManual}
                            maxLength={50}
                        />
                        <Text style={[styles.tituloSeccion, { marginTop: 10, marginBottom: 6 }]}>¿Para qué ocasión?</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={ESTILOS_COMUNES}
                            keyExtractor={(item) => item}
                            style={{ marginBottom: 10 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.pildoraEvento, eventoManual === item && styles.pildoraActiva]}
                                    onPress={() => setEventoManual(item)}
                                >
                                    <Text style={[styles.textoEvento, eventoManual === item && styles.textoEventoActivo]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Text style={styles.textoSeleccion}>
                            {prendasSeleccionadas.size === 0
                                ? 'Toca las prendas para añadirlas al look'
                                : `${prendasSeleccionadas.size} prenda${prendasSeleccionadas.size > 1 ? 's' : ''} seleccionada${prendasSeleccionadas.size > 1 ? 's' : ''}`
                            }
                        </Text>
                    </View>
                    <FlatList
                        data={prendasDisponibles}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 120 }}
                        renderItem={({ item }) => {
                            const seleccionada = prendasSeleccionadas.has(item.id);
                            return (
                                <TouchableOpacity
                                    style={[styles.selectorCard, seleccionada && styles.selectorCardActiva]}
                                    onPress={() => toggleSeleccionPrenda(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri: item.imagen_url }} style={styles.selectorImagen} resizeMode="contain" />
                                    {seleccionada && (
                                        <View style={styles.selectorCheckOverlay}>
                                            <MaterialCommunityIcons name="check-circle" size={24} color="#1A2024" />
                                        </View>
                                    )}
                                    <Text style={styles.selectorNombre} numberOfLines={1}>{item.nombre}</Text>
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={styles.ropaContainerPlaceholder}>
                                <MaterialCommunityIcons name="hanger" size={60} color="#ccc" />
                                <Text style={styles.textoVacio}>Aún no tienes prendas en tu armario.</Text>
                            </View>
                        }
                    />
                    {prendasSeleccionadas.size > 0 && (
                        <View style={styles.barraGuardar}>
                            <TouchableOpacity
                                style={styles.botonPrimario}
                                onPress={handleGuardarManual}
                                disabled={loading}
                            >
                                <MaterialCommunityIcons name="heart-outline" size={22} color="#fff" style={styles.iconoBoton} />
                                <Text style={styles.textoBotonPrimario}>
                                    Guardar look ({prendasSeleccionadas.size} {prendasSeleccionadas.size === 1 ? 'prenda' : 'prendas'})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
            {/* MODAL DESCARGA OUTFIT */}
            <Modal visible={!!outfitParaDescargar} animationType="slide" onRequestClose={() => setOutfitParaDescargar(null)}>
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A2024' }}>Vista previa</Text>
                        <TouchableOpacity onPress={() => setOutfitParaDescargar(null)}>
                            <MaterialCommunityIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {outfitParaDescargar && (
                            <ViewShot ref={captureViewRef} options={{ format: 'jpg', quality: 0.95 }} style={{ backgroundColor: '#FAFAF8', borderRadius: 20, padding: 24 }}>
                                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A2024', textAlign: 'center', marginBottom: 6 }}>
                                    {outfitParaDescargar.nombre}
                                </Text>
                                <Text style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 20 }}>
                                    {outfitParaDescargar.evento_ideal}{outfitParaDescargar.clima_ideal && outfitParaDescargar.clima_ideal !== 'Cualquiera' ? ` · ${outfitParaDescargar.clima_ideal}` : ''}
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                                    {outfitParaDescargar.outfit_prendas.map((op: any, i: number) =>
                                        op.prendas ? (
                                            <View key={i} style={{ width: 130, height: 130, borderRadius: 14, backgroundColor: '#fff', overflow: 'hidden' }}>
                                                <Image source={{ uri: op.prendas.imagen_url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                                            </View>
                                        ) : null
                                    )}
                                </View>
                                <Text style={{ textAlign: 'center', color: '#ccc', fontSize: 10, marginTop: 20 }}>Armario Virtual</Text>
                            </ViewShot>
                        )}
                    </ScrollView>

                    <View style={{ padding: 20 }}>
                        <TouchableOpacity
                            style={{ backgroundColor: '#1A2024', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: guardandoImagen ? 0.6 : 1 }}
                            onPress={descargarOutfit}
                            disabled={guardandoImagen}
                        >
                            {guardandoImagen
                                ? <ActivityIndicator color="#fff" />
                                : <>
                                    <MaterialCommunityIcons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Guardar en galería</Text>
                                  </>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

