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

export default function SharedRecipes() {
    const { sharedRecipes, removeSharedRecipe, loadSharedRecipes, clearNotification  } = useShared();
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
        clearNotification(); // Limpia la "notificación"
      }, []);

    return (
        <View style={styles.container}>
            <StatusBar style='light'/>
            <Text style={styles.title}>Recetas Compartidas</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.atras} >
                <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" />
            </TouchableOpacity>
            {sharedRecipes.length === 0 ? (
                <Text style={styles.noShared}>No tienes recetas compartidas.</Text>
            ) : (
                <FlatList
                    data={sharedRecipes}
                    keyExtractor={(item) => item.idMeal}
                    renderItem={({ item }) => (
                        <View style={styles.recipeCard}>
                            <Image source={{ uri: item.strMealThumb  }} style={styles.image} />
                            <View style={styles.infoContainer}>
                                <Text style={styles.recipeName}>{item.strMeal }</Text>
                                <View style={styles.buttons}>
                                    <TouchableOpacity onPress={() => navigation.navigate("Details", item)} style={styles.detailButton}>
                                        <Text style={styles.buttonText}>Ver Detalles</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => removeSharedRecipe(item.idMeal)} style={styles.removeButton}>
                                        <Text style={styles.buttonText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#202020", padding: 20 },
    title: {
        fontSize: 24,
        fontFamily: "Nunito-ExtraBold",
        color: "white",
        textAlign: "center",
        marginBottom: 20,
        top: 50
    },
    noShared: {
        color: "gray",
        textAlign: "center",
        marginTop: 20,
        fontSize: 18,
        top: 50,
        fontFamily: "Nunito-Semibold",
    },
    recipeCard: {
        flexDirection: "row",
        backgroundColor: "#303030",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
        top: 50
    },
    image: {
        width: 100,
        height: 100
    },
    infoContainer: {
        flex: 1,
        padding: 10,
        justifyContent: "space-between",
    },
    recipeName: {
        color: "white",
        fontSize: 16,
        fontFamily: "Nunito-ExtraBold",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    detailButton: {
        backgroundColor: "#ff5c2e",
        padding: 8,
        borderRadius: 5
    },
    removeButton: {
        backgroundColor: "red",
        padding: 8,
        borderRadius: 5
    },
    buttonText: {
        color: "white",
        fontFamily: "Nunito-Bold",
    },
    atras: {
        position: "absolute",
        top: 40,
        left: 10,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 6,
    },
});
