import { StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const _screen = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.surfaceAlt, padding: 20 },
  header:     { alignItems: 'center', marginBottom: 30 },
  titulo:     { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  form:       { width: '100%' },
  label:      { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  boton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  textoBoton: { color: Colors.textLight, fontSize: 16, fontWeight: 'bold' },
});

export const styles = { ...commonStyles, ..._screen };
