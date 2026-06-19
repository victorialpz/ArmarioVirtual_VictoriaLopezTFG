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
  titulo:    { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 15, color: Colors.textSecondary, marginTop: 5 },

  // ── Tabs ──────────────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
  },
  tab:           { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActiva:     { backgroundColor: Colors.primary },
  tabText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActiva: { color: Colors.textLight },

  // ── Banner de configuración ────────────────────────────────────────
  bannerConfig: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  bannerConfigTexto: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  bannerConfigLink:  { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // ── Resumen numérico ───────────────────────────────────────────────
  resumenBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resumenItem:  { alignItems: 'center' },
  resumenNum:   { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  resumenLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  resumenDiv:   { width: 1, backgroundColor: Colors.border },

  // ── Barras de capacidad ────────────────────────────────────────────
  capacidadContainer: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  capacidadRow:       { marginBottom: 10 },
  capacidadHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  capacidadLabel:     { fontSize: 12, color: Colors.textMuted },
  capacidadTrack: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacidadFill: { height: '100%', borderRadius: 4 },

  // ── Alerta de desbordamiento ───────────────────────────────────────
  alertaDesbordamiento: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  alertaDesbordamientoTexto: { flex: 1, fontSize: 13, color: '#7B5800', lineHeight: 18 },

  // ── Grupos por método ──────────────────────────────────────────────
  grupoContainer: { marginHorizontal: 16, marginBottom: 16, marginTop: 8 },
  grupoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  grupoHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grupoLabel:      { fontSize: 15, fontWeight: '700' },
  grupoCount: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  // ── Tarjeta de prenda ──────────────────────────────────────────────
  prendaCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prendaImgBox: {
    width: 70,
    height: 70,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
  },
  prendaImg:     { width: 70, height: 70, borderRadius: 8 },
  prendaInfo:    { flex: 1, paddingVertical: 10, paddingRight: 12, justifyContent: 'center' },
  prendaNombre:  { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  prendaZona:    { fontSize: 12, color: Colors.textMuted, marginBottom: 3 },
  prendaConsejo: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 4 },

  perchaChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  perchaChipTexto: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  ubicacionChip: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    flexShrink: 0,
  },
  ubicacionChipTexto: { fontSize: 10, fontWeight: '700', color: Colors.textLight },

  alertaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 2,
    gap: 4,
  },
  alertaTexto: { fontSize: 11, color: '#7B5800', flex: 1, lineHeight: 16 },

  // ── Vacío ──────────────────────────────────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTexto: { color: Colors.textMuted, fontSize: 15, marginTop: 12, textAlign: 'center' },

  // ── Modal configuración ────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  modalSheetTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },

  configLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tipoRow:           { flexDirection: 'row', gap: 8 },
  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  tipoBtnActivo:      { borderColor: Colors.primary, backgroundColor: Colors.primary },
  tipoBtnTexto:       { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tipoBtnTextoActivo: { color: Colors.textLight },

  numericRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  numericLabel:  { fontSize: 15, color: Colors.text, flex: 1 },
  numericStepper:{ flexDirection: 'row', alignItems: 'center', gap: 14 },
  numericBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numericBtnTexto: { fontSize: 20, lineHeight: 24, color: Colors.text, fontWeight: '300' },
  numericValue:    { fontSize: 16, fontWeight: 'bold', color: Colors.text, minWidth: 28, textAlign: 'center' },

  toggleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  toggleLabel:{ fontSize: 15, color: Colors.text },

  botonGuardar: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  botonGuardarTexto: { color: Colors.textLight, fontSize: 16, fontWeight: 'bold' },

  // ── Vista gráfica armario ──────────────────────────────────────────
  section:         { paddingHorizontal: 16 },
  sectionTitle:    { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 5, marginTop: 16 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 18 },

  armarioGrafico: {
    flexDirection: 'row',
    height: 360,
    borderWidth: 3,
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
  tirador:          { width: 8, height: 40, backgroundColor: Colors.primary, borderRadius: 4 },
  interiorArmario:  { flex: 1.4, flexDirection: 'column' },
  zonaBarra: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingTop: 12,
    paddingBottom: 6,
  },
  barraPerchas:     { height: 5, backgroundColor: Colors.primary, marginHorizontal: 8, borderRadius: 3 },
  filaPerchas:      { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: -4, paddingHorizontal: 4 },
  zonaBaldas:       { justifyContent: 'space-evenly' },
  balda:            { height: 3, backgroundColor: Colors.primary, marginHorizontal: 2 },
  zonaCajon: {
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
  tiradorCajon: { width: 28, height: 5, backgroundColor: Colors.primary, borderRadius: 3 },

  cardConsejo: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle:     { fontSize: 15, fontWeight: 'bold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  flowContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  arrow:         { marginHorizontal: 14 },
  cardText:      { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, textAlign: 'center' },
});

export const styles = { ...commonStyles, ..._screen };
