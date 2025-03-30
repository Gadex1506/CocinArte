import {View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, StatusBar, TouchableOpacity} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { MagnifyingGlassIcon, CameraIcon} from 'react-native-heroicons/outline';
import { HeartIcon} from 'react-native-heroicons/solid';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import Categorias from '../components/Categorias';
import axios from 'axios';
import Recipes from '../components/Recipes';
import { useNavigation } from "@react-navigation/native";
import { useFonts } from 'expo-font';

export default function HomeScreen() {

    const [activeCategory, setActiveCategory] = useState("Beef");
    const [categories, setCategories] = useState([]);
    const [meals, setMeals] = useState([]);
    const [filteredMeals, setFilteredMeals] = useState([]);
    const [searchText, setSearchText] = useState("");
    const navigation = useNavigation();

    const apiKey = 'AIzaSyD8_zr5ysaD8JsnHGxhphwnHJpyLGHXwek'; // API de Google Translate

    const searchTimeout = useRef(null);

    {/* Exportacion de fuente Nunito */}
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    useEffect(() => { 
        getCategories();
        getRecipes();
    }, []);

    const handleChangeCategory = (category) => {
        setActiveCategory(category);
        setSearchText("");
        getRecipes(category);
        setMeals([]);
    };

    const getCategories =  async () => {
        try {
            const response = await axios.get("https://www.themealdb.com/api/json/v1/1/categories.php");
            
            if(response && response.data){
                setCategories(response.data.categories);
                //console.log('Obteniendo Categorias', response.data);
            }
        } catch (error) {
            console.log('No hay datos para asignar: ', error.message);
        }
    };

    const getRecipes =  async (category = "Beef") => {
        try {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
            //console.log('Obteniendo Recetas', response.data);
            if(response && response.data){
                setMeals(response.data.meals);
                setFilteredMeals(response.data.meals);
            }
        } catch (error) {
            console.log('No hay datos para asignar: ', error.message);
        }
    };

    const handleSearch = async (text) => {
        setSearchText(text);
    
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
        // Si el usuario borra todo, restaurar las recetas de la categoría activa de inmediato
        if (text.trim() === "") {
            setFilteredMeals(meals);
            return;
        }
    
        searchTimeout.current = setTimeout(async () => {
            try {
                let searchQuery = text.toLowerCase();
    
                // Verificar si la palabra ya existe en los nombres de recetas (asumimos que están en inglés)
                const isEnglish = meals.some(meal => 
                    meal.strMeal.toLowerCase().includes(searchQuery)
                );
    
                // Si no está en inglés, traducir al inglés antes de buscar
                if (!isEnglish) {
                    searchQuery = await translateToEnglish(text);
                }
    
                // Filtrar solo dentro de la categoría activa
                const filtered = meals.filter(meal =>
                    meal.strMeal.toLowerCase().includes(searchQuery.toLowerCase())
                );
    
                setFilteredMeals(filtered);
            } catch (error) {
                console.log("Error en la búsqueda: ", error.message);
            }
        }, 500); // Se ejecutará después de 500ms de inactividad
    };
    
    
    // Función para traducir una palabra al inglés usando LibreTranslate (o Google Translate)
    const translateToEnglish = async (text) => {
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
                q: text,
                source: "es", // Español
                target: "en", // Inglés
                format: "text",
            }
        );

        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.log("Error en la traducción:", error);
        return text; // Si falla la traducción, usa el texto original
    }
};

    return (
        <View style={styles.container}>
            <StatusBar style='light'/>

            <SafeAreaView>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollView}
                >


                {/* Bienvenida y Mensaje de Bienvenida*/}
                <View style={styles.welcomeView}>
                    <Text style={styles.textNickname}>¡Hey, Artista de la Cocina!</Text>
                    {/* Botón de Corazón */}
                    <TouchableOpacity style={styles.heartButton}>
                        <HeartIcon onPress={()=>navigation.navigate('Favorite')} size={hp(3)} strokeWidth={2} color={"#ff5c2e"} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.motivationTxt}>La cocina es arte, y tú eres el artista. <Text style={styles.threeTxt}>¡Dale tu toque especial!</Text></Text>
                    </View>
                </View>

                {/* Barra de busqueda */}
                <View style={styles.searchBar}>

                    {/* Icono de la Lupa */}
                    <View style={styles.glassIcon}>
                        <MagnifyingGlassIcon size={hp(2.5)} strokeWidth={3} color={"#ff5c2e"} />
                    </View>

                    <TextInput 
                        placeholder='Buscar recetas...'
                        placeholderTextColor={"#202020"}
                        style={styles.textInputStyle}
                        value={searchText}
                        onChangeText={handleSearch}
                    />

                    {/* Icono de la Camara */}
                    <View style={styles.cameraIcon}>
                        <CameraIcon onPress = {()=>navigation.navigate('Vision')}  size={hp(2.8)} strokeWidth={2} color={"#ff5c2e"} />
                    </View>
                </View>

                {/* Categorias */}
                <View style={styles.categoriesView}>
                    <Categorias categories={categories} activeCategory={activeCategory} handleChangeCategory={handleChangeCategory}/>
                </View>

                {/* Lista de Recetas */}
                <View style={styles.recipesView}>
                    <Recipes meals={filteredMeals} categories={categories}/>
                </View>

                </ScrollView>
            </SafeAreaView>
            

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
    },
    scrollView: {
        paddingBottom: 50,
        gap: 6,
        paddingTop: 14,
    },
    welcomeView: {
        marginHorizontal: 20,
        top: 50,
        marginBottom: 2,
    },
    textNickname: {
        color: "#fff",
        fontSize: hp(2.5),
        fontFamily: "Nunito-Regular",
    },
    motivationTxt: {
        color: "#fff",
        fontFamily: "Nunito-Semibold",
        fontSize: hp(3.8),
        marginTop: 10,
    },
    threeTxt: {
        color: "#ff5c2e",
        fontFamily: "Nunito-Semibold",
        fontSize: hp(3.8),
        marginTop: 5,
    },
    searchBar: {
        marginHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        backgroundColor: "#F6F6F6",
        padding: 5,
        top: 70,
    },
    glassIcon: {
        borderRadius: 10,
        padding: 3,
        left: hp(1),
    },
    textInputStyle: {
        fontSize: hp(1.8),
        flex: 1,
        color: "#202020",
        margin: 1,
        left: hp(1),
        letterSpacing: 0.5,
        fontFamily: "Nunito-Medium",
    },
    cameraIcon: {
        borderRadius: 10,
        padding: 3,
        right: hp(1),
    },
    categoriesView: {
        top: 80,
    },
    recipesView: {
        top: 100,
    },
    heartButton: {
        width: hp(5),
        height: hp(5),
        backgroundColor: "#fff",
        borderRadius: hp(2.5),
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        position: 'absolute',
        right: (10)
    },
});