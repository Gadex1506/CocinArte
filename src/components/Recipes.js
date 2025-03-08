import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { mealData } from "../constants";
import MasonryList from '@react-native-seoul/masonry-list';
import Animated, {FadeInDown} from 'react-native-reanimated';
import Loading from "./Loading";
//import { CachedImage } from "../helpers/image";
import CachedImage from "react-native-expo-cached-image";
import { useNavigation } from "@react-navigation/native";


export default function Recipes({meals, categories}) {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.recetasTxt}>Recetas</Text>

            <View style={styles.masonryView}>
            {
                categories.length == 0 || meals.length == 0 ? (
                    <Loading style={styles.LoadingStyle} />
                ) : (
                    /* Cards o Tarjeta de la recetas */
                    <MasonryList
                        data={meals}
                        keyExtractor={(item) => item.idMeal}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item, i}) => <RecipeCard item={item} index={i} navigation={navigation} />}
                        //refreshing={isLoadingNext}
                        //onRefresh={() => refetch({first: ITEM_CNT})}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={<View style={{height: 50}}/>}
                        //onEndReached={() => loadNext(ITEM_CNT)}
                    />
                )
            }
            </View>

        </View>
    )
}

const RecipeCard = ({item, index, navigation}) => {

    let isEven = index%2 == 0;

    return (
        <Animated.View entering={FadeInDown.delay(index*100).duration(600).springify().damping(12)}>
            <Pressable style={[styles.pressableCard, {paddingLeft: isEven? 0:8, paddingRight: isEven? 8:0}]} onPress = {()=>navigation.navigate('Details', {...item})} >
                {/*<Image source={{uri: item.strMealThumb}} style={[styles.imageCard, { height: index%3==0? hp(25): hp(35) }]} />*/}
                
                {/* Imagen de la receta */}
                <CachedImage
                    source={{ uri: item.strMealThumb }}
                    style={[styles.imageCard, { height: index%3==0? hp(25): hp(35) }]}
                />
                
                {/* Capa oscura encima de la imagen */}
                <View style={[styles.overlay, { left: index%2==0? 0 : 8 }]} />

                {/* Nombre de la receta */}
                <View style={[styles.overlayTxt, { left: index%4==0? hp(2) : hp(2.8) }]}>
                    <Text style={styles.recipeName}>
                        {
                            item.strMeal.length > 20? item.strMeal.slice(0,20)+'...': item.strMeal
                        }
                    </Text>
                </View>
                
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    
    container: {
        marginHorizontal: 20,
        marginBottom: 3,
    },
    recetasTxt: {
        fontSize: hp(3),
        fontWeight: "semibold",
        color: "#fff",
        marginBottom: 20,
    },
    pressableCard: {
        width: "100%",
        flex: 1,
        justifyContent: "center",
        marginBottom: 10,
        gap: 1,
    },
    imageCard: {
        width: "100%",
        height: hp(35),
        backgroundColor: "#fff",
        borderRadius: 30,
    },
    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: 30,
        overflow: "hidden",
    },
    recipeName: {
        fontWeight: "bold",
        color: "#fff", //ff5c2e
        fontSize: hp(2.4),
        textAlign: "auto",
    },
    LoadingStyle: {
        width: 50,
        height: 50,
        marginTop: 20,
    },
    overlayTxt: {
        position: "absolute",
        bottom: 10,
        right: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
});