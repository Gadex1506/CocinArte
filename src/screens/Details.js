import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"; // Importar Dimensions
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon, PaperAirplaneIcon} from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import CachedImage from "react-native-expo-cached-image";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FlashList } from "@shopify/flash-list";
import YoutubeIframe from 'react-native-youtube-iframe';
import { useFavorites } from "../context/FavoriteContext";
import { useFonts } from 'expo-font';
import { GOOGLE_TRANSLATION_API } from '@env';

const { width } = Dimensions.get('window'); // Obtiene el ancho de la ventana

export default function Details(props) {

    let item = props.route.params;

    // Exportación de fuente Nunito
    const [fontsLoaded] = useFonts({
      'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
      'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
      'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
      'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
      'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { favorites, addFavorite, removeFavorite } = useFavorites(); // Obtener funciones del contexto

    // Verifica si la receta ya está en favoritos
    const isFavorite = favorites.some((fav) => fav.idMeal === item.idMeal);

    // Estados para la traducción
    const [translatedIngredients, setTranslatedIngredients] = useState([]);
    const [translatedMeasures, setTranslatedMeasures] = useState([]);
    const [translatedInstructions, setTranslatedInstructions] = useState([]); // Cambiado a array

    // Obtiene los índices de los ingredientes con valor
    const getIngredientIndexes = (meal) => {
        if(!meal) return[];
        let index = [];
        for (let i = 1; i<=20; i++){
            if(meal['strIngredient'+i]){
                index.push(i);
            }
        }
        return index;
    }

    useEffect(() => {
      getMealData(item.idMeal);
    }, []);

    // Maneja la acción de añadir/eliminar de favoritos
    const handleFavoriteToggle = () => {
        if (isFavorite) {
            removeFavorite(item.idMeal);
        } else {
            addFavorite(meal);
        }
    };

    // Obtiene los datos completos de la receta
    const getMealData = async (id) => {
      try {
          const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
          if(response && response.data && response.data.meals){
              const mealData = response.data.meals[0];
              setMeal(mealData);
              // Inicia la traducción una vez que se obtienen los datos
              translateIngredients(mealData);
              translateMeasures(mealData);
              translateInstructions(mealData.strInstructions);
              setLoading(false);
          } else {
              setLoading(false); // Maneja el caso de no encontrar datos
          }
      } catch (error) {
          console.log('Error al obtener datos de la receta: ', error.message);
          setLoading(false); // Asegura que el estado de carga se desactive
      }
    };

    // Consume la API de Google Translate
    const translateText = async (text) => {
      const API_KEY = GOOGLE_TRANSLATION_API;
      const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

      try {
        const response = await axios.post(url, {
          q: text,
          target: "es", // Traducir a español
        });
        return response.data.data.translations[0].translatedText;
      } catch (error) {
        console.log("Error en la traducción: " + error.message);
        return text; // Retorna el texto original en caso de error
      }
    };

    // Traduce la lista de ingredientes
    const translateIngredients = async (meal) => {
      const ingredients = getIngredientIndexes(meal).map(i => meal["strIngredient" + i]);
      const translations = await Promise.all(ingredients.map(translateText));
      setTranslatedIngredients(translations);
    };

    // Traduce la lista de medidas
    const translateMeasures = async (meal) => {
      const measures = getIngredientIndexes(meal).map(i => meal["strMeasure" + i]);
      const translations = await Promise.all(measures.map(translateText));
      setTranslatedMeasures(translations);
    };

    // Traduce las instrucciones y las divide en pasos
    const translateInstructions = async (instructions) => {
      if (!instructions) return; // Maneja instrucciones vacías
      const translatedText = await translateText(instructions);

      // Divide las instrucciones por punto y espacio, filtrando líneas vacías
      const instruccionesArray = translatedText.split(". ").filter(line => line.trim() !== "");
      setTranslatedInstructions(instruccionesArray);
    };

    // Extrae el ID de video de YouTube de una URL
    const getYoutubeVideoId = (url) => {
      if (!url) return null; // Maneja URL vacía
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    // Muestra un indicador de carga mientras se obtienen los datos
    if (loading || !fontsLoaded) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#ff5c2e" />
            </View>
        );
    }

    // Renderiza la pantalla de detalles
    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* Imagen de la receta */}
            <View style={styles.imageContainer}>
                <CachedImage
                    source={{ uri: item.strMealThumb }}
                    sharedTransitionTag={item.strMeal}
                    style={styles.image}
                />
                 {/* Botón de atrás */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" />
                </TouchableOpacity>
                {/* Botón de favoritos */}
                <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteButton}>
                    <HeartIcon size={hp(3.5)} color={isFavorite ? "red" : "gray"} />
                </TouchableOpacity>
                 {/* Botón de compartir */}
                 <TouchableOpacity
                     onPress={() => navigation.navigate('Friends', {
                         receta: {
                             idMeal: meal.idMeal,
                             strMeal: meal.strMeal,
                             strMealThumb: meal.strMealThumb,
                             strCategory: meal.strCategory,
                         }
                     })}
                     style={styles.shareButton}
                 >
                     <PaperAirplaneIcon size={hp(3.5)} strokeWidth={2} color="#ff5c2e" />
                 </TouchableOpacity>
            </View>

            {/* Información de la receta */}
            <View style={styles.detailsContainer}>
                {/* Título de la receta */}
                <Text style={styles.recipeTitle}>{meal.strMeal}</Text>

                {/* Categoría */}
                 {meal.strCategory && (
                     <Text style={styles.categoryText}>Categoría: {meal.strCategory}</Text>
                 )}


                {/* Ingredientes y cantidades */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    <View style={styles.ingredientsTable}>
                        {/* Encabezado de la tabla */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Ingrediente</Text>
                            <Text style={styles.tableHeaderText}>Cantidad</Text>
                        </View>
                        {/* Lista de ingredientes y medidas */}
                        <FlashList
                            data={getIngredientIndexes(meal)}
                            keyExtractor={(index) => index.toString()}
                            renderItem={({ item: index }) => (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{translatedIngredients[index - 1] || meal['strIngredient' + index] || '-'}</Text>
                                    <Text style={styles.tableCell}>{translatedMeasures[index - 1] || meal['strMeasure' + index] || '-'}</Text>
                                </View>
                            )}
                            estimatedItemSize={40} // Ajusta según el tamaño promedio de tus filas
                            scrollEnabled={false} // Deshabilita el scroll interno si la lista es corta
                        />
                    </View>
                </View>

                {/* Instrucciones */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Instrucciones</Text>
                    {
                        translatedInstructions.length > 0 ? (
                            translatedInstructions.map((line, index) => (
                                <View key={index} style={styles.instructionStep}>
                                    <Text style={styles.stepNumber}>{index + 1}. </Text>
                                    <Text style={styles.instructionText}>{line}.</Text>
                                </View>
                            ))
                        ) : (
                            // Muestra un indicador si las instrucciones aún no se han traducido
                            <ActivityIndicator size="small" color="#ff5c2e" />
                        )
                    }
                </View>

                {/* Video Tutorial */}
                {
                    meal.strYoutube && getYoutubeVideoId(meal.strYoutube) && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Video Tutorial</Text>
                            <View style={styles.videoContainer}>
                                <YoutubeIframe
                                    videoId={getYoutubeVideoId(meal.strYoutube)}
                                    height={hp(25)}
                                    width={width * 0.9} // Ajusta el ancho del video al 90% del ancho de la pantalla
                                    play={false} // Opcional: para no iniciar automáticamente
                                />
                            </View>
                        </View>
                    )
                }

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1, // Permite que el contenido crezca y se desplace
        backgroundColor: "#202020", // Fondo oscuro
        paddingBottom: hp(5), // Espacio al final del scroll
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#202020", // Fondo oscuro para el loader
    },
    imageContainer: {
        width: '100%',
        height: hp(40), // Altura de la imagen
        position: 'relative', // Permite posicionar elementos absolutos dentro
    },
    image: {
        width: '100%',
        height: '100%',
        borderBottomLeftRadius: 30, // Bordes redondeados en la parte inferior
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: 'absolute',
        top: hp(5), // Ajusta la posición desde arriba
        left: wp(4), // Ajusta la posición desde la izquierda
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semi-transparente
        padding: wp(2),
        borderRadius: 9999, // Borde completamente redondo
    },
    favoriteButton: {
        position: 'absolute',
        top: hp(5), // Ajusta la posición desde arriba
        right: wp(4), // Ajusta la posición desde la derecha
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semi-transparente
        padding: wp(2),
        borderRadius: 9999, // Borde completamente redondo
    },
     shareButton: {
        position: 'absolute',
        top: hp(12), // Posicionado debajo del botón de favoritos
        right: wp(4),
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semi-transparente
        padding: wp(2),
        borderRadius: 9999,
    },
    detailsContainer: {
        paddingHorizontal: wp(4), // Padding a los lados
        marginTop: hp(2), // Espacio arriba de los detalles
    },
    recipeTitle: {
        fontSize: hp(3.5), // Tamaño del título
        fontFamily: "Nunito-ExtraBold",
        color: "white",
        textAlign: "center",
        marginBottom: hp(1.5), // Espacio debajo del título
    },
    categoryText: {
        fontSize: hp(2),
        fontFamily: "Nunito-SemiBold",
        color: "#ff5c2e", // Color naranja para la categoría
        textAlign: "center",
        marginBottom: hp(2),
    },
    sectionContainer: {
        marginTop: hp(3), // Espacio entre secciones
    },
    sectionTitle: {
        fontSize: hp(2.5), // Tamaño del título de sección
        fontFamily: "Nunito-Bold",
        color: "white",
        marginBottom: hp(1.5), // Espacio debajo del título de sección
    },
    ingredientsTable: {
        backgroundColor: '#333333', // Fondo oscuro para la tabla
        borderRadius: 10, // Bordes redondeados
        overflow: 'hidden', // Asegura que los bordes redondeados se apliquen correctamente
        borderWidth: 1, // Borde sutil
        borderColor: '#444444', // Color del borde sutil
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#444444', // Fondo ligeramente más claro para el encabezado de la tabla
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#555555', // Color del borde inferior del encabezado
    },
    tableHeaderText: {
        flex: 1,
        textAlign: 'center',
        fontSize: hp(1.8),
        color: '#ff5c2e', // Color naranja para el texto del encabezado
        fontFamily: "Nunito-Bold",
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#444444', // Color del borde entre filas
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: hp(1.7),
        color: "#b0b0b0", // Color gris claro para el texto de la celda
        fontFamily: "Nunito-Regular",
        paddingHorizontal: wp(1), // Pequeño padding horizontal en las celdas
    },
    instructionsContainer: {
         marginTop: hp(3), // Espacio arriba de las instrucciones
    },
    instructionStep: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: hp(1.5), // Espacio entre pasos
    },
    stepNumber: {
        marginRight: wp(2), // Espacio después del número
        fontSize: hp(1.8),
        color: "#ff5c2e", // Color naranja para el número del paso
        fontFamily: "Nunito-Bold",
    },
    instructionText: {
        flex: 1, // Permite que el texto ocupe el espacio restante y se ajuste
        fontSize: hp(1.8),
        textAlign: "justify",
        color: "#fff", // Color blanco para el texto de la instrucción
        lineHeight: hp(2.5), // Ajusta la altura de línea para mejor legibilidad
        fontFamily: "Nunito-Regular",
    },
    videoContainer: {
        marginTop: hp(1.5), // Espacio arriba del video
        alignItems: 'center', // Centra el video horizontalmente
    },
});
