import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/styles/screens/armario';

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
                                    <MaterialCommunityIcons name="hanger" size={24} color="#1A2024" />
                                    <MaterialCommunityIcons name="hanger" size={24} color="#1A2024" />
                                    <MaterialCommunityIcons name="hanger" size={24} color="#1A2024" />
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
                            <MaterialCommunityIcons name="arrow-right-thick" size={30} color="#1A2024" style={styles.arrow} />
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
                            <MaterialCommunityIcons name="arrow-right-thick" size={30} color="#1A2024" style={styles.arrow} />
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

