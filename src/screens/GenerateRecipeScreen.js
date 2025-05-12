import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { GOOGLE_GEMINI_API_KEY } from '@env';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Importar el componente RecipeImage
import RecipeImage from '../components/RecipeImage';

// Importar la biblioteca de Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// API KEY de Google Gemini
const API_KEY = GOOGLE_GEMINI_API_KEY;

// Inicializa el modelo de Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export default function GenerateRecipe() {
    const route = useRoute();

    // Corroborar de que 'ingredients' existe y es un array
    const ingredients = Array.isArray(route.params?.ingredients) ? route.params.ingredients : [];

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Exportación de fuente Nunito
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    // Función para generar la receta con Gemini
    const generateRecipeWithGemini = async (ingredientsList) => {
        if (!ingredientsList || ingredientsList.length === 0) {
            return {
                title: "Sin Ingredientes",
                description: "No se proporcionaron ingredientes para generar una receta.",
                ingredients: [],
                instructions: [],
                image_prompt: "No hay ingredientes para generar una imagen."
            };
        }

        const ingredientsString = ingredientsList.join(", ");

        const prompt = `Genera una receta de cocina detallada basada en los siguientes ingredientes: ${ingredientsString}.
        La receta debe incluir un nombre atractivo, una lista de ingredientes (puedes añadir algunos comunes si son necesarios y lógicos para la receta) con su cantidad especificada, y un paso a paso claro y numerado.

        La respuesta debe ser ÚNICAMENTE un objeto JSON con la siguiente estructura:
        {
            "title": "Nombre de la receta generada",
            "ingredients": [
                { "name": "Nombre del ingrediente 1", "quantity": "Cantidad del ingrediente 1" },
                { "name": "Nombre del ingrediente 2", "quantity": "Cantidad del ingrediente 2" },
                // ... más ingredientes
            ],
            "instructions": [
                "Paso 1 de la preparación",
                "Paso 2 de la preparación",
                "...Paso n de la preparación"
            ]
        }

        Asegúrate de que la respuesta sea un JSON válido y completo, sin texto adicional antes o después del objeto JSON.`;

        try {
            const result = await geminiModel.generateContent(prompt);
            const responseText = result.response.text();
            console.log("Respuesta cruda de Gemini:", responseText);

            let recipeData = null;
            try {

                recipeData = JSON.parse(responseText);

            } catch (parseError) {

                console.warn("Fallo el parseo directo, intentando extraer JSON:", parseError);

                const start = responseText.indexOf('{');
                const end = responseText.lastIndexOf('}');

                if (start >= 0 && end > start) {
                    const jsonString = responseText.substring(start, end + 1);
                    try {
                        recipeData = JSON.parse(jsonString);
                        console.log("JSON extraído y parseado con éxito.");
                    } catch (e) {
                        console.error("Error al parsear JSON extraído:", e);
                        throw new Error("Error al procesar la respuesta de la API. El formato no es válido.");
                    }

                } else {

                    console.error("No se encontró JSON válido en la respuesta.");
                    throw new Error("La API no devolvió un formato de receta válido.");

                }
            }

            // Se valida la estructura de ingredientes
            if (recipeData && recipeData.title && Array.isArray(recipeData.ingredients) && Array.isArray(recipeData.instructions)) {

                // Se verifica que cada ingrediente sea un objeto con 'name' y 'quantity'
                const ingredientsAreObjects = recipeData.ingredients.every(ingredient =>
                    typeof ingredient === 'object' && ingredient !== null && 'name' in ingredient && 'quantity' in ingredient
                );

                if (ingredientsAreObjects) {
                    return {
                        ...recipeData,
                        image_prompt: recipeData.image_prompt || "No hay prompt generado"
                    };
                } else {
                    console.error("La estructura de ingredientes no es la esperada (array de objetos con name y quantity):", recipeData.ingredients);
                    throw new Error("La API devolvió un JSON, pero la lista de ingredientes no tiene el formato esperado.");
                }

            } else {
                console.error("El JSON parseado no tiene la estructura esperada (title, ingredients, instructions):", recipeData);
                throw new Error("La API devolvió un JSON, pero no tiene el formato de receta esperado (faltan title, ingredients o instructions).");
            }

        } catch (apiError) {

            console.error("Error al llamar a la API de Gemini:", apiError);

            let errorMessage = "Ocurrió un error al generar la receta. Por favor, intenta de nuevo.";

            if (apiError.message.includes("API key invalid")) {
                errorMessage = "Error de Gemini: La API Key no es válida o no está configurada correctamente.";
            } else if (apiError.message.includes("quota")) {
                errorMessage = "Error de Gemini: Se ha excedido la cuota de uso. Intenta más tarde.";
            } else {
                errorMessage = `Error de Gemini: ${apiError.message}`;
            }
            
            throw new Error(errorMessage); // Propagar el error para que sea manejado en el useEffect
        }
    };

    useEffect(() => {
        const processRecipe = async () => {
            setRecipe(null);
            setError(null);

            if (!ingredients || ingredients.length === 0) {
                setRecipe({
                    title: "Sin Ingredientes",
                    description: "No se proporcionaron ingredientes para generar una receta.",
                    ingredients: [], instructions: [], image_prompt: "No hay ingredientes."
                });
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const generatedRecipe = await generateRecipeWithGemini(ingredients);
                setRecipe(generatedRecipe);
            } catch (err) {
                console.error("Error en el proceso de receta:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (fontsLoaded) {
            processRecipe();
        }

    }, [ingredients, fontsLoaded]);

    const cleanInstructionText = (text) => {
        return text.replace(/^\s*[\d]+\.?\s*[\)\.]?\s*-?\s*/, '');
    };

    if (loading || !fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.title}>
                    {fontsLoaded ? "Generando Receta..." : "Cargando..."}
                    </Text>
                <ActivityIndicator size="large" color="#f3a006" style={styles.loading} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={[styles.title, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>Error</Text>
                <Text style={[styles.noRecipeText, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>{error}</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.noRecipeContainer}>
                <Text style={[styles.title, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>Generar Receta</Text>
                <Text style={[styles.noRecipeText, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>No se ha generado ninguna receta aún. Asegúrate de pasar ingredientes válidos.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* Se usa el componente RecipeImage para manejar la imagen */}
            {/* Se pasa el título de la receta y fontsLoaded como props */}
            {recipe.title && recipe.title !== "Sin Ingredientes" && (
                <View style={styles.imageContainer}>
                    <RecipeImage
                        recipeTitle={recipe.title}
                        fontsLoaded={fontsLoaded}
                    />
                </View>
            )}

            <View style={styles.detailsContainer}>
                <Text style={[styles.recipeTitle, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>{recipe.title}</Text>

                {/* Ingredientes y cantidades */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        <View style={styles.ingredientsTable}>
                            {/* Encabezados de la tabla */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>Ingrediente</Text>
                                <Text style={[styles.tableHeaderText, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>Cantidad</Text>
                            </View>
                            {/* Filas de ingredientes */}
                            {recipe.ingredients.map((ingredient, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>{ingredient.name}</Text>
                                    <Text style={[styles.tableCell, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>{ingredient.quantity}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.noData, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>No hay ingredientes disponibles.</Text>
                    )}
                </View>

                {/* Instrucciones */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Instrucciones</Text>
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                        recipe.instructions.map((instruction, index) => (
                            <View key={index} style={styles.instructionStep}>
                                <Text style={[styles.stepNumber, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>{index + 1}. </Text>
                                <Text style={[styles.instructionText, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>{cleanInstructionText(instruction)}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.noData, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>No hay instrucciones disponibles.</Text>
                    )}
                </View>

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
    loadingContainer: {
        flex: 1,
        backgroundColor: '#202020',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#202020',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noRecipeContainer: {
        flex: 1,
        backgroundColor: '#202020',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollViewContainer: {
        flexGrow: 1,
        backgroundColor: "#202020",
        paddingBottom: hp(5),
    },
    imageContainer: {
        width: '100%',
        height: hp(40),
        marginBottom: hp(2),
    },
    detailsContainer: {
        paddingHorizontal: wp(4), 
    },
    recipeTitle: {
        fontSize: hp(3.5),
        color: "white",
        textAlign: "center",
        marginBottom: hp(1.5),
    },
    sectionContainer: {
        marginTop: hp(3),
    },
    sectionTitle: {
        fontSize: hp(2.5),
        fontFamily: 'Nunito-ExtraBold',
        color: '#f3a006',
        marginBottom: hp(1.5),
    },
    ingredientsTable: {
        backgroundColor: '#333333',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#444444',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#444444',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#555555',
    },
    tableHeaderText: {
        flex: 1,
        textAlign: 'center',
        fontSize: hp(1.8),
        color: '#f3a006',
        fontFamily: "Nunito-Bold",
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#444444',
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: hp(1.7),
        color: "#b0b0b0",
        fontFamily: "Nunito-Regular",
        paddingHorizontal: wp(1),
    },
    instructionStep: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: hp(1.5),
    },
    stepNumber: {
        marginRight: wp(2),
        fontSize: hp(1.8),
        color: "#f3a006",
        fontFamily: "Nunito-Bold",
    },
    instructionText: {
        flex: 1,
        fontSize: hp(1.8),
        textAlign: "justify",
        color: "#fff",
        lineHeight: hp(2.5),
        fontFamily: "Nunito-Regular",
    },
    loading: {
        marginTop: hp(2),
    },
    noRecipeText: {
        color: '#fff',
        fontSize: hp(1.8),
        textAlign: 'center',
        marginTop: hp(2),
    },
    noData: {
        color: '#aaa',
        fontSize: hp(1.8),
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: hp(1),
    },
    title: {
        fontFamily: 'Nunito-ExtraBold',
        color: '#f3a006',
        fontSize: 30,
    },
});