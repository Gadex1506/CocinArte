import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { categoryData } from '../constants';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import Animated, {FadeInDown} from 'react-native-reanimated';
import CachedImage from "react-native-expo-cached-image";

export default function Categorias({categories, activeCategory, handleChangeCategory}){
    return (
        <Animated.View entering={FadeInDown.duration(500).springify()}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollStyle}
                contentContainerStyle={{ paddingHorizontal: 15 }}
            >
                {
                    categories.map((category, index) => {
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
                                <Text style={styles.categoryName}>{category.strCategory}</Text>

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