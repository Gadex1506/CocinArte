
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useFonts } from 'expo-font';

export default function ObjectDetection() {
    const [image, setImage] = useState(null);
    const [textDetected, setTextDetected] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);

    const animation = new useRef(null);

    const navigation = useNavigation();

    {/* Exportacion de fuente Nunito */}
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    // Pedir permiso de cámara al iniciar
    React.useEffect(() => {
        (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        })();
    }, []);

    // Función para abrir la galería y seleccionar una imagen
    const pickImage = async () => {

        setIsProcessing(true); // Oculta todo inmediatamente antes de abrir la galería

        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.Images,
        allowsEditing: true,
        base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            analyzeImage(result.assets[0].base64);
        } else {
            setIsProcessing(false); // Si el usuario cancela, mostramos los elementos de nuevo
        }
    };

    // Función para capturar una imagen con la cámara
    const takePicture = async () => {

        setIsProcessing(true); // Oculta todo inmediatamente antes de abrir la galería

        let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            analyzeImage(result.assets[0].base64);
        }else {
            setIsProcessing(false); // Si el usuario cancela, mostramos los elementos de nuevo
        }
    };

    // Enviar la imagen a Google Cloud Vision
    const analyzeImage = async (base64Image) => {
        const API_KEY = 'AIzaSyDYLIaALM-jXH-LXu7JhrbTV0sVSnqigGI'; // API de Google Cloud Vision

        try {
            const response = await axios.post(
                `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
                {
                requests: [
                    {
                    image: { content: base64Image },
                    features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
                    },
                ],
                }
            );

            const labels = response.data.responses[0].labelAnnotations;
            const detectedText = labels.map(label => label.description).join(', ');

            setTextDetected(detectedText);
        } catch (error) {
            console.error('Error al analizar la imagen:', error);
            setTextDetected('Error al procesar la imagen');
        }

        setIsProcessing(false); // Mostramos los elementos de nuevo
    };

    return (
        <View style={styles.container}>

            <StatusBar style='light'/>

            {/* Boton de regresar */}
            <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.atras} >
                <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" right={1.5} />
            </TouchableOpacity>

            {/* Lottie Imagen de Comida Pasando */}
            {!isProcessing && textDetected == '' && (
                <>
                    <View>
                        <LottieView
                            autoPlay
                            speed={0.5}
                            ref={animation}
                            style={styles.foodStyle}
                            source={require("../../assets/lottie/FoodsDifferent.json")}
                        />
                    </View>
                </>
            )}

            {/* Texto de contexto de la pantalla */}
            {!isProcessing && textDetected == '' && (
                <>
                    <Text style={styles.title}>¡Bienvenido a la <Text style={styles.subtitle}>detección de alimentos</Text> por cámara!</Text>
                </>
            )}

            {/* Imagen de la foto tomada */}
            {textDetected && image && <Image source={{ uri: image }} style={styles.image} />}

            {/* Boton de Tomar Foto */}
            {!isProcessing && textDetected == '' && (
                <>

                    <TouchableOpacity style={styles.photobutton} onPress={takePicture}>
                        <Text style={styles.buttonText}>Tomar Foto</Text>
                    </TouchableOpacity>

                    {/* Boton de seleccionar Imagen */}
                    <TouchableOpacity style={styles.selectphotobutton} onPress={pickImage}>
                        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
                    </TouchableOpacity>

                </>

            )}

            {/* Texto de tu resultado es */}
            {textDetected != '' && <Text style={styles.resultTitle}>Tu resultado es:</Text>}

            {/* Texto que muestra el resultado de la imagen*/}
            {textDetected != '' && <Text style={styles.result}>{textDetected}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202020',
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodStyle: {
        width: wp(75),
        height: hp(75),
        bottom: 70,
    },
    atras: {
        position: "absolute",
        backgroundColor: "white",
        width: 45,
        height: 45,
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
        right: "82%",
        top: 50,
    },
    title: {
        position: "absolute",
        color: "#fff",
        fontSize: 25,
        fontFamily: "Nunito-Bold",
        margin: 20,
        paddingHorizontal: 20,
        textAlign: "center",
        top: hp(62),
    },
    subtitle: {
        color: "#ff5c2e",
    },
    image: {
        position: "absolute",
        width: 300,
        height: 300,
        marginBottom: 20,
        borderRadius: 10,
        top: 190,
    },
    photobutton: {
        position: "absolute",
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        bottom: hp(19),
    },
    selectphotobutton: {
        position: "absolute",
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        bottom: hp(12),
    },
    buttonText: {
        color: '#202020',
        fontFamily: "Nunito-Bold",
        fontSize: 16,
    },
    resultTitle: {
        position: "absolute",
        fontFamily: "Nunito-ExtraBold",
        color: "#ff5c2e",
        top: hp(65),
        fontSize: 25,
    },
    result: {
        fontFamily: "Nunito-Medium",
        marginTop: 20,
        paddingHorizontal: 50,
        fontSize: 16,
        textAlign: 'center',
        color: '#fff',
        top: hp(22),
    },
});