
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, TextInput, FlatList } from 'react-native';
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
import { PAT_CLARIFAI, USER_ID_CLARIFAI } from '@env';

export default function ObjectDetection() {
    //const [image, setImage] = useState(null);
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
            /*setImage(result.assets[0].uri);
            analyzeImage(result.assets[0].base64);*/
            const uri = result.assets[0].uri;
            const base64 = result.assets[0].base64;
            analyzeImage(base64, uri);
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
            /*setImage(result.assets[0].uri);
            analyzeImage(result.assets[0].base64);*/
            const uri = result.assets[0].uri;
            const base64 = result.assets[0].base64;
            analyzeImage(base64, uri);
        }else {
            setIsProcessing(false); // Si el usuario cancela, mostramos los elementos de nuevo
        }
    };

    // Analisis y reconocimiento de ingredientes con Clarifai 
    const analyzeImage = async (base64Image, imageUri) => {
        const PAT = PAT_CLARIFAI; // Personal Access Token
        const USER_ID = USER_ID_CLARIFAI; // User ID de Clarifai
        const APP_ID = 'main'; // App ID en Clarifai
        const MODEL_ID = 'food-item-v1-recognition';
        const MODEL_VERSION_ID = 'dfebc169854e429086aceb8368662641'; // Versión pública del modelo
        const url = `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`;

        const data = {
            user_app_id: {
                user_id: USER_ID,
                app_id: APP_ID,
            },
            inputs: [
                {
                    data: {
                        image: {
                            base64: base64Image,
                        },
                    },
                },
            ],
            model: {
                output_info: {
                    output_config: {
                        max_concepts: 12, // Limita a los 10 mejores resultados
                        //min_value: 0.2  // Solo conceptos con 20% o más de certeza
                    },
                },
            },
        };

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Key ${PAT}`,
                    'Content-Type': 'application/json',
                },
            });

            const concepts = response.data.outputs[0].data.concepts;
            const detectedLabels = concepts.map(item => item.name);

            setIsProcessing(false);
            navigation.navigate('ResultScreen', {
                image: imageUri,
                initialIngredients: detectedLabels,
            });

        } catch (error) {
            console.error('Error con Clarifai API:', error?.response?.data || error.message);
            //setTextDetected('Error al procesar con Clarifai');
        }

        //setIsProcessing(false);
    };

    return (
        <View style={styles.container}>

            <StatusBar style='light'/>

            {/* Boton de regresar */}
            <TouchableOpacity onPress={() => navigation.navigate('MainApp', { screen: 'Home' })} style={styles.atras} >
                <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#f3a006" right={1.5} />
            </TouchableOpacity>

            {/* Lottie Imagen de Comida Pasando */}
            {!isProcessing /*&& textDetected == ''*/ && (
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
            {!isProcessing /*&& textDetected == ''*/ && (
                <>
                    <Text style={styles.title}>¡Bienvenido a la <Text style={styles.subtitle}>detección de alimentos</Text> por cámara!</Text>
                </>
            )}

            {/* Boton de Tomar Foto */}
            {!isProcessing /*&& textDetected == ''*/ && (
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
            {/*textDetected != '' && <Text style={styles.resultTitle}>Tu resultado es:</Text>*/}

            {/* Texto que muestra el resultado de la imagen*/}
            {/*textDetected != '' && <Text style={styles.result}>{textDetected}</Text>*/}
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
        color: "#f3a006",
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
        backgroundColor: '#f3a006',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        bottom: hp(18),
    },
    selectphotobutton: {
        position: "absolute",
        backgroundColor: '#f3a006',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        bottom: hp(11),
    },
    buttonText: {
        color: '#fff',
        fontFamily: "Nunito-ExtraBold",
        padding: hp(0.5),
        fontSize: 18,
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
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        width: wp(80),
    },
    ingredientText: {
        color: '#fff',
        fontFamily: "Nunito-Medium",
        fontSize: 16,
    },
    removeButton: {
        color: '#ff5c2e',
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#444',
        color: 'white',
        borderRadius: 8,
        padding: 10,
        width: wp(80),
        marginTop: 15,
        fontFamily: 'Nunito-Regular',
    },
});