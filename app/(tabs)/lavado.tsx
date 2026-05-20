import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. IMPORTAMOS NUESTRA BASE DE DATOS TEMPORAL
import { INVENTARIO_MOCK } from '@/data/mockData';
import { Prenda } from '@/models/tipo';

export default function LavadoScreen() {
  
  // 2. LÓGICA DE LA LAVANDERÍA INTELIGENTE
  // Filtramos automáticamente las prendas que hemos marcado como delicadas en la base de datos
  const coladaDelicada = INVENTARIO_MOCK.filter(prenda => prenda.esDelicado);

  // Función para dibujar cada prenda dentro del carrusel horizontal
  const renderPrendaColada = ({ item }: { item: Prenda }) => (
    <View style={styles.cardColada}>
      <View style={styles.iconoFondo}>
        <MaterialCommunityIcons name={item.icono as any} size={50} color="#5c4033" />
      </View>
      <Text style={styles.nombreColada} numberOfLines={1}>{item.nombre}</Text>
      <Text style={styles.tejidoColada}>{item.tejido}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
    {/* 3. SECCIÓN DE LA LAVADORA */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="washing-machine" size={100} color="#5c4033" />
        
        <View style={styles.infoLavadora}>
          <Text style={styles.tituloSecundario}>Tú lavadora</Text>
          <View style={styles.datosBox}>
            <Text style={styles.textoDato}>Modelo: <Text style={styles.textoBold}>Bosch Serie 6</Text></Text>
            <Text style={styles.textoDato}>Carga máx: <Text style={styles.textoBold}>8 kg</Text></Text>
          </View>
        </View>
      </View>

      {/* 4. GRUPOS DE LAVADO SUGERIDOS */}
      <View style={styles.seccionGrupo}>
        
        <View style={styles.cabeceraGrupo}>
          <Text style={styles.tituloGrupo}>Colada Delicada</Text>
          <View style={styles.etiquetaTag}>
             <Text style={styles.textoTag}>Max 30º</Text>
          </View>
        </View>
        
        <Text style={styles.descripcionGrupo}>
          Lava estas prendas juntas porque presentan tejidos (como lana o cuero) que requieren un trato suave para no estropearse.
        </Text>

        {/* Carrusel horizontal de prendas compatibles */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={coladaDelicada}
          keyExtractor={(item) => item.id}
          renderItem={renderPrendaColada}
          contentContainerStyle={styles.listaColada}
          ListEmptyComponent={
            <Text style={styles.textoVacio}>No hay prendas delicadas pendientes de lavar.</Text>
          }
        />

        {/* Botón de acción */}
        <TouchableOpacity style={styles.botonLavar}>
          <MaterialCommunityIcons name="water" size={22} color="#fff" />
          <Text style={styles.textoBotonLavar}>Confirmar lavado</Text>
        </TouchableOpacity>
        
      </View>

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
    flexDirection: 'row', // ¡Esto pone los elementos uno al lado del otro!
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center', // Centra verticalmente el icono y la caja de texto
  },
  infoLavadora: {
    flex: 1, // Hace que la caja de texto ocupe el espacio restante a la derecha
    marginLeft: 20, // Separa el texto del icono de la lavadora
  },
  tituloSecundario: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  datosBox: {
    backgroundColor: '#f9f5f3',
    padding: 12,
    borderRadius: 12,
  },
  textoDato: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  textoBold: {
    fontWeight: 'bold',
    color: '#5c4033',
  },
  seccionGrupo: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cabeceraGrupo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloGrupo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  etiquetaTag: {
    backgroundColor: '#e6dfd9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  textoTag: {
    color: '#5c4033',
    fontWeight: 'bold',
    fontSize: 12,
  },
  descripcionGrupo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  listaColada: {
    paddingBottom: 20,
  },
  cardColada: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    width: 140, // Ancho fijo para que todas las tarjetas sean iguales
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  iconoFondo: {
    width: 80,
    height: 80,
    backgroundColor: '#f9f5f3',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nombreColada: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  tejidoColada: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  textoVacio: {
    color: '#888',
    fontStyle: 'italic',
    padding: 20,
  },
  botonLavar: {
    flexDirection: 'row',
    backgroundColor: '#5c4033',
    paddingVertical: 16,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#5c4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  textoBotonLavar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});