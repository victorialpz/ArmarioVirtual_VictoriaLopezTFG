import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OutfitScreen() {
    // Estado para alternar entre las propuestas de la IA
    const [ideaActiva, setIdeaActiva] = useState<'idea1' | 'idea2'>('idea1');

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* 1. CABECERA */}
            <View style={styles.header}>
                <Text style={styles.titulo}>Tu Outfit</Text>
                <Text style={styles.subtitulo}>¿Quién te apetece ser hoy?</Text>
            </View>

            {/* 2. SELECTOR DE IDEAS (Pestañas estilo página 8 del prototipo) */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, ideaActiva === 'idea1' && styles.tabActiva]}
                    onPress={() => setIdeaActiva('idea1')}
                >
                    <Text style={[styles.tabText, ideaActiva === 'idea1' && styles.tabTextActiva]}>
                        IDEA 1
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, ideaActiva === 'idea2' && styles.tabActiva]}
                    onPress={() => setIdeaActiva('idea2')}
                >
                    <Text style={[styles.tabText, ideaActiva === 'idea2' && styles.tabTextActiva]}>
                        IDEA 2
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 3. VISUALIZADOR DEL OUTFIT */}
            <View style={styles.outfitCard}>
                <View style={styles.ropaContainer}>
                    <View style={styles.prendaArriba}>
                        <MaterialCommunityIcons
                            name={(ideaActiva === 'idea1' ? "tshirt-crew" : "hoodie") as any}
                            size={100}
                            color="#5c4033"
                        />
                    </View>

                    <View style={styles.prendaAbajo}>
                        <MaterialCommunityIcons
                            name={(ideaActiva === 'idea1' ? "shoe-sneaker" : "hanger") as any}
                            size={90}
                            color="#888"
                        />
                    </View>
                </View>

                <Text style={styles.outfitDescription}>
                    {ideaActiva === 'idea1'
                        ? 'Conjunto casual perfecto para el día a día. Cómodo y versátil.'
                        : 'Un estilo más relajado y abrigado. Ideal para climas frescos.'}
                </Text>
            </View>
            {/* 4. BOTONES DE ACCIÓN */}
            <View style={styles.accionesContainer}>
                <TouchableOpacity style={styles.botonPrincipal}>
                    <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" style={styles.iconoBoton} />
                    <Text style={styles.textoBotonPrincipal}>¡Me lo pongo!</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.botonSecundario}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#5c4033" style={styles.iconoBoton} />
                    <Text style={styles.textoBotonSecundario}>Generar nueva idea</Text>
                </TouchableOpacity>
            </View>

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
        fontSize: 16,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    tabContainer: {
        flexDirection: 'row',
        margin: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 25, // Bordes más redondeados para diferenciar del armario
        padding: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    tabActiva: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    tabText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#888',
    },
    tabTextActiva: {
        color: '#5c4033',
    },
    outfitCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    ropaContainer: {
        height: 250,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f5f3',
        borderRadius: 15,
        marginBottom: 20,
        position: 'relative', // Importante para superponer las prendas
    },
    prendaArriba: {
        position: 'absolute',
        top: 20,
        zIndex: 2, // Asegura que la camiseta quede por encima
    },
    prendaAbajo: {
        position: 'absolute',
        bottom: 20,
        right: 50,
        transform: [{ rotate: '-10deg' }], // Le da un toque dinámico como en tu dibujo
        zIndex: 1,
    },
    outfitDescription: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    accionesContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    botonPrincipal: {
        flexDirection: 'row',
        backgroundColor: '#5c4033',
        borderRadius: 15,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#5c4033',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    textoBotonPrincipal: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    botonSecundario: {
        flexDirection: 'row',
        backgroundColor: '#e6dfd9',
        borderRadius: 15,
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoBotonSecundario: {
        color: '#5c4033',
        fontSize: 16,
        fontWeight: 'bold',
    },
    iconoBoton: {
        marginRight: 10,
    }
});