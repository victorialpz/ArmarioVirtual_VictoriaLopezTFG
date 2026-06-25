import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

type Opciones = ImagePicker.ImagePickerOptions;
type Callback = (asset: ImagePicker.ImagePickerAsset) => void | Promise<void>;

export function elegirImagen(opciones: Opciones, onResult: Callback): void {
  Alert.alert(
    'Seleccionar imagen',
    undefined,
    [
      {
        text: 'Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync(opciones);
          if (!result.canceled) onResult(result.assets[0]);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync(opciones);
          if (!result.canceled) onResult(result.assets[0]);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]
  );
}
