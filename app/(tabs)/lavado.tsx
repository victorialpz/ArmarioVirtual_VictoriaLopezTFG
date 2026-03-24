import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. DATOS DE PRUEBA (Ropa que está en el cesto)
const ROPA_SUCIA = [
  { id: '1', nombre: 'Camiseta Básica Blanca', tipo: 'Algodón - 30º', icono: 'tshirt-crew' },
  { id: '2', nombre: 'Vaqueros Azules', tipo: 'Denim - Frío', icono: 'jeans' },
  { id: '3', nombre: 'Sudadera Gimnasio', tipo: 'Sintético - 40º', icono: 'hoodie' },
];

export default function LavadoScreen() {
  return (
    <View style={styles.container}>
      
      {/* 2. CABECERA */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Zona de Lavado</Text>
        <Text style={styles.subtitulo}>Tienes 3 prendas en el cesto ahora mismo.</Text>
      </View>

      {/* 3. LISTA DE ROPA SUCIA */}
      <FlatList
        data={ROPA_SUCIA}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lista}
        // Metemos el diseño de la "tarjeta" directamente aquí para evitar errores de TypeScript:
        renderItem={({ item }) => (
          <View style={styles.cardSucia}>
            <View style={styles.iconoFondo}>
              <MaterialCommunityIcons name={item.icono as any} size={32} color="#5c4033" />
            </View>
            
            <View style={styles.infoPrenda}>
              <Text style={styles.nombrePrenda}>{item.nombre}</Text>
              <Text style={styles.tipoPrenda}>{item.tipo}</Text>
            </View>

            {/* Botón para devolver al armario */}
            <TouchableOpacity style={styles.botonLimpiar}>
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.textoBoton}>Limpia</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* 4. TARJETA EXTRA: GUÍA DE ETIQUETAS */}
      <View style={styles.guiaLavado}>
        <Text style={styles.tituloGuia}>Guía rápida de etiquetas</Text>
        <View style={styles.iconosGuia}>
          <View style={styles.itemGuia}>
            <MaterialCommunityIcons name="washing-machine" size={24} color="#666" />
            <Text style={styles.textoGuiapequeño}>Lavadora</Text>
          </View>
          <View style={styles.itemGuia}>
            <MaterialCommunityIcons name="tumble-dryer" size={24} color="#666" />
            <Text style={styles.textoGuiapequeño}>Secadora</Text>
          </View>
          <View style={styles.itemGuia}>
            <MaterialCommunityIcons name="iron" size={24} color="#666" />
            <Text style={styles.textoGuiapequeño}>Plancha</Text>
          </View>
        </View>
      </View>

    </View>
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
  lista: {
    padding: 15,
  },
  cardSucia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconoFondo: {
    width: 50,
    height: 50,
    backgroundColor: '#f9f5f3',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoPrenda: {
    flex: 1,
  },
  nombrePrenda: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tipoPrenda: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  botonLimpiar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5c4033', // Tu color corporativo
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  guiaLavado: {
    margin: 15,
    padding: 15,
    backgroundColor: '#e6dfd9', // Un marrón muy clarito
    borderRadius: 15,
    marginBottom: 25,
  },
  tituloGuia: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5c4033',
    marginBottom: 10,
    textAlign: 'center',
  },
  iconosGuia: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemGuia: {
    alignItems: 'center',
  },
  textoGuiapequeño: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  }
});