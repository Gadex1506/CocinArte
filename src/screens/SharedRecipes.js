import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useShared } from "../context/SharedContext";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useEffect, useState, useRef } from 'react';

const statusBarHeight = StatusBar.currentHeight || 0; // Obtiene la altura de la barra de estado

export default function SharedRecipes() {
    const { sharedRecipes, removeSharedRecipe, loadSharedRecipes, clearNotification } = useShared();
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    useFocusEffect(
        React.useCallback(() => {
            const auth = getAuth();
            if (auth.currentUser) {
                loadSharedRecipes(auth.currentUser.uid);
            }
        }, [])
    );

    useEffect(() => {
        // Limpia la "notificación" cuando la pantalla está enfocada
        const unsubscribe = navigation.addListener('focus', () => {
            clearNotification();
        });

        return unsubscribe;
    }, [navigation, clearNotification]); // Dependencias para useEffect


    const renderItem = ({ item }) => (
        <View style={styles.recipeCard}>
            <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
            <View style={styles.infoContainer}>
                <Text style={[styles.recipeName, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>{item.strMeal}</Text>
                <View style={styles.buttonContainer}> {/* Contenedor para los botones */}
                    <TouchableOpacity onPress={() => navigation.navigate("Details", item)} style={styles.detailButton}>
                        <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>Ver Detalles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeSharedRecipe(item.idMeal)} style={styles.removeButton}>
                        <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Mostrar loader o mensaje si las fuentes no han cargado
    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff5c2e" />
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <StatusBar style='light' />

            {/* Contenedor para el título y el botón de regreso */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" />
                </TouchableOpacity>
                <Text style={[styles.screenTitle, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>Recetas Compartidas</Text>
            </View>


            {sharedRecipes.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Text style={[styles.noShared, { fontFamily: fontsLoaded ? 'Nunito-SemiBold' : 'System' }]}>No tienes recetas compartidas.</Text>
                </View>
            ) : (
                <FlatList
                    data={sharedRecipes}
                    keyExtractor={(item) => item.idMeal}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContentContainer}
                    showsVerticalScrollIndicator={false} // Ocultar la barra de scroll
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
        paddingTop: statusBarHeight,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202020',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(4),
        height: hp(7),
        marginBottom: hp(2),
    },
    backButton: {
        position: 'absolute',
        left: wp(4),
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: wp(2),
        borderRadius: 9999,
    },
    screenTitle: {
        fontSize: hp(3),
        color: "white",
        textAlign: "center",
        flex: 1,
    },
    listContentContainer: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(2),
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
    },
    noShared: {
        color: "#b0b0b0",
        textAlign: "center",
        fontSize: hp(1.8),
    },
    recipeCard: {
        flexDirection: "row",
        backgroundColor: "#333333",
        borderRadius: 12,
        marginBottom: hp(2),
        overflow: "hidden",
        borderWidth: 1,
        borderColor: '#444444',
        alignItems: 'center',
    },
    recipeImage: {
        width: wp(25),
        height: wp(25),
        borderRadius: 8,
        marginRight: wp(4),
    },
    infoContainer: {
        flex: 1,
        paddingVertical: hp(1.5),
        paddingRight: wp(4),
        justifyContent: "space-between",
    },
    recipeName: {
        color: "white",
        fontSize: hp(1.8),
        marginBottom: hp(1),
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: hp(1),
    },
    detailButton: {
        backgroundColor: "#ff5c2e",
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        borderRadius: 8,
        marginRight: wp(2),
    },
    removeButton: {
        backgroundColor: "#dc2626",
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontSize: hp(1.6),
        fontWeight: 'bold',
    },
});
