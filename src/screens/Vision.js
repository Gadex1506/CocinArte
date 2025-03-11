
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ObjectDetection() {
    const [image, setImage] = useState(null);
    const [textDetected, setTextDetected] = useState('');
    const [hasPermission, setHasPermission] = useState(null);

    // Pedir permiso de cámara al iniciar
    React.useEffect(() => {
        (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        })();
    }, []);

    // Función para abrir la galería y seleccionar una imagen
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        });

        if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeImage(result.assets[0].base64);
        }
    };

    // Función para capturar una imagen con la cámara
    const takePicture = async () => {
        let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        base64: true,
        });

        if (!result.canceled) {
        setImage(result.assets[0].uri);
        analyzeImage(result.assets[0].base64);
        }
    };

    // Enviar la imagen a Google Cloud Vision
    const analyzeImage = async (base64Image) => {
        const API_KEY = 'AIzaSyDYLIaALM-jXH-LXu7JhrbTV0sVSnqigGI'; // Reemplázalo con tu API KEY

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
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Google Cloud Vision App</Text>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.buttonText}>Tomar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>

        <Text style={styles.result}>{textDetected}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    result: {
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
    },
});