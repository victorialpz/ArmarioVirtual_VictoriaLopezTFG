import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function iniciarSesion() {
        Keyboard.dismiss(); 
        
        if (!email || !password) {
            Alert.alert('Datos incompletos', 'Por favor, escribe tu correo y contraseña para entrar.');
            return; 
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert('Error al iniciar sesión', error.message);
        } else {
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
                    <MaterialCommunityIcons name="hanger" size={80} color="#1A2024" />
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
                        <ActivityIndicator size="large" color="#1A2024" style={{ marginTop: 20 }} />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    titulo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    subtitulo: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    botonPrincipal: {
        backgroundColor: '#1A2024',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBotonPrincipal: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    botonSecundario: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    textoBotonSecundario: {
        color: '#1A2024',
        fontSize: 16,
        fontWeight: '600',
    },
});