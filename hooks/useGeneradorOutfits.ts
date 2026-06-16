import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// 🔑 Tu clave de OpenWeatherMap
const OPENWEATHER_API_KEY = "335365b4cdb6c5a038c28b16c4701b64";

export const useGeneradorOutfits = () => {
  const [loading, setLoading] = useState(false);
  const [climaActual, setClimaActual] = useState<{ temp: number; descripcion: string; tipo: string } | null>(null);
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

      const clima = { temp, descripcion: data.weather[0].description, tipo: tipoClima };
      setClimaActual(clima);
      return clima;
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No pudimos obtener el clima actual.');
      return null;
    }
  };

  // 2. EL MOTOR DE REGLAS (GENERAR OUTFIT)
  const generarOutfit = async (estiloEvento: string) => {
    setLoading(true);
    setOutfitGenerado(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión.");

      const clima = await obtenerClima();
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

      // --- PASO 1: Filtrar por el estilo que ha pedido el usuario ---
      let ropaFiltrada = ropa.filter(prenda => 
        prenda.estilo && prenda.estilo.includes(estiloEvento)
      );

      // --- PASO 2: Comprobar si con esa ropa podemos montar un conjunto ---
      let partesSuperiores = ropaFiltrada.filter(p => p.categoria.includes('Top') || p.categoria.includes('Camisa') || p.categoria.includes('Camiseta') || p.categoria.includes('Blusa'));
      let partesInferiores = ropaFiltrada.filter(p => p.categoria.includes('Pantalón') || p.categoria.includes('Falda') || p.categoria.includes('Vaquero'));
      let vestidos = ropaFiltrada.filter(p => p.categoria.includes('Vestido'));
      
      let puedeUsarVestido = vestidos.length > 0;
      let puedeUsarConjunto = partesSuperiores.length > 0 && partesInferiores.length > 0;

      // --- MEJORA DEFINITIVA: EL FALLBACK INTELIGENTE ---
      // Si la IA encontró algo de ese estilo pero se quedó "a medias" (ej: falta el pantalón)
      if (!puedeUsarVestido && !puedeUsarConjunto) {
         Alert.alert("Modo Flexible", `No tienes un conjunto completo del estilo ${estiloEvento}. Combinando con todo tu armario...`);
         
         // Deshacemos el filtro y usamos todo el armario
         ropaFiltrada = ropa; 
         
         // Volvemos a buscar Tops y Pantalones en todo el armario
         partesSuperiores = ropaFiltrada.filter(p => p.categoria.includes('Top') || p.categoria.includes('Camisa') || p.categoria.includes('Camiseta') || p.categoria.includes('Blusa'));
         partesInferiores = ropaFiltrada.filter(p => p.categoria.includes('Pantalón') || p.categoria.includes('Falda') || p.categoria.includes('Vaquero'));
         vestidos = ropaFiltrada.filter(p => p.categoria.includes('Vestido'));
         
         puedeUsarVestido = vestidos.length > 0;
         puedeUsarConjunto = partesSuperiores.length > 0 && partesInferiores.length > 0;
      }

      // Si aún usando TODO el armario seguimos sin poder vestir a la usuaria (falla de verdad)
      if (!puedeUsarVestido && !puedeUsarConjunto) {
          Alert.alert("Armario incompleto", "Necesitas al menos un Vestido, o una Parte Superior y una Parte Inferior guardadas en la app.");
          return;
      }

      // Categorías adicionales
      const zapatos = ropaFiltrada.filter(p => p.categoria.includes('Zapato') || p.categoria.includes('Calzado') || p.categoria.includes('Zapatillas'));
      const prendasAbrigo = ropaFiltrada.filter(p => p.categoria.includes('Abrigo') || p.categoria.includes('Chaqueta') || p.categoria.includes('Jersey') || p.categoria.includes('Sudadera'));

      const elegirAzar = (array: any[]) => array.length > 0 ? array[Math.floor(Math.random() * array.length)] : null;

      let outfit: any = {
        clima: clima,
        calzado: elegirAzar(zapatos),
        abrigo: null
      };

      if (clima.tipo === 'Frío' || clima.tipo === 'Entretiempo') {
        outfit.abrigo = elegirAzar(prendasAbrigo);
      }

      // Si tiene vestidos y conjuntos, elige al azar. Si solo tiene uno, usa ese.
      if (puedeUsarVestido && (!puedeUsarConjunto || Math.random() > 0.5)) {
          outfit.superior = elegirAzar(vestidos);
          outfit.inferior = null; 
      } else {
          outfit.superior = elegirAzar(partesSuperiores);
          outfit.inferior = elegirAzar(partesInferiores);
      }

      setOutfitGenerado(outfit);

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

      Alert.alert('¡Outfit Guardado!', 'Este conjunto se ha guardado en tu colección.');

    } catch (error: any) {
      Alert.alert('Error', 'No se pudo guardar el outfit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, climaActual, outfitGenerado, generarOutfit, obtenerClima, guardarOutfit };
};