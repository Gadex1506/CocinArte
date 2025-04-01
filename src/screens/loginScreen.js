import React, { useEffect, useRef, useState } from 'react';
import {View, Text, StyleSheet, Image, TextInput, Alert, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, Vibration, Animated} from 'react-native';
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

    // Animación de shake
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Función de animación de sacudida (shake)
    const shakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

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
        } else if (password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 12 caracteres');
        return false;
        }
        setPasswordError('');
        return true;
    };

    const handleLogin = () => {

        // Validar los campos de correo y contraseña antes de continuar
        const isValidEmail = validateEmail(email);
        const isValidPassword = validatePassword(password);

        // Si el campo de correo o contraseña se encuentran vacios
        if (!isValidEmail || !isValidPassword) {
            Vibration.vibrate(300);
            shakeAnimation();
            return;
        }

        setIsLoading(true);

        const auth = getAuth();

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
            // Usuario registrado
            const user = userCredentials.user;
            navigation.replace('Welcome'); // Continuar a la siguiente ventana despues de haber validado el usuario
        })
        .catch((error) => {
            // Traduccion de errores mas comunes de Firebase para mejorar la experiencia de usuario
            let errorMessage;
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No existe ninguna cuenta con este correo electrónico';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'La contraseña es incorrecta';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde';
                case 'auth/invalid-credential':
                    errorMessage = 'Correo o contraseña incorrecta';
                    break;
                default:
                    errorMessage = error.message;
                    break;
            }
            Alert.alert('Error', errorMessage);
            Vibration.vibrate([100,200,100]);
            shakeAnimation();
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    // Muestra un spinner mientras se verifica el estado de autenticación
    if (initializing) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#ffffff"/>
                <Text style={style.loadingText}>Cargando...</Text>
            </View>
        );
    }

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
                <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                    {/* Caja de Correo Electrónico */}
                    <View style={styles.cajaCorreo}>

                        {/* Icono de correo */}
                        <View style={styles.envelopeIcon}>
                            <EnvelopeIcon size={hp(3)} strokeWidth={3} color={"#ff5c2e"} />
                        </View>

                        <TextInput 
                            placeholder='Ingresa tu Correo Electrónico Aquí...'
                            placeholderTextColor={"#20202099"}
                            style={[styles.textInputStyle, emailError ? styles.inputError: null]}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) validateEmail(text);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => Vibration.vibrate(25)} // Agregar vibración al enfocar el input
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
                            placeholderTextColor={"#20202099"}
                            style={[styles.textInputStyle, passwordError ? styles.inputError : null]}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) validatePassword(text);
                            }}
                            secureTextEntry
                            onFocus={() => Vibration.vibrate(25)} // Agregar vibración al enfocar el input
                        />
                        { passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null }

                    </View>

                    <TouchableOpacity 
                        style={[styles.button, isLoading ? styles.buttonDisabled : null]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                        >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signupContainer} onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                        <Text style={[styles.forgotText, { color: '#ff5c2e', fontFamily: "Nunito-SemiBold" }]}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
        
                    <View style={styles.signupContainer}>
                        <Text style={[styles.signupText, {color: "#ffffffcc", fontFamily: "Nunito-SemiBold"}]}>¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => {
                            Vibration.vibrate(25);
                            navigation.navigate('RegisterScreen');
                        }}>
                            <Text style={[styles.signupLink, { color: "#ff5c2e", fontFamily: "Nunito-Bold" }]}>Regístrate</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>

                </ScrollView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202020',
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
        top: 10,
        opacity: 0.3,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#64748b',
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
        marginBottom: hp("4%"),
        top: hp("40%"),
    },
    button: {
        backgroundColor: '#FFE38F',
        padding: 14,
        borderRadius: 18,
        top: hp("38%"),
        marginHorizontal: 100,
    },
        buttonDisabled: {
        backgroundColor: '#FFE38F',
    },
    buttonText: {
        fontFamily: "Nunito-Bold",
        color: '#ff5c2e',
        textAlign: 'center',
        fontSize: 16,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        top: hp("38%"),
        color: '#fff',
    },
    signupText: {
        fontSize: 14,
    },
    signupLink: {
        fontSize: 14,
    },
    forgotText: {
        textAlign: 'right',
        fontSize: 14,
    },
    inputError: {
        borderColor: '#ef4444',
        marginBottom: 4,
    },
    errorText: {
        position: "absolute",
        fontFamily: "Nunito-Bold",
        color: '#ff5c2e',
        marginTop: 4,
        marginLeft: 10,
        fontSize: 12,
        top: 53,
    },
    textInputStyle: {
        position: "absolute",
        fontSize: hp(1.7),
        flex: 1,
        color: "#202020",
        margin: 1,
        left: hp(5.5),
        letterSpacing: 0.5,
        fontFamily: "Nunito-SemiBold",
        justifyContent: 'center',
    },
    envelopeIcon: {
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#ff5c2e',
        padding: 14,
        borderRadius: 8,
        marginTop: hp(42),
        alignSelf: 'center',
        justifyContent: 'center',
        width: wp("50%"),
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: 'white',
        fontFamily: "Nunito-Bold",
        textAlign: 'center',
        fontSize: 20,
    },
    forgotText: {
        color: '#1976d2',
        textAlign: 'right',
        marginTop: 12,
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signupText: {
        fontSize: 14,
        color: '#64748b',
    },
    signupLink: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: '600',
    },
});