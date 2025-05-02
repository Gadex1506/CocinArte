import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useFonts } from 'expo-font';

// Importa la biblioteca de Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Clave de la API de Gemini
const API_KEY = "AIzaSyCkQUQd-9Jje4I0RDAK07wq6uSmOk259yQ" // Reemplaza con tu API key real

// Inicializa el modelo de Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default function GenerateRecipe() {
    const route = useRoute();
    const { ingredients } = route.params;
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    useEffect(() => {
        const generateRecipe = async () => {
            if (!ingredients || ingredients.length === 0) {
                setRecipe({
                    title: "Sin Ingredientes",
                    description: "No se proporcionaron ingredientes para generar una receta.",
                });
                return;
            }

            setLoading(true);
            const ingredientsString = ingredients.join(", ");
            const prompt = `Genera una receta de cocina basada en los siguientes ingredientes: ${ingredientsString}.

                    La respuesta debe tener el siguiente formato JSON:
                    {
                        "title": "Nombre de la receta",
                        "ingredients": [
                            "Ingrediente 1",
                            "Ingrediente 2",
                            "...Ingrediente n"
                        ],
                        "instructions": [
                            "Descripción del paso 1",
                            "Descripción del paso 2",
                            "Descripción del paso n"
                        ],
                        "image_prompt": "Descripción para generar una imagen de la receta"
                    }

                    Solo devuelve el JSON, sin texto adicional.`;

            try {
                const result = await model.generateContent([prompt]);
                const response = result.response;
                let responseText = response.text();

                // Intenta extraer el JSON de la respuesta
                try {
                    const recipeData = JSON.parse(responseText);
                    setRecipe(recipeData);
                } catch (parseError) {
                    // Si el parseo directo falla, busca el inicio y el final del JSON
                    const start = responseText.indexOf('{');
                    const end = responseText.lastIndexOf('}');
                    if (start >= 0 && end > start) {
                        responseText = responseText.substring(start, end + 1);
                        try {
                            const recipeData = JSON.parse(responseText);
                            setRecipe(recipeData);
                        } catch (e) {
                            console.error("Error al parsear JSON extraído:", e);
                            setRecipe({
                                title: "Error al procesar respuesta",
                                description: "No se pudo entender la respuesta de la API.",
                            });
                        }
                    } else {
                        console.error("No se encontró JSON válido en la respuesta:", parseError);
                        setRecipe({
                            title: "Error en la respuesta",
                            description: "La API no devolvió una respuesta válida.",
                        });
                    }
                }

            } catch (error) {
                console.error("Error al generar la receta:", error);
                setRecipe({
                    title: "Error",
                    description: "No se pudo generar la receta. Por favor, intenta de nuevo.",
                });
            } finally {
                setLoading(false);
            }
        };

        generateRecipe();
    }, [ingredients]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Generando Receta...</Text>
                <ActivityIndicator size="large" color="#ff5c2e" style={styles.loading} />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Generar Receta</Text>
                <Text style={styles.noRecipeText}>No se ha generado ninguna receta aún.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.title}>{recipe.image_prompt}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredientes:</Text>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ingredient, index) => (
                        <Text key={index} style={styles.listItem}>
                            {index + 1}. {ingredient}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.noData}>No hay ingredientes disponibles.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instrucciones:</Text>
                {recipe.instructions && recipe.instructions.length > 0 ? (
                    recipe.instructions.map((instruction, index) => (
                        <Text key={index} style={styles.listItem}>
                            {index + 1}. {instruction}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.noData}>No hay instrucciones disponibles.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202020',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff5c2e',
        marginBottom: 20,
        fontFamily: 'Nunito-ExtraBold',
        textAlign: 'center'
    },
    content: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 10,
        minHeight: 200,
    },
    recipeText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Nunito-Regular'
    },
    loading: {
        marginTop: 20,
    },
    noRecipeText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'Nunito-Regular'
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff5c2e',
        marginBottom: 10,
        fontFamily: 'Nunito-SemiBold'
    },
    listItem: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'Nunito-Regular'
    },
    noData: {
        color: '#aaa',
        fontSize: 16,
        fontFamily: 'Nunito-Regular'
    }
});