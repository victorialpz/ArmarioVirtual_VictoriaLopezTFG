import { StyleSheet } from 'react-native';
import { Colors } from '../colors';
import { commonStyles } from '../common';

const _screen = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 25,
  },
  headerLeft:  { flex: 1, paddingRight: 12, justifyContent: 'center' },
  greeting:    { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitle:    { fontSize: 16, color: Colors.textSecondary, marginTop: 5 },

  // Tarjeta de clima (parte superior derecha)
  climaCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 110,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  climaTemp: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.primary,
    lineHeight: 42,
    marginTop: 4,
  },
  climaTipo: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  climaLocalidad: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  climaCargandoTexto: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },

  actionCard: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  actionTextContainer: { flex: 1, marginLeft: 15 },
  actionTitle:         { color: Colors.textLight, fontSize: 18, fontWeight: 'bold' },
  actionSubtitle:      { color: Colors.secondaryDark, fontSize: 14, marginTop: 3 },

  botonQuickAdd: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  textoQuickAdd: { color: Colors.textLight, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

  // Sección título reutilizable
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },

  // Look del día (prendas En uso)
  lookHoyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  lookPrendaBox: {
    alignItems: 'center',
    marginRight: 12,
    width: 90,
  },
  lookPrendaImg: {
    width: 90,
    height: 110,
    borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
  },
  lookPrendaCategoria: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  botonCambiarLook: {
    marginTop: 14,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
  },
  botonCambiarLookTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Prompt "¿Qué te vas a poner hoy?"
  promptCard: {
    backgroundColor: Colors.surfaceAlt2,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.secondaryDark,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  // Carousel de outfits anteriores
  anterioresSection: {
    marginBottom: 35,
  },
  outfitCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    width: 160,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  outfitCardImgs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitCardImg: {
    width: 64,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
  },
  outfitCardNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  outfitCardClima: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export const styles = { ...commonStyles, ..._screen };
