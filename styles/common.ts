import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const commonStyles = StyleSheet.create({
  // ── Modales ───────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOpcion: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalOpcionRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionSeleccionada: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
  },
  textoOpcion: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  botonCerrarModal: {
    marginTop: 15,
    padding: 15,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoCerrarModal: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // ── Inputs ────────────────────────────────────────────────────────
  input: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    justifyContent: 'center',
  },

  // ── Fila de botones Guardar / Cancelar ────────────────────────────
  previewButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botonSubir: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.success,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textoBotonSubir: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  botonCancelar: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Botones primario / secundario ─────────────────────────────────
  botonPrimario: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 15,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  textoBotonPrimario: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonSecundario: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    borderRadius: 15,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonSecundario: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconoBoton: { marginRight: 10 },

  // ── Pestañas dobles (tab switcher) ────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActiva: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActiva: { color: Colors.primary },

  // ── Pildoras / chips de filtro ────────────────────────────────────
  pildoraCategoria: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F6F8',
    marginRight: 10,
  },
  pildoraActiva: { backgroundColor: Colors.primary },
  textoCategoria: { color: Colors.textSecondary, fontWeight: '600' },
  textoCategoriaActiva: { color: Colors.textLight },

  // ── Cabeceras de pantalla ─────────────────────────────────────────
  screenContainer: { flex: 1, backgroundColor: Colors.background },
  screenHeader: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },

  // ── Estados vacíos / carga ────────────────────────────────────────
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  textoVacio: { marginTop: 10, color: Colors.textMuted, textAlign: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── FAB ───────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  // ── Visor de imagen a pantalla completa ───────────────────────────
  visorFondo: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visorCerrar: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
});
