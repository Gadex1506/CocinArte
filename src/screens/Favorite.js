import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar, SafeAreaView } from "react-native";
import { useFavorites } from "../context/FavoriteContext";
import { useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';

export default function FavoritesScreen() {
    const { favorites, removeFavorite } = useFavorites();
    const navigation = useNavigation();

    // Exportación de fuente Nunito
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    // Revisar que las fuentes se hayan cargado antes de renderizar
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <StatusBar style='light'/>
            <SafeAreaView style={styles.safeArea}> {/* Envuelve el contenido principal en SafeAreaView */}

                {favorites.length === 0 ? (
                    <View style={styles.noFavoritesContainer}> {/* Contenedor para centrar el mensaje */}
                        <Text style={styles.noFavorites}>No tienes recetas guardadas.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.idMeal}
                        showsVerticalScrollIndicator={false} // Oculta la barra de scroll vertical
                        contentContainerStyle={styles.flatListContent} // Estilo para el contenido de la lista
                        renderItem={({ item }) => (
                            <View style={styles.recipeCard}>
                                <Image source={{ uri: item.strMealThumb }} style={styles.image} />
                                <View style={styles.infoContainer}>
                                    <Text style={styles.recipeName}>{item.strMeal}</Text>
                                    <View style={styles.buttons}>
                                        <TouchableOpacity onPress={() => navigation.navigate("Details", item)} style={styles.detailButton}>
                                            <Text style={styles.buttonText}>Ver Detalles</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeFavorite(item.idMeal)} style={styles.removeButton}>
                                            <Text style={styles.buttonText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
    },
    safeArea: {
        flex: 1,
    },
    noFavoritesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noFavorites: {
        color: "#969696",
        textAlign: "center",
        fontSize: hp(2.2),
        fontFamily: "Nunito-SemiBold",
    },
    flatListContent: {
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
        paddingBottom: hp(2),
    },
    recipeCard: {
        flexDirection: "row",
        backgroundColor: "#333333",
        borderRadius: 15,
        marginBottom: hp(2),
        overflow: "hidden",
        alignItems: 'center',
        padding: wp(3),
    },
    image: {
        width: wp(25),
        height: wp(25),
        borderRadius: 10,
        marginRight: wp(4),
    },
    infoContainer: {
        flex: 1,
        justifyContent: "space-between",
        height: wp(25),
    },
    recipeName: {
        color: "white",
        fontSize: hp(2.2),
        fontFamily: "Nunito-Bold",
        marginBottom: hp(1),
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    detailButton: {
        backgroundColor: "#ff5c2e",
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: 8,
    },
    removeButton: {
        backgroundColor: "#ef4444",
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontFamily: "Nunito-SemiBold",
        fontSize: hp(1.6),
    },
});
