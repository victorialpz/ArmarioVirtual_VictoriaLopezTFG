import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const _screen = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titulo:         { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo:      { fontSize: 16, color: Colors.textSecondary, marginTop: 5 },

  climaInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoClima:     { fontSize: 14, color: Colors.textSecondary, marginLeft: 8, fontStyle: 'italic' },

  sectionFiltro:  { paddingHorizontal: 20, marginBottom: 15 },
  tituloSeccion:  { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },

  pildoraEvento: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  pildoraActiva:      { backgroundColor: Colors.primary },
  textoEvento:        { color: Colors.textSecondary, fontWeight: 'bold' },
  textoEventoActivo:  { color: Colors.textLight },

  outfitCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  ropaContainer:  { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  columnaGrid:    { width: '48%', flexDirection: 'column' },
  prendaBox: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    height: 220,
    borderWidth: 1,
    borderColor: Colors.surfaceAlt2,
  },
  vestidoBox: { height: 455 },
  prendaLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primaryLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prendaImagen: { width: '100%', height: '85%' },

  ropaContainerPlaceholder: {
    height: 450,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 15,
    padding: 20,
  },
  loadingContainer: { height: 450, justifyContent: 'center', alignItems: 'center' },
  textoCargando:    { marginTop: 15, color: Colors.textSecondary, fontWeight: 'bold' },
  textoVacio:       { marginTop: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  accionesContainer: { paddingHorizontal: 20, marginTop: 25 },

  // Looks guardados
  cardGuardado: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  nombreLook:   { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  tagLook: {
    backgroundColor: Colors.secondary,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  botonBorrar:      { padding: 5, backgroundColor: Colors.dangerBg, borderRadius: 10 },
  miniMoodboard:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  miniPrendaBox: {
    width: '47%',
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniImagen:       { width: '100%', height: '100%' },

  // Selector temperatura
  modoTempRow:      { flexDirection: 'row', gap: 10, marginTop: 5 },
  modoTempBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  modoTempBtnActivo:    { backgroundColor: Colors.primary },
  modoTempTexto:        { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  modoTempTextoActivo:  { color: Colors.textLight },
  tempManualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 20,
  },
  tempBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempBtnTexto: { color: Colors.textLight, fontSize: 22, fontWeight: 'bold', lineHeight: 26 },
  tempValor:    { fontSize: 32, fontWeight: 'bold', color: Colors.text, minWidth: 80, textAlign: 'center' },

  // Visor imagen
  visorImagen:  { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.85 },
});

export const styles = { ...commonStyles, ..._screen };
