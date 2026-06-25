import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useUserContext } from '@/contexts/UserContext';

export function HeaderAvatar() {
  const { fotoPerfil } = useUserContext();

  return (
    <Link href="/perfil" asChild>
      <Pressable style={{ marginRight: 15 }}>
        {fotoPerfil ? (
          <Image
            source={{ uri: fotoPerfil }}
            style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#fff' }}
            contentFit="cover"
          />
        ) : (
          <MaterialCommunityIcons name="account-circle" size={32} color="#fff" />
        )}
      </Pressable>
    </Link>
  );
}
