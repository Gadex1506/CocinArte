import React, { useEffect, useRef, useState } from 'react';
import {View, Text, StyleSheet, Image, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView} from 'react-native';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { EnvelopeIcon, LockClosedIcon} from 'react-native-heroicons/outline';

export default function Login() {

    const navigation = useNavigation(); // Hook para manejar la navegación

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    {/* Exportacion de fuente Nunito */}
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                //El usuario ya se encuentra autenticado y se puede mover al Parallax
                navigation.replace('Parallax');
            }
            setInitializing(false);
        });

        // Limpiar el listener cuando el componente se deje de utilizar
        return unsubscribe;
    }, []);

    // Validación de email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
        setEmailError('El correo electrónico es obligatorio');
        return false;
        } else if (!emailRegex.test(email)) {
        setEmailError('Introduce un correo electrónico válido');
        return false;
        }
        setEmailError('');
        return true;
    };

    // Validación de contraseña
    const validatePassword = (password) => {
        if (!password) {
        setPasswordError('La contraseña es obligatoria');
        return false;
        } else if (password.length < 12) {
        setPasswordError('La contraseña debe tener al menos 12 caracteres');
        return false;
        }
        setPasswordError('');
        return true;
    };

    return (
        <View style={styles.container}>

            <StatusBar style='light'/>

            <SafeAreaView>

                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollView}
                >

                {/* Imagen de fondo con opacidad */}
                <Image source={require("../../assets/images/background.png")} style={styles.fruitBackground} />
            
                {/* Titulo y Subtitulo */}
                <View style={styles.titleSubtitle}>
                    <Text style={styles.textTitle}>¡Bienvenido!</Text>
                    <Text style={styles.textSubtitle}>Ingresa o registrate para poder continuar</Text>
                </View>

                {/* Cajas para ingresar los datos */}
                <View>

                    {/* Caja de Correo Electrónico */}
                    <View style={styles.cajaCorreo}>

                        {/* Icono de correo */}
                        <View style={styles.envelopeIcon}>
                            <EnvelopeIcon size={hp(3)} strokeWidth={3} color={"#ff5c2e"} />
                        </View>

                        <TextInput 
                            placeholder='Ingresa tu Correo Electrónico Aquí...'
                            placeholderTextColor={"#ff5c2ebb"}
                            style={[styles.textInputStyle, emailError ? styles.inputError: null]}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) validateEmail(text);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        { emailError ? <Text style={styles.errorText}>{emailError}</Text> : null }
                    </View>

                    {/* Caja de Contrasena */}
                    <View style={styles.cajaCorreo}>

                        {/* Icono de correo */}
                        <View style={styles.envelopeIcon}>
                            <LockClosedIcon size={hp(3)} strokeWidth={3} color={"#ff5c2e"} />
                        </View>

                        <TextInput 
                            placeholder='Ingresa tu Contraseña Aquí...'
                            placeholderTextColor={"#ff5c2ebb"}
                            style={[styles.textInputStyle, passwordError ? styles.inputError : null]}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) validatePassword(text);
                            }}
                            secureTextEntry
                        />
                        { passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null }
                    </View>

                </View>

                </ScrollView>

            </SafeAreaView>

            
            

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ff5c2e',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    scrollView: {
        paddingBottom: 50,
        paddingTop: 14,
    },
    fruitBackground: {
        position: 'absolute',
        width: wp(100),
        height: hp(100),
    },
    titleSubtitle: {
        position: 'absolute',
        left: wp(4),
        top: hp("25%"),
    },
    textTitle: {
        fontSize: 50,
        fontFamily: 'Nunito-ExtraBold',
        color: '#fff',
        marginBottom: 10,
    },
    textSubtitle: {
        fontSize: 16,
        fontFamily: 'Nunito-Medium',
        top: -hp("1%"),
        color: '#fff',
    },
    /*cajas: {
        flexDirection: "row",
        alignItems: "center",
    },*/
    cajaCorreo: {
        backgroundColor: "#F6F6F6",
        marginHorizontal: 20,
        borderRadius: 18,
        paddingVertical: 5, //Espaciado Interno
        paddingHorizontal: 15, //Espaciado Lateral
        flexDirection: "row", //Alinear icono y texto horizontalment
        alignItems: "center", //Alinear elementos verticalmente
        height: hp("6.6%"),
        width: wp("90%"),
        left: -hp(0.5),
        marginBottom: hp("2%"),
        top: hp("38%"),
    },
    inputError: {
        borderColor: '#ef4444',
        marginBottom: 4,
    },
    errorText: {
        color: '#ef4444',
        marginBottom: 10,
        fontSize: 12,
        marginLeft: 4,
    },
    textInputStyle: {
        fontSize: hp(1.7),
        flex: 1,
        color: "#ff5c2e",
        margin: 1,
        left: hp(1),
        letterSpacing: 0.5,
        fontFamily: "Nunito-Semibold",
    },
    envelopeIcon: {
        borderRadius: 10,
    },
});