import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/styles/screens/lavado';

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

