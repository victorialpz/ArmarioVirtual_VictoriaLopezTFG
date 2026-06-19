import { StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const _screen = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titulo:     { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo:  { fontSize: 15, color: Colors.textSecondary, marginTop: 5 },
  section:    { paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },

  cardConsejo: {
    backgroundColor: Colors.surface,
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
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  flowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  arrow:      { marginHorizontal: 20 },
  cardText:   { fontSize: 15, color: '#555', lineHeight: 22, textAlign: 'center' },

  // Ilustración del armario
  armarioGrafico: {
    flexDirection: 'row',
    height: 350,
    borderWidth: 4,
    borderColor: Colors.primary,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  puertaArmario: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt2,
    borderRightWidth: 2,
    borderRightColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 15,
  },
  tirador: {
    width: 8,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  interiorArmario:  { flex: 1, flexDirection: 'column' },
  zonaBarra: {
    flex: 2,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingTop: 15,
  },
  barraPerchas: {
    height: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 10,
    borderRadius: 3,
  },
  filaPerchas:  { flexDirection: 'row', justifyContent: 'space-around', marginTop: -5 },
  zonaBaldas:   { flex: 1, justifyContent: 'space-evenly' },
  balda:        { height: 4, backgroundColor: Colors.primary },
  zonaCajon: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  cajon: {
    width: '80%',
    height: '50%',
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  tiradorCajon: {
    width: 30,
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});

export const styles = { ...commonStyles, ..._screen };
