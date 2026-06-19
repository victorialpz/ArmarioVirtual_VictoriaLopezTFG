import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { styles } from '@/styles/screens/login';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function iniciarSesion() {
        Keyboard.dismiss(); 
        
        if (!email || !password) {
            logger.warn('LoginScreen', 'Faltan credenciales para iniciar sesión', { emailProvided: !!email, passwordProvided: !!password });
            Alert.alert('Datos incompletos', 'Por favor, escribe tu correo y contraseña para entrar.');
            return; 
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            logger.error('LoginScreen', error, { email });
            Alert.alert('Error al iniciar sesión', error.message);
        } else {
            logger.info('LoginScreen', 'Inicio de sesión correcto', { email });
            router.replace('/(tabs)');
        }
        setLoading(false);
    }

    const irARegistro = () => {
        router.push('/registro_datos');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <MaterialCommunityIcons name="hanger" size={80} color="#5c4033" />
                    <Text style={styles.titulo}>Armario Virtual</Text>
                    <Text style={styles.subtitulo}>Tu ropa, organizada e inteligente</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color="#5c4033" style={{ marginTop: 20 }} />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.botonPrincipal} onPress={iniciarSesion}>
                                <Text style={styles.textoBotonPrincipal}>Iniciar Sesión</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.botonSecundario} onPress={irARegistro}>
                                <Text style={styles.textoBotonSecundario}>Crear una cuenta nueva</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

