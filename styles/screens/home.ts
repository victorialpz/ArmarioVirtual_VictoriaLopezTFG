import { StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const _screen = StyleSheet.create({
  container:            { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header:               { marginTop: 10, marginBottom: 25 },
  greeting:             { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitle:             { fontSize: 16, color: Colors.textSecondary, marginTop: 5 },
  climaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  textoClima:           { color: Colors.primary, fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
  actionCard: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  actionTextContainer:  { flex: 1, marginLeft: 15 },
  actionTitle:          { color: Colors.textLight, fontSize: 18, fontWeight: 'bold' },
  actionSubtitle:       { color: Colors.secondaryDark, fontSize: 14, marginTop: 3 },
  botonQuickAdd: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 35,
    elevation: 3,
  },
  textoQuickAdd:        { color: Colors.textLight, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  previewContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 35,
    alignItems: 'center',
    elevation: 2,
  },
  previewImage: {
    width: 200,
    height: 266,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: Colors.surfaceAlt,
  },
  sectionTitle:         { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
});

export const styles = { ...commonStyles, ..._screen };
