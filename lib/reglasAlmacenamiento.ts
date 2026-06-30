export type Metodo = 'colgar' | 'doblar' | 'enrollar' | 'zapatero';

export interface Sugerencia {
  metodo: Metodo;
  icono: string;
  tipoPercha?: 'estándar' | 'ancha' | 'con pinzas' | 'acolchada';
  zona: string;
  consejo: string;
  alerta?: string;
}

const esFormal = (estilos: string[] | string | null): boolean => {
  if (!estilos) return false;
  const arr = Array.isArray(estilos) ? estilos : [estilos];
  return arr.some(e => ['Elegante', 'Trabajo', 'Fiesta'].includes(e));
};

const esTelaDelicada = (tela: string) => ['Seda', 'Gasa'].includes(tela);

export function getSugerencia(prenda: {
  categoria: string;
  tipo_tela?: string;
  estilo?: string[] | string | null;
  es_delicado?: boolean;
}): Sugerencia {
  const cat   = prenda.categoria || '';
  const tela  = prenda.tipo_tela || '';
  const del   = prenda.es_delicado || false;
  const formal = esFormal((prenda.estilo ?? null) as string | string[] | null);
  const telaFina = esTelaDelicada(tela) || del;

  // ── Zapatos ───────────────────────────────────────────────────────
  if (cat.includes('Zapato') || cat.includes('Calzado')) {
    return {
      metodo: 'zapatero',
      icono: 'shoe-formal',
      zona: 'Zapatero / Base del armario',
      consejo: 'Guarda cada par en su caja o en el zapatero para mantener la forma.',
      alerta: tela === 'Cuero' ? 'Introduce un tensor para que no se deformen.' : undefined,
    };
  }

  // ── Abrigo / Chaqueta ─────────────────────────────────────────────
  if (cat.includes('Abrigo') || cat.includes('Chaqueta')) {
    return {
      metodo: 'colgar',
      icono: 'hanger',
      tipoPercha: 'ancha',
      zona: 'Barra de perchas',
      consejo: 'Percha ancha para preservar la forma del hombro.',
      alerta: tela === 'Cuero'
        ? 'Cuero: nunca en bolsa de plástico, necesita respirar.'
        : undefined,
    };
  }

  // ── Vestido ───────────────────────────────────────────────────────
  if (cat.includes('Vestido')) {
    return {
      metodo: 'colgar',
      icono: 'hanger',
      tipoPercha: telaFina ? 'acolchada' : 'estándar',
      zona: 'Barra de perchas',
      consejo: telaFina
        ? 'Percha acolchada y funda protectora anti-polvo.'
        : 'Colgar por el escote en percha estándar.',
      alerta: telaFina ? 'Añade funda protectora para evitar deformaciones.' : undefined,
    };
  }

  // ── Camisa / Blusa ────────────────────────────────────────────────
  if (cat.includes('Camisa') || cat.includes('Blusa')) {
    return {
      metodo: 'colgar',
      icono: 'hanger',
      tipoPercha: telaFina ? 'acolchada' : 'estándar',
      zona: 'Barra de perchas',
      consejo: tela === 'Lino'
        ? 'Colgar justo al sacar de la lavadora, aún húmeda, para evitar arrugas.'
        : 'Colgar abotonada por el botón del cuello para mantener el cuello firme.',
      alerta: tela === 'Seda' ? 'Seda: lavar en frío y guardar con funda protectora.' : undefined,
    };
  }

  // ── Jersey / Sudadera ─────────────────────────────────────────────
  if (cat.includes('Jersey') || cat.includes('Sudadera')) {
    return {
      metodo: 'doblar',
      icono: 'layers',
      zona: 'Balda o Cajón',
      consejo: 'Dobla en 3 partes y apila máx. 4 prendas para no deformar las inferiores.',
      alerta: tela === 'Lana'
        ? 'Lana: NUNCA colgar. La gravedad estira el tejido y pierde la forma.'
        : undefined,
    };
  }

  // ── Top / Camiseta ────────────────────────────────────────────────
  if (cat.includes('Top') || cat.includes('Camiseta')) {
    if (telaFina || formal) {
      return {
        metodo: 'colgar',
        icono: 'hanger',
        tipoPercha: telaFina ? 'acolchada' : 'estándar',
        zona: 'Barra de perchas',
        consejo: 'Colgar evita arrugas en tejidos delicados o prendas de vestir.',
        alerta: tela === 'Seda' ? 'Seda: percha acolchada y funda protectora.' : undefined,
      };
    }
    return {
      metodo: 'enrollar',
      icono: 'format-align-justify',
      zona: 'Cajón',
      consejo: 'Enrolla verticalmente (método KonMari): ahorra espacio y ves todo de un vistazo.',
    };
  }

  // ── Pantalón ──────────────────────────────────────────────────────
  if (cat.includes('Pantalón')) {
    if (formal) {
      return {
        metodo: 'colgar',
        icono: 'hanger',
        tipoPercha: 'con pinzas',
        zona: 'Barra de perchas',
        consejo: 'Colgar por el dobladillo con pinzas preserva la caída del pantalón de vestir.',
      };
    }
    return {
      metodo: 'doblar',
      icono: 'layers',
      zona: 'Cajón o Balda',
      consejo: 'Dobla por la mitad a lo largo y luego en 3. Apila de pie en el cajón para verlos todos.',
    };
  }

  // ── Falda ─────────────────────────────────────────────────────────
  if (cat.includes('Falda')) {
    if (formal || telaFina || tela === 'Lino') {
      return {
        metodo: 'colgar',
        icono: 'hanger',
        tipoPercha: 'con pinzas',
        zona: 'Barra de perchas',
        consejo: 'Colgar con pinzas por la cintura evita arrugas y mantiene la caída.',
        alerta: telaFina
          ? 'Pon un trozo de tela entre la pinza y la tela para no dejar marca.'
          : undefined,
      };
    }
    return {
      metodo: 'doblar',
      icono: 'layers',
      zona: 'Cajón o Balda',
      consejo: 'Dobla en 2–3 partes y coloca de pie en el cajón para ocupar menos espacio.',
    };
  }

  // Fallback
  return {
    metodo: 'doblar',
    icono: 'layers',
    zona: 'Cajón o Balda',
    consejo: 'Dobla y guarda en un lugar seco y aireado.',
  };
}

// ── Metadatos de UI por método ─────────────────────────────────────
export const METODO_META: Record<Metodo, { label: string; icono: string; color: string; bg: string }> = {
  colgar:   { label: 'Colgar en percha',  icono: 'hanger',                color: '#1A2024', bg: '#F4F6F8' },
  doblar:   { label: 'Doblar',            icono: 'layers',                color: '#5E7E91', bg: '#EDF2F7' },
  enrollar: { label: 'Enrollar',          icono: 'format-align-justify',  color: '#4CAF50', bg: '#F0FFF4' },
  zapatero: { label: 'Zapatero',          icono: 'shoe-formal',           color: '#94A3B8', bg: '#F8FAFC' },
};

// ── Etiqueta de tipo de percha ─────────────────────────────────────
export const PERCHA_LABEL: Record<string, string> = {
  'estándar':   'Percha estándar',
  'ancha':      'Percha ancha',
  'con pinzas': 'Percha con pinzas',
  'acolchada':  'Percha acolchada',
};
