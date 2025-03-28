import React, { useState, useEffect } from "react";
import { View, Text,  ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import CachedImage from "react-native-expo-cached-image";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FlashList } from "@shopify/flash-list";
import YoutubeIframe from 'react-native-youtube-iframe';
import { useFavorites } from "../context/FavoriteContext";
import { useFonts } from 'expo-font';

export default function Details(props) {

    let item = props.route.params;

    {/* Exportacion de fuente Nunito */}
    const [fontsLoaded] = useFonts({
      'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
      'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
      'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
      'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
      'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const navigation = useNavigation();
    const { favorites, addFavorite, removeFavorite } = useFavorites(); // Obtener funciones del contexto

    // Verificar si la receta ya está en favoritos
    const noLike = favorites.some((fav) => fav.idMeal === item.idMeal);

    // Funciones para la traduccion
    const [translatedIngredients, setTranslatedIngredients] = useState([]);
    const [translatedMeasures, setTranslatedMeasures] = useState([]);
    const [translatedInstructions, setTranslatedInstructions] = useState("");

    const indexIngredientes =(meal)=>{
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

        // Definicion del headlelike`
        const handleLike = () => {
          if (noLike) {
              removeFavorite(item.idMeal);
          } else {
              addFavorite(meal);
          }
      };

    const getMealData =  async (id = item.idMeal) => {
      try {
          const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
          //console.log('Obteniendo Recetas', response.data);
          if(response && response.data){
              setMeal(response.data.meals[0]);
              translateIngredients(response.data.meals[0]);
              translateMeasures(response.data.meals[0]);
              translateInstructions(response.data.meals[0].strInstructions);
              setLoading(false);
          }
      } catch (error) {
          console.log('error: ', error.message);
      }
    };

    //Metodo para consumir la API de google Translate
    const translateText = async (text) => {

      const apiKey = 'AIzaSyD8_zr5ysaD8JsnHGxhphwnHJpyLGHXwek'; // API de Google Translate
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

      try {
        const response = await axios.post(url, {
          q: text,
          target: "es",
        });

        return response.data.data.translations[0].translatedText;

      } catch (error) {
        console.log("Error en la traduccion: " + error.message);
        return text;
      }
    };

    //Metodo para traducir los ingredientes
    const translateIngredients = async (meal) => {
      const ingredients = indexIngredientes(meal).map(i => meal["strIngredient" + i]);
      const translations = await Promise.all(ingredients.map(translateText));
      setTranslatedIngredients(translations);
    };

    //Metodo para traducir las cantidades de los ingredientes
    const translateMeasures = async (measure) => {
      const measures = indexIngredientes(measure).map(i => measure["strMeasure" + i]);
      const translations = await Promise.all(measures.map(translateText));
      setTranslatedMeasures(translations);
    };

    // Método para traducir las instrucciones
    const translateInstructions = async (instructions) => {
      const translatedText = await translateText(instructions);

      const instruccionesArray = translatedText.split(". ").filter(line => line.trim() !== "");
      //console.log(instruccionesArray);

      setTranslatedInstructions(instruccionesArray);
    };

    //Metodo para cargar video de la receta
    const getYoutubeVideoId = (url) => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };


  return (

    <ScrollView  contentContainerStyle={styles.container}>
      {meal && (
        <View style={styles.card}>
          <Text style={styles.title}>{meal.strMeal}</Text>

          <View >
          <CachedImage source={{ uri: meal.strMealThumb }} sharedTransitionTag={meal.strMeal} style={styles.image} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.atras} >
                <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" right={1.5} />
            </TouchableOpacity>
            <TouchableOpacity  onPress={handleLike} style={styles.corazon}>
                <HeartIcon size={24} color={noLike ? "red" : "grey"} />
            </TouchableOpacity>
            </View>
            {/*Ingredientes y cantidades*/}
            <Text>
              
            </Text>

            <View style={styles.tableContainer}>
                {/* Encabezado de la tabla */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Ingredientes</Text>
                    <Text style={styles.headerText}>Medidas</Text>
                </View>

                {/* Lista de ingredientes y medidas */}
                <FlashList
                    data={indexIngredientes(meal)}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.row}>
                            <Text style={styles.cell}>{translatedIngredients[index] || meal['strIngredient' + item] || '-'}</Text>
                            <Text style={styles.cell}>{translatedMeasures[index] || meal['strMeasure' + item] || '-'}</Text>
                        </View>
                    )}
                    
                />
            </View>

            {/* Lista de Instrucciones */}
            <View style={styles.instructionsContainer}>
                <Text style={styles.subtitle}>Instrucciones</Text>
                {
                  translatedInstructions.length > 0 ? (
                    translatedInstructions.map((line, index) => (
                      <View key={index} style={styles.instructionTranslate}>
                        <Text style={styles.stepNumber}>{index + 1}. </Text>
                        <Text style={styles.instructionsText}>{line}.</Text> 
                      </View>

                      
                    ))
                  ) : (
                    <ActivityIndicator size="large" color="#ff5c2e" />
                  )
                }
            </View>

            {/* Video de la Receta */}
            {
              meal.strYoutube && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.subtitle}>Video Tutorial</Text>
                  <View>
                    <YoutubeIframe
                      videoId={getYoutubeVideoId(meal.strYoutube)}
                      //videoId='jCjSIhsOn2iNzf6t'
                      height={ hp(25) }
                    />
                  </View>
                </View>
              )
            }

        </View>
      )}


    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#202020"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  icono:{
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 110,
    width: wp("75"),
  },
  corazon: {
    position: "absolute",
    backgroundColor: "white",
    width: 45,
    height: 45,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    left: "82%",
    top: 10,
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
    top: 10,
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#202020",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 50,

    top: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Nunito-ExtraBold",
    textAlign: "center",
    marginBottom: 10,
    color: "white"
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    textAlign: "justify",
    fontFamily: "Nunito-Medium",
  },
  fetchButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  fetchButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Nunito-Medium",
  },
  tableContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#E2E2E2',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#ff5c2e',
    fontFamily: "Nunito-Bold",
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: "#F6F6F6",
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color:"grey",
    fontFamily: "Nunito-Semibold",
  },
  instructionsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
    color: "#ff5c2e",
    fontFamily: "Nunito-Bold",
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stepNumber: {
    marginRight: 6,
    fontSize: 16,
    color: "#ff5c2e",
    fontFamily: "Nunito-Bold",
  },
  instructionsText: {
    fontSize: 16,
    textAlign: "justify",
    color: "#fff",
    marginBottom: 16, // Agrega espacio entre líneas
    lineHeight: 24, // Ajusta la altura de línea
    fontFamily: "Nunito-Regular",
  },
  instructionTranslate: {
    flexDirection: "row", 
    marginBottom: 2, 
    paddingRight: 30,
  },
});
