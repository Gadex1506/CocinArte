import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar } from "react-native";
import { useFavorites } from "../context/FavoriteContext";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function FavoritesScreen() {
    const { favorites, removeFavorite } = useFavorites();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <StatusBar style='light'/>
            <Text style={styles.title}>Recetas Favoritas</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.atras} >
                <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" right={1.5} />
            </TouchableOpacity>
            {favorites.length === 0 ? (
                <Text style={styles.noFavorites}>No tienes recetas guardadas.</Text>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.idMeal}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#202020", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20, top: 50 },
    noFavorites: { color: "gray", textAlign: "center", marginTop: 20, fontSize: 18, top: 50 },
    recipeCard: { flexDirection: "row", backgroundColor: "#303030", borderRadius: 10, marginBottom: 15, overflow: "hidden", top: 50 },
    image: { width: 100, height: 100 },
    infoContainer: { flex: 1, padding: 10, justifyContent: "space-between" },
    recipeName: { color: "white", fontSize: 16, fontWeight: "bold" },
    buttons: { flexDirection: "row", justifyContent: "space-between" },
    detailButton: { backgroundColor: "#ff5c2e", padding: 8, borderRadius: 5 },
    removeButton: { backgroundColor: "red", padding: 8, borderRadius: 5 },
    buttonText: { color: "white", fontWeight: "bold" },
});