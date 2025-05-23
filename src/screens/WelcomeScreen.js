import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { NavigationContainer } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';

export default function WelcomeScreen() {

    {/* Exportacion de fuente Nunito */}
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    const animation = new useRef(null);
    const navigation = useNavigation();

    return (
        <View style={styles.container}>

            {/* Imagen de fondo con opacidad */}
            <Image source={require("../../assets/images/background.png")} style={styles.fruitBackground} />
        
            {/* Lottie Logo Comida */}
            <View>
                <LottieView 
                    autoPlay 
                    ref={animation} 
                    style={styles.fruitAnimation}
                    source={require("../../assets/lottie/Veggetables_Fruits.json")}
                />
            </View>
            
            {/* Titulo y Subtitulo */}
            <View style={styles.titleSubtitle}>
                <Text style={styles.textTitle}>CocinArte</Text>
                <Text style={styles.textSubtitle}>¡Cualquiera puede Cocinar!</Text>
            </View>

            {/* Boton de Empezar para ir a la pantalla de Explorar */}
            <View>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('Parallax')}
                >
                    <Text style={styles.startText}>Empezar</Text>
                </TouchableOpacity>
            </View>

            <StatusBar style='light'/>

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
    fruitBackground: {
        position: 'absolute',
        width: wp(100),
        height: hp(100),
    },
    fruitAnimation: {
        width: wp(100),
        height: hp(100),
    },
    titleSubtitle: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: hp("67%"),
    },
    textTitle: {
        fontSize: 55,
        fontFamily: 'Nunito-ExtraBold',
        color: '#fff',
        marginBottom: 10,
    },
    textSubtitle: {
        fontSize: 20,
        fontFamily: 'Nunito-SemiBold',
        top: -hp("1%"),
        color: '#fff',
    },
    startText: {
        fontSize: 20,
        padding: 3,
        color: '#ff5c2e',
        fontFamily: 'Nunito-ExtraBold',
    },
    button: {
        bottom: wp(30),
        backgroundColor: "#fff",
        paddingVertical: hp(2),
        paddingHorizontal: wp(12),
        borderRadius: hp(1.5),
        alignItems: "center",
    },
});