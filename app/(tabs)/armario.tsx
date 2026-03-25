import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ArmarioScreen() {
    // Estado para alternar entre la vista gráfica del armario y la vista de consejos
    const [vistaActiva, setVistaActiva] = useState<'visual' | 'consejos'>('consejos');

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* CABECERA */}
            <View style={styles.header}>
                <Text style={styles.titulo}>Mi Armario</Text>
                <Text style={styles.subtitulo}>Optimización y organización espacial</Text>
            </View>

            {/* SELECTOR DE VISTAS (Pestañas internas) */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, vistaActiva === 'visual' && styles.tabActiva]}
                    onPress={() => setVistaActiva('visual')}
                >
                    <Text style={[styles.tabText, vistaActiva === 'visual' && styles.tabTextActiva]}>
                        Distribución
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, vistaActiva === 'consejos' && styles.tabActiva]}
                    onPress={() => setVistaActiva('consejos')}
                >
                    <Text style={[styles.tabText, vistaActiva === 'consejos' && styles.tabTextActiva]}>
                        ¿Cómo organizar?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* CONTENIDO DINÁMICO SEGÚN LA VISTA SELECCIONADA */}
            {vistaActiva === 'visual' ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Este es tu armario</Text>
                    <Text style={styles.sectionSubtitle}>Distribución actual del mobiliario</Text>

                    {/* Gráfico representativo del armario inspirado en el prototipo */}
                    <View style={styles.armarioGrafico}>
                        {/* Puerta izquierda (Cerrada/Lisa) */}
                        <View style={styles.puertaArmario}>
                            <View style={styles.tirador} />
                        </View>

                        {/* Interior derecho (Abierto) */}
                        <View style={styles.interiorArmario}>
                            <View style={styles.zonaBarra}>
                                <View style={styles.barraPerchas} />
                                <View style={styles.filaPerchas}>
                                    <MaterialCommunityIcons name="hanger" size={24} color="#5c4033" />
                                    <MaterialCommunityIcons name="hanger" size={24} color="#5c4033" />
                                    <MaterialCommunityIcons name="hanger" size={24} color="#5c4033" />
                                </View>
                            </View>
                            <View style={styles.zonaBaldas}>
                                <View style={styles.balda} />
                                <View style={styles.balda} />
                            </View>
                            <View style={styles.zonaCajon}>
                                <View style={styles.cajon}>
                                    <View style={styles.tiradorCajon} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

            ) : (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Asistente de almacenamiento</Text>

                    {/* TARJETA 1: Jersey de lana */}
                    <View style={styles.cardConsejo}>
                        <Text style={styles.cardTitle}>Jersey de lana</Text>
                        <View style={styles.flowContainer}>
                            {/* Cambiamos 'sweater' por 'tshirt-crew' */}
                            <MaterialCommunityIcons name="tshirt-crew" size={50} color="#888" />
                            <MaterialCommunityIcons name="arrow-right-thick" size={30} color="#5c4033" style={styles.arrow} />
                            <MaterialCommunityIcons name="layers" size={50} color="#888" />
                        </View>
                        <Text style={styles.cardText}>
                            Este jersey es de lana, por lo cual en una percha puede darse de sí. Es mejor doblarlo y colocarlo en la parte inferior de tu armario.
                        </Text>
                    </View>

                    {/* TARJETA 2: Pantalón Vaquero */}
                    <View style={styles.cardConsejo}>
                        <Text style={styles.cardTitle}>Pantalón vaquero</Text>
                        <View style={styles.flowContainer}>
                            {/* Usamos el mismo icono genérico de ropa para sustituir 'jeans' */}
                            <MaterialCommunityIcons name="tshirt-crew" size={50} color="#888" />
                            <MaterialCommunityIcons name="arrow-right-thick" size={30} color="#5c4033" style={styles.arrow} />
                            <MaterialCommunityIcons name="hanger" size={50} color="#888" />
                        </View>
                        <Text style={styles.cardText}>
                            Este vaquero debería estar colgado en una percha, preferiblemente en la barra superior de tu armario para evitar arrugas marcadas.
                        </Text>
                    </View>
                </View>
            )}

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
        padding: 20,
        paddingTop: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitulo: {
        fontSize: 15,
        color: '#666',
        marginTop: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        margin: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActiva: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActiva: {
        color: '#5c4033',
    },
    section: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },

    // --- Estilos de la tarjeta de consejos ---
    cardConsejo: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5c4033',
        marginBottom: 15,
        textAlign: 'center',
    },
    flowContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    arrow: {
        marginHorizontal: 20,
    },
    cardText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        textAlign: 'center',
    },

    // --- Estilos del armario gráfico (Mockup visual) ---
    armarioGrafico: {
        flexDirection: 'row',
        height: 350,
        borderWidth: 4,
        borderColor: '#5c4033',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        overflow: 'hidden',
    },
    puertaArmario: {
        flex: 1,
        backgroundColor: '#f0eade',
        borderRightWidth: 2,
        borderRightColor: '#5c4033',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 15,
    },
    tirador: {
        width: 8,
        height: 40,
        backgroundColor: '#5c4033',
        borderRadius: 4,
    },
    interiorArmario: {
        flex: 1,
        flexDirection: 'column',
    },
    zonaBarra: {
        flex: 2,
        borderBottomWidth: 2,
        borderBottomColor: '#5c4033',
        paddingTop: 15,
    },
    barraPerchas: {
        height: 6,
        backgroundColor: '#5c4033',
        marginHorizontal: 10,
        borderRadius: 3,
    },
    filaPerchas: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: -5,
    },
    zonaBaldas: {
        flex: 1,
        justifyContent: 'space-evenly',
    },
    balda: {
        height: 4,
        backgroundColor: '#5c4033',
    },
    zonaCajon: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: '#5c4033',
        backgroundColor: '#e6dfd9',
    },
    cajon: {
        width: '80%',
        height: '50%',
        borderWidth: 2,
        borderColor: '#5c4033',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    tiradorCajon: {
        width: 30,
        height: 6,
        backgroundColor: '#5c4033',
        borderRadius: 3,
    }
});