import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { getSugerencia, Metodo, Sugerencia } from '../lib/reglasAlmacenamiento';

export interface PrendaOrganizada {
  prenda: {
    id: string;
    nombre: string;
    categoria: string;
    tipo_tela?: string;
    estilo?: string[];
    es_delicado?: boolean;
    imagen_url?: string;
    estado?: string;
  };
  sugerencia: Sugerencia;
}

export type GruposAlmacenamiento = Record<Metodo, PrendaOrganizada[]>;

const GRUPOS_VACIOS: GruposAlmacenamiento = {
  colgar:   [],
  doblar:   [],
  enrollar: [],
  zapatero: [],
};

export const useAlmacenamiento = () => {
  const [grupos, setGrupos]             = useState<GruposAlmacenamiento>(GRUPOS_VACIOS);
  const [loading, setLoading]           = useState(false);
  const [totalPerchas, setTotalPerchas] = useState(0);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('prendas')
        .select('id, nombre, categoria, tipo_tela, estilo, es_delicado, imagen_url, estado')
        .eq('id_usuario', user.id);

      if (error) throw error;

      const nuevos: GruposAlmacenamiento = { colgar: [], doblar: [], enrollar: [], zapatero: [] };

      (data ?? []).forEach(prenda => {
        const sugerencia = getSugerencia(prenda);
        nuevos[sugerencia.metodo].push({ prenda, sugerencia });
      });

      setGrupos(nuevos);
      setTotalPerchas(nuevos.colgar.length);
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo cargar tu armario: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const total = Object.values(grupos).reduce((acc, g) => acc + g.length, 0);

  return { grupos, loading, totalPerchas, total, cargar };
};
