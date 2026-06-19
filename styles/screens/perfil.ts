import { StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const _screen = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  // ── Avatar ───────────────────────────────────────────────────────────
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    marginBottom: 10,
  },
  avatarImagen: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceAlt,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  titulo:        { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitulo:     { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  formContainer: { padding: 20 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    elevation: 2,
  },
  icon:  { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: Colors.text },
  row:   { flexDirection: 'row', justifyContent: 'space-between' },

  botonGuardar: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 3,
  },
  textoBoton: { color: Colors.textLight, fontSize: 16, fontWeight: 'bold' },

  botonLogout: {
    flexDirection: 'row',
    marginTop: 25,
    marginHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 15,
  },
  textoBotonLogout: { color: Colors.danger, fontSize: 16, fontWeight: '600' },
});

export const styles = { ...commonStyles, ..._screen };
