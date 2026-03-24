import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. SECCIÓN DE BIENVENIDA */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola! 👋</Text>
        <Text style={styles.subtitle}>¿Qué nos ponemos hoy?</Text>
      </View>

      {/* 2. BOTÓN DE ACCIÓN RÁPIDA (Opcional, pero le da un toque muy Pro) */}
      <TouchableOpacity style={styles.actionCard}>
        <MaterialCommunityIcons name="hanger" size={32} color="#fff" />
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>Generar nuevo outfit</Text>
          <Text style={styles.actionSubtitle}>Deja que la IA decida por ti</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 3. SECCIÓN DE OUTFITS PASADOS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus últimos outfits</Text>
        
        {/* Scroll horizontal para deslizar los outfits de lado a lado */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          
          {/* Tarjeta de Outfit 1 */}
          <View style={styles.outfitCard}>
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="tshirt-crew" size={40} color="#a9a9a9" />
            </View>
            <Text style={styles.outfitDate}>Hoy</Text>
          </View>

          {/* Tarjeta de Outfit 2 */}
          <View style={styles.outfitCard}>
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="tshirt-crew" size={40} color="#a9a9a9" />
            </View>
            <Text style={styles.outfitDate}>Ayer</Text>
          </View>

          {/* Tarjeta de Outfit 3 */}
          <View style={styles.outfitCard}>
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="tshirt-crew" size={40} color="#a9a9a9" />
            </View>
            <Text style={styles.outfitDate}>Sábado</Text>
          </View>

        </ScrollView>
      </View>

    </ScrollView>
  );
}

// --- ESTILOS VISUALES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Un gris muy clarito de fondo para que destaquen las tarjetas
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  actionCard: {
    backgroundColor: '#5c4033', // Tu color corporativo
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Sombra para Android
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    color: '#d3c4bc',
    fontSize: 14,
    marginTop: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  carousel: {
    flexDirection: 'row',
  },
  outfitCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 120,
    height: 160,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitDate: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  }
});