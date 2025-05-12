import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const HF_API_KEY = ''; 
const HF_MODEL_URL = `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev`; // URL del modelo de Hugging Face

export default function RecipeImage({ recipeTitle, fontsLoaded }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(null);

    // Función para generar la imagen con Hugging Face
    const generateImageWithHF = async (title) => {
        if (!title || title === "Sin Ingredientes") { 
            console.warn("No hay título de receta válido para generar la imagen.");
            setImageUrl(null);
            setImageLoading(false);
            setImageError(null);
            return;
        }

        setImageLoading(true); // Iniciar carga de imagen
        setImageUrl(null); // Limpiar imagen anterior al iniciar una nueva generación
        setImageError(null); // Limpiar errores anteriores

        const imagePrompt = `${title}, food photography, detailed, appetizing`;
        console.log("Intentando generar imagen con prompt basado en título:", imagePrompt); // prompt de imagen

        try {
            const response = await fetch(HF_MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`, // Clave de API de Hugging Face
                    "Content-Type": "application/json",
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: imagePrompt, // Usar el prompt
                    // parameters: { width: 512, height: 512 }
                }),
            });

            console.log("Respuesta de Hugging Face:", response.status); // Estado de la respuesta

            if (!response.ok) {
                // Leer el error del cuerpo de la respuesta si no es exitosa
                const errorBody = await response.json();
                console.error("Error en la respuesta de Hugging Face:", errorBody);
                throw new Error(`Error de Hugging Face: ${response.status} - ${errorBody.error || response.statusText}`);
            }

            // Si la respuesta es exitosa, obtener el Blob
            const imageBlob = await response.blob();
            console.log("Blob de imagen recibido:", imageBlob);

            // Convertir el Blob a una Data URL para usar en React Native Image
            const reader = new FileReader();
            reader.readAsDataURL(imageBlob);

            // Devuelve una promesa que se resuelve cuando la conversión está completa
            const dataUrl = await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    console.log("Data URL generada:", reader.result ? `${reader.result.substring(0, 50)}...` : 'Vacía'); // Estado parcial de la URL
                    resolve(reader.result); // Resuelve la promesa con la Data URL
                };
                reader.onerror = reject; // Rechaza la promesa si hay un error
            });

            setImageUrl(dataUrl); // Establecer la URL de la imagen en el estado local

        } catch (apiError) {

            console.error("Error al llamar a la API de Hugging Face:", apiError);
            let errorMessage = "Ocurrió un error al generar la imagen.";
            errorMessage = `Error de Generación de Imagen: ${apiError.message}`;
            setImageError(errorMessage);
            setImageUrl(null);

        } finally {
            setImageLoading(false);
        }
    };

    // useEffect para llamar a generateImageWithHF cuando el recipeTitle cambie
    useEffect(() => {

        // Intentar generar la imagen si el recipeTitle es válido y las fuentes han cargado
        if (recipeTitle && recipeTitle !== "Sin Ingredientes" && fontsLoaded) {

            generateImageWithHF(recipeTitle);

        } else if (recipeTitle === "Sin Ingredientes") {
            
            setImageUrl(null);
            setImageLoading(false);
            setImageError(null);
        }
    }, [recipeTitle, fontsLoaded]); // Dependencia del recipeTitle y fontsLoaded

    return (
        <View style={styles.imageContainer}> {/* Contenedor para la imagen */}
            {imageLoading ? (
                // Muestra el indicador de carga de la imagen si imageLoading es true
                <ActivityIndicator size="large" color="#ff5c2e" />

            ) : imageError ? (

                // Muestra el mensaje de error al generar la imagen
                <Text style={[styles.noData, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System', textAlign: 'center' }]}>
                    {imageError}
                </Text>

            ) : imageUrl ? (

                // Si se generó una URL de imagen (Data URL), muestra el componente Image
                <Image
                    source={{ uri: imageUrl }} // Usar la Data URL como source
                    style={styles.recipeImage} // Usar el estilo de imagen
                    resizeMode="cover" // Ajusta la imagen para cubrir el área
                    onError={(e) => console.error("Error cargando imagen:", e.nativeEvent.error)} // Manejo de error de carga de imagen
                />

            ) : (

                // Muestra un mensaje si no hay imagen o título válido para generar
                <Text style={[styles.noData, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System', textAlign: 'center' }]}>
                    {recipeTitle && recipeTitle !== "Sin Ingredientes" ? "Generando imagen..." : "Esperando título de receta..."}
                </Text>

            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Estilo para el contenedor de la imagen
    imageContainer: {
        width: '100%',
        height: hp(40),
        position: 'relative',
        backgroundColor: '#333',
        borderBottomLeftRadius: 30, // Bordes redondeados en la parte inferior
        borderBottomRightRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    // Estilo para la imagen generada cuando se carga
    recipeImage: {
        width: '100%',
        height: '100%',
        borderBottomLeftRadius: 30, // Bordes redondeados en la parte inferior
        borderBottomRightRadius: 30,
    },
    noData: {
        color: '#aaa',
        fontSize: 16,
        fontStyle: 'italic',
    }
});
