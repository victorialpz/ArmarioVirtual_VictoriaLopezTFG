import { StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const _screen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    padding: 20,
    justifyContent: 'center',
  },
  header:     { alignItems: 'center', marginBottom: 50 },
  titulo:     { fontSize: 32, fontWeight: 'bold', color: Colors.text, marginTop: 10 },
  subtitulo:  { fontSize: 16, color: Colors.textSecondary, marginTop: 5 },
  form:       { width: '100%' },
  input: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  botonPrincipal: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotonPrincipal:  { color: Colors.textLight, fontSize: 16, fontWeight: 'bold' },
  botonSecundario:      { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  textoBotonSecundario: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
});

export const styles = { ...commonStyles, ..._screen };
