import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export type TipoArmario = 'empotrado' | 'independiente' | 'vestidor';

export interface ArmarioConfig {
  tipo: TipoArmario;
  num_barras: number;
  longitud_barra_cm: number;
  num_baldas: number;
  num_cajones: number;
  tiene_zapatero: boolean;
  capacidad_zapatero: number;
}

export const CONFIG_DEFECTO: ArmarioConfig = {
  tipo:               'independiente',
  num_barras:         1,
  longitud_barra_cm:  100,
  num_baldas:         2,
  num_cajones:        2,
  tiene_zapatero:     false,
  capacidad_zapatero: 0,
};

// ~5 cm por prenda en barra, ~10 prendas por cajón, ~8 por balda
export function calcularCapacidad(c: ArmarioConfig) {
  return {
    barraMax:    Math.floor((c.longitud_barra_cm * c.num_barras) / 5),
    cajonesMax:  c.num_cajones * 10,
    baldasMax:   c.num_baldas * 8,
    zapateroMax: c.tiene_zapatero ? c.capacidad_zapatero : 0,
  };
}

export const useArmarioConfig = () => {
  const [config, setConfig]           = useState<ArmarioConfig>(CONFIG_DEFECTO);
  const [configurado, setConfigurado] = useState(false);
  const [loading, setLoading]         = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('armario_config')
        .select('*')
        .eq('id_usuario', user.id)
        .single();

      if (data) {
        setConfig({
          tipo:               data.tipo,
          num_barras:         data.num_barras,
          longitud_barra_cm:  data.longitud_barra_cm,
          num_baldas:         data.num_baldas,
          num_cajones:        data.num_cajones,
          tiene_zapatero:     data.tiene_zapatero,
          capacidad_zapatero: data.capacidad_zapatero,
        });
        setConfigurado(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const guardar = useCallback(async (nueva: ArmarioConfig) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    const { error } = await supabase
      .from('armario_config')
      .upsert(
        { id_usuario: user.id, ...nueva, updated_at: new Date().toISOString() },
        { onConflict: 'id_usuario' }
      );
    if (error) throw error;

    setConfig(nueva);
    setConfigurado(true);
  }, []);

  return { config, configurado, loading, cargar, guardar };
};
