import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
//import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
       tabBarActiveTintColor: '#5c4033', 
        tabBarInactiveTintColor: 'gray',
        headerShown: true, 
        headerStyle: { backgroundColor: '#5c4033' }, 
        headerTintColor: '#fff', 
        tabBarButton: HapticTab, 
      }}>
     
      <Tabs.Screen
        name="armario"
        options={{
          title: 'Armario',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="wardrobe" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lavado"
        options={{
          title: 'Lavado',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="washing-machine" size={28} color={color} />,
        }}
      />     
      <Tabs.Screen
        name="outfit"
        options={{
          title: 'Outfit',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={28} color={color} />,
        }}
      />    
      <Tabs.Screen
        name="prendas"
        options={{
          title: 'Prendas',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="tshirt-crew" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
