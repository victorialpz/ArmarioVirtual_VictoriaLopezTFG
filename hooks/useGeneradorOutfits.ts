import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';
import { OPENWEATHER_API_KEY } from '@/constants/config';
import { supabase } from '../lib/supabase';

export const useGeneradorOutfits = () => {
  const [loading, setLoading] = useState(false);
  const [climaActual, setClimaActual] = useState<{ temp: number; descripcion: string; tipo: string; localidad: string } | null>(null);
  const [outfitGenerado, setOutfitGenerado] = useState<any | null>(null);

  // 1. OBTENER EL CLIMA CON GPS
  const obtenerClima = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para saber qué tiempo hace.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
      );
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const temp = Math.round(data.main.temp);
      let tipoClima = 'Entretiempo';
      if (temp < 15) tipoClima = 'Frío';
      if (temp > 25) tipoClima = 'Calor';

      const clima = { temp, descripcion: data.weather[0].description, tipo: tipoClima, localidad: data.name as string || '' };
      setClimaActual(clima);
      return clima;
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No pudimos obtener el clima actual.');
      return null;
    }
  };

  const calcularClimaDesdeTemp = (temp: number, localidad = '') => {
    const tipo = temp < 15 ? 'Frío' : temp > 25 ? 'Calor' : 'Entretiempo';
    const descripcion = temp < 15 ? 'frío' : temp > 25 ? 'caluroso' : 'templado';
    const clima = { temp, descripcion, tipo, localidad };
    setClimaActual(clima);
    return clima;
  };

  // ── helpers de estado ────────────────────────────────────────────────
  const _slotDe = (cat: string): 'superior' | 'inferior' | 'calzado' | 'abrigo' | null => {
    if (['Top', 'Camisa', 'Camiseta', 'Blusa', 'Vestido'].some(k => cat.includes(k))) return 'superior';
    if (['Pantalón', 'Falda', 'Vaquero'].some(k => cat.includes(k))) return 'inferior';
    if (['Zapato', 'Calzado', 'Zapatilla'].some(k => cat.includes(k))) return 'calzado';
    if (['Abrigo', 'Chaqueta', 'Jersey', 'Sudadera'].some(k => cat.includes(k))) return 'abrigo';
    return null;
  };

  // ── Compatibilidad de colores ─────────────────────────────────────────
  const NEUTRALES = new Set(['Blanco', 'Negro', 'Gris', 'Beige', 'Marrón', 'Dorado', 'Plateado']);
  const ACENTO_COMPAT: Record<string, string[]> = {
    'Azul':    ['Morado', 'Rosa', 'Naranja'],
    'Rojo':    ['Rosa', 'Naranja'],
    'Verde':   ['Amarillo', 'Azul'],
    'Amarillo':['Verde', 'Naranja'],
    'Naranja': ['Rojo', 'Amarillo', 'Verde', 'Azul'],
    'Rosa':    ['Morado', 'Rojo', 'Azul'],
    'Morado':  ['Rosa', 'Azul'],
  };

  const _extraerColores = (colorStr: string): string[] =>
    colorStr ? colorStr.split(',').map(c => c.trim()).filter(Boolean) : [];

  const _colorCompatible = (pA: any, pB: any): boolean => {
    if (!pA?.color || !pB?.color) return true;
    const cA = _extraerColores(pA.color);
    const cB = _extraerColores(pB.color);
    if (cA.some(c => NEUTRALES.has(c)) || cB.some(c => NEUTRALES.has(c))) return true;
    for (const a of cA) {
      for (const b of cB) {
        if (a === b) return true;
        if (ACENTO_COMPAT[a]?.includes(b)) return true;
      }
    }
    return false;
  };

  const _preguntarEstado = (
    hayEnUso: boolean,
    hayAMedias: boolean,
  ): Promise<'en_uso' | 'a_medias' | 'cualquiera' | 'normal'> =>
    new Promise(resolve => {
      if (hayEnUso) {
        Alert.alert(
          'Llevas algo puesto',
          '¿Completamos el outfit con lo que llevas puesto?',
          [
            { text: 'Completar mi look',  onPress: () => resolve('en_uso') },
            { text: 'Me da igual',         onPress: () => resolve('cualquiera') },
            { text: 'Solo ropa limpia',    onPress: () => resolve('normal') },
          ],
        );
      } else if (hayAMedias) {
        Alert.alert(
          'Tienes ropa a medias',
          '¿Quieres usarla para terminar de ensuciarlo?',
          [
            { text: 'Sí, usar lo de a medias', onPress: () => resolve('a_medias') },
            { text: 'Me da igual',              onPress: () => resolve('cualquiera') },
            { text: 'Solo ropa limpia',         onPress: () => resolve('normal') },
          ],
        );
      } else {
        resolve('normal');
      }
    });

  // 2. EL MOTOR DE REGLAS (GENERAR OUTFIT)
  const generarOutfit = async (climaForzado?: { temp: number; descripcion: string; tipo: string }) => {
    setLoading(true);
    setOutfitGenerado(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión.");

      const clima = climaForzado ?? await obtenerClima();
      if (!clima) throw new Error("No hay datos del clima.");

      const { data: ropa, error } = await supabase
        .from('prendas')
        .select('*')
        .eq('id_usuario', user.id);

      if (error) throw error;
      if (!ropa || ropa.length === 0) {
        Alert.alert("Armario vacío", "Sube prendas a tu armario primero.");
        return;
      }

      // ── Preguntar según el estado de las prendas ─────────────────
      const enUso   = ropa.filter(p => p.estado === 'En uso');
      const aMedias = ropa.filter(p => p.estado === 'A medias');
      const limpia  = ropa.filter(p => p.estado === 'Limpio' || !p.estado);

      const preferencia = await _preguntarEstado(enUso.length > 0, aMedias.length > 0);

      // prendas que DEBEN aparecer en el outfit (slot fijado)
      const fijadas: any[] = preferencia === 'en_uso' ? enUso : [];

      // pool del que se elige aleatoriamente para los slots no fijados
      let pool: any[];
      switch (preferencia) {
        case 'en_uso':    pool = limpia; break;
        case 'a_medias':  pool = [...aMedias, ...limpia]; break;
        case 'cualquiera': pool = ropa.filter(p => p.estado !== 'Sucio'); break;
        default:          pool = limpia;
      }

      // slot → prenda fijada (la primera de cada slot gana)
      const slotFijo: Record<string, any> = {};
      fijadas.forEach(p => {
        const s = _slotDe(p.categoria);
        if (s && !slotFijo[s]) slotFijo[s] = p;
      });

      const azar = (arr: any[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
      const deslot = (slot: string) => pool.filter(p => _slotDe(p.categoria) === slot);

      // Elige prenda del slot compatible con las ya elegidas; si no hay, elige sin restricción
      const yaElegidas: any[] = [];
      const elegirCompat = (slot: string): any => {
        if (slotFijo[slot]) return slotFijo[slot];
        const candidatos = deslot(slot);
        const compatibles = candidatos.filter(p =>
          yaElegidas.every(e => e && _colorCompatible(p, e))
        );
        return azar(compatibles.length > 0 ? compatibles : candidatos);
      };

      // ── Armar outfit ──────────────────────────────────────────────
      let superior: any = null;
      let inferior: any = null;

      if (slotFijo['superior']) {
        superior = slotFijo['superior'];
        yaElegidas.push(superior);
        if (!superior.categoria.includes('Vestido')) {
          inferior = elegirCompat('inferior');
          if (inferior) yaElegidas.push(inferior);
        }
      } else {
        const vestidosPool   = pool.filter(p => p.categoria.includes('Vestido'));
        const superioresPool = pool.filter(p =>
          p.categoria.includes('Top') || p.categoria.includes('Camisa') ||
          p.categoria.includes('Camiseta') || p.categoria.includes('Blusa')
        );
        const inferioresPool = pool.filter(p =>
          p.categoria.includes('Pantalón') || p.categoria.includes('Falda') ||
          p.categoria.includes('Vaquero')
        );

        const puedeVestido  = vestidosPool.length > 0;
        const puedeConjunto = superioresPool.length > 0 && inferioresPool.length > 0;

        if (!puedeVestido && !puedeConjunto) {
          Alert.alert("Armario incompleto", "Con la ropa disponible no hay suficiente para hacer un outfit.");
          return;
        }

        if (puedeVestido && (!puedeConjunto || Math.random() > 0.5)) {
          superior = azar(vestidosPool);
          inferior = null;
          if (superior) yaElegidas.push(superior);
        } else {
          superior = azar(superioresPool);
          if (superior) yaElegidas.push(superior);
          // Filtra inferiores compatibles con el superior elegido
          const infCompat = inferioresPool.filter(p =>
            yaElegidas.every(e => e && _colorCompatible(p, e))
          );
          inferior = slotFijo['inferior'] ?? azar(infCompat.length > 0 ? infCompat : inferioresPool);
          if (inferior) yaElegidas.push(inferior);
        }
      }

      const calzado = elegirCompat('calzado');
      if (calzado) yaElegidas.push(calzado);

      // Frío → puede ser Abrigo/Chaqueta o Jersey/Sudadera
      // Entretiempo → solo Jersey/Sudadera (capa ligera)
      // Calor → nada
      let abrigo: any = null;
      if (clima.tipo === 'Frío') {
        abrigo = elegirCompat('abrigo');
      } else if (clima.tipo === 'Entretiempo') {
        const capasLigeras = pool.filter(p =>
          (p.categoria.includes('Jersey') || p.categoria.includes('Sudadera')) &&
          yaElegidas.every(e => e && _colorCompatible(p, e))
        );
        abrigo = azar(capasLigeras.length > 0 ? capasLigeras : []);
      }

      setOutfitGenerado({ clima, superior, inferior, calzado, abrigo });

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. GUARDAR EL OUTFIT EN LA BASE DE DATOS
  const guardarOutfit = async (evento: string) => {
    if (!outfitGenerado) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión.");

      const { data: nuevoOutfit, error: errorOutfit } = await supabase
        .from('outfits')
        .insert({
          id_usuario: user.id,
          nombre: `Look ${evento} - ${climaActual?.tipo}`,
          clima_ideal: climaActual?.tipo,
          evento_ideal: evento
        })
        .select()
        .single(); 

      if (errorOutfit) throw errorOutfit;

      const prendasElegidas = [
        outfitGenerado.superior?.id,
        outfitGenerado.inferior?.id,
        outfitGenerado.calzado?.id,
        outfitGenerado.abrigo?.id
      ].filter(id => id !== undefined && id !== null); 

      const inserciones = prendasElegidas.map(id_prenda => ({
        id_outfit: nuevoOutfit.id,
        id_prenda: id_prenda
      }));

      const { error: errorIntermedia } = await supabase
        .from('outfit_prendas')
        .insert(inserciones);

      if (errorIntermedia) throw errorIntermedia;

      // Marcar las prendas del outfit como "En uso"
      await supabase
        .from('prendas')
        .update({ estado: 'En uso' })
        .in('id', prendasElegidas);

      // Marcar como favorita cualquier prenda que supere 3 usos en outfits
      await Promise.all(
        prendasElegidas.map(async (id_prenda) => {
          const { count } = await supabase
            .from('outfit_prendas')
            .select('*', { count: 'exact', head: true })
            .eq('id_prenda', id_prenda);

          if (count !== null && count > 3) {
            await supabase
              .from('prendas')
              .update({ es_favorito: true })
              .eq('id', id_prenda);
          }
        })
      );

      Alert.alert('¡Outfit Guardado!', 'Este conjunto se ha guardado en tu colección.');

    } catch (error: any) {
      Alert.alert('Error', 'No se pudo guardar el outfit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarOutfitManual = async (nombre: string, idsSeleccionadas: string[], evento: string = 'Diario'): Promise<boolean> => {
    if (idsSeleccionadas.length === 0) return false;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión.");

      const { data: nuevoOutfit, error: errorOutfit } = await supabase
        .from('outfits')
        .insert({
          id_usuario: user.id,
          nombre: nombre.trim() || 'Look Manual',
          clima_ideal: 'Cualquiera',
          evento_ideal: evento,
        })
        .select()
        .single();

      if (errorOutfit) throw errorOutfit;

      const { error: errorIntermedia } = await supabase
        .from('outfit_prendas')
        .insert(idsSeleccionadas.map(id_prenda => ({ id_outfit: nuevoOutfit.id, id_prenda })));

      if (errorIntermedia) throw errorIntermedia;

      await supabase
        .from('prendas')
        .update({ estado: 'En uso' })
        .in('id', idsSeleccionadas);

      await Promise.all(
        idsSeleccionadas.map(async (id_prenda) => {
          const { count } = await supabase
            .from('outfit_prendas')
            .select('*', { count: 'exact', head: true })
            .eq('id_prenda', id_prenda);
          if (count !== null && count > 3) {
            await supabase.from('prendas').update({ es_favorito: true }).eq('id', id_prenda);
          }
        })
      );

      Alert.alert('¡Look Guardado!', 'Tu conjunto se ha guardado en tu colección.');
      return true;
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo guardar el outfit: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, climaActual, outfitGenerado, generarOutfit, obtenerClima, guardarOutfit, guardarOutfitManual, calcularClimaDesdeTemp };
};