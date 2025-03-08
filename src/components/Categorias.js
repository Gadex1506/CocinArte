import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { categoryData } from '../constants';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import Animated, {FadeInDown} from 'react-native-reanimated';
import CachedImage from "react-native-expo-cached-image";
import axios from 'axios';

export default function Categorias({categories, activeCategory, handleChangeCategory}){
    
    const [translatedCategories, setTranslatedCategories] = useState([]);
    
    useEffect(() => {
        translateCategories();
    } , [categories]); // Se ejecutara cada vez que cambien las categorias

    const translateCategories = async () => {
        try {
            const translated = await Promise.all(
                categories.map(async (category) => {
                    const translateName = await translateText(category.strCategory);
                    //console.log(translateName);
                    return { ...category, translateName };
                })
            );
            setTranslatedCategories(translated);
        } catch (error) {
            console.error("Error en la traduccion ", error.message);
            setTranslatedCategories(categories);
        }
    };

    const translateText = async (text, targetLanguage = 'es') => {
        const apiKey = 'AIzaSyD8_zr5ysaD8JsnHGxhphwnHJpyLGHXwek';
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        
        try {
            const { data } = await axios.post(url, {
                q: text,
                target: targetLanguage,
            });

            let translatedText = data.data.translations[0].translatedText;

            // Reemplazo de nombres específicos después de la traducción
            const replacements = {
                "Motor de arranque": "Entrada",
                "Lado": "Acompañamiento",
                "Misceláneas": "Otros"
            };

            translatedText = replacements[translatedText] || translatedText;

            //console.log(data.data.translations[0].translatedText);
            return translatedText;

        } catch (error) {
            console.error('Error en la traducción ', error);
            return text;
        }
    };

    return (
        <Animated.View entering={FadeInDown.duration(500).springify()}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollStyle}
                contentContainerStyle={{ paddingHorizontal: 15 }}
            >
                {
                    translatedCategories.map((category, index) => {
                        let isActive = category.strCategory == activeCategory;
                        let activeButtonClass = isActive ? { backgroundColor: '#ff5c2e' } : { backgroundColor: 'rgba(1,1,1,0.1)' };
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleChangeCategory(category.strCategory)}
                                style={styles.touchableMap}
                            >

                                {/* Imagen de la categoria respectiva */}
                                <View style={[styles.viewMap, activeButtonClass]}>
                                    {/*<Image source={{uri: category.strCategoryThumb}} style={styles.categoryImage} />*/}

                                    <CachedImage
                                        source={{uri: category.strCategoryThumb}}
                                        style={styles.categoryImage}
                                    />
                                </View>

                                {/* Nombre de la categoria respectiva */}
                                <Text style={styles.categoryName}>{category.translateName || category.strCategory}</Text>

                            </TouchableOpacity>
                        );
                    })
                }
            </ScrollView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    scrollStyle: {
        marginHorizontal: 4,
    },
    touchableMap: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 1,
    },
    viewMap: {
        borderRadius: 9999,
        padding: 10,
    },
    categoryImage: {
        width: hp(6),
        height: hp(6),
        borderRadius: 9999,
    },
    categoryName:{
        color: '#fff',
        fontSize: hp(1.6),
    },
});
