import {View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, StatusBar} from 'react-native';
import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon,
    AdjustmentHorizontalIcon,
    CameraIcon,
} from 'react-native-heroicons/outline';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import Categorias from '../components/Categorias';
import axios from 'axios';
import Recipes from '../components/Recipes';

export default function HomeScreen() {

    const [activeCategory, setActiveCategory] = useState("Beef");
    const [categories, setCategories] = useState([]);
    const [meals, setMeals] = useState([]);
    const [filteredMeals, setFilteredMeals] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => { 
        getCategories();
        getRecipes();
    }, []);

    const handleChangeCategory = (category) => {
        setActiveCategory(category);
        getRecipes(category);
        setSearchText("");
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
            console.log('error: ', error.message);
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
            console.log('error: ', error.message);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (text.trim() == "") {
            setFilteredMeals(meals);
        }else {
            const filtered = meals.filter(meals =>
                meals.strMeal.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredMeals(filtered);
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
                        <CameraIcon size={hp(2.8)} strokeWidth={2} color={"#ff5c2e"} />
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
    },
    motivationTxt: {
        color: "#fff",
        fontWeight: "semibold",
        fontSize: hp(3.8),
        marginTop: 10,
    },
    threeTxt: {
        color: "#ff5c2e",
        fontWeight: "semibold",
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
});