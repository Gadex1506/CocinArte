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

        // Devuelve la función de limpieza para remover el listener
        return unsubscribe;
    }, [navigation, clearNotification]); // Dependencias para useEffect


    const renderItem = ({ item }) => (
        <View style={styles.recipeCard}>
            <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} /> {/* Usamos un estilo específico para la imagen de la receta */}
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

    // Mostramos loader o mensaje si las fuentes no han cargado
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
                <View style={styles.emptyStateContainer}> {/* Contenedor para centrar el mensaje */}
                     <Text style={[styles.noShared, { fontFamily: fontsLoaded ? 'Nunito-SemiBold' : 'System' }]}>No tienes recetas compartidas.</Text>
                </View>
            ) : (
                <FlatList
                    data={sharedRecipes}
                    keyExtractor={(item) => item.idMeal}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContentContainer} // Añadimos padding al FlatList
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
        paddingTop: statusBarHeight, // Añadimos padding superior igual a la altura de la barra de estado
    },
    loadingContainer: { // Estilo para el estado de carga inicial (mientras cargan las fuentes)
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center',
         backgroundColor: '#202020',
    },
    headerContainer: { // Contenedor para el título y botón de regreso
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centrar el título
        paddingHorizontal: wp(4), // Padding a los lados
        height: hp(7), // Altura fija para el encabezado
        marginBottom: hp(2), // Espacio debajo del encabezado
    },
    backButton: { // Estilo para el botón de regreso
        position: 'absolute', // Posicionamiento absoluto
        left: wp(4), // Alineado a la izquierda
        zIndex: 1, // Asegura que esté por encima del título
         backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semi-transparente
         padding: wp(2),
         borderRadius: 9999, // Borde redondo
    },
    screenTitle: { // Estilo para el título principal de la pantalla
        fontSize: hp(3),
        color: "white",
        textAlign: "center",
        flex: 1, // Permite que el título ocupe el espacio restante
    },
    listContentContainer: {
        paddingHorizontal: wp(4), // Padding a los lados de la lista
        paddingBottom: hp(2), // Espacio al final de la lista
    },
    emptyStateContainer: { // Contenedor para centrar el mensaje de estado vacío
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
    },
    noShared: {
        color: "#b0b0b0", // Color gris claro
        textAlign: "center",
        fontSize: hp(1.8), // Tamaño de fuente responsivo
        // fontFamily se aplica directamente en el componente
    },
    recipeCard: {
        flexDirection: "row",
        backgroundColor: "#333333", // Fondo oscuro
        borderRadius: 12, // Bordes más redondeados
        marginBottom: hp(2), // Espacio entre tarjetas
        overflow: "hidden",
        borderWidth: 1,
        borderColor: '#444444', // Borde sutil
        alignItems: 'center', // Centrar verticalmente el contenido de la tarjeta
    },
    recipeImage: { // Estilo específico para la imagen dentro de la tarjeta
        width: wp(25), // Ancho responsivo
        height: wp(25), // Altura responsiva (cuadrada)
        borderRadius: 8, // Bordes redondeados para la imagen
        marginRight: wp(4), // Espacio a la derecha de la imagen
    },
    infoContainer: {
        flex: 1,
        paddingVertical: hp(1.5), // Padding vertical responsivo
        paddingRight: wp(4), // Padding a la derecha
        justifyContent: "space-between",
    },
    recipeName: {
        color: "white",
        fontSize: hp(1.8), // Tamaño de fuente responsivo
        marginBottom: hp(1), // Espacio debajo del nombre
        // fontFamily se aplica directamente en el componente
    },
    buttonContainer: { // Contenedor para los botones dentro de la tarjeta
        flexDirection: "row",
        justifyContent: "flex-end", // Alinear botones a la derecha
        marginTop: hp(1), // Espacio arriba de los botones
    },
    detailButton: {
        backgroundColor: "#ff5c2e",
        paddingVertical: hp(1), // Padding vertical responsivo
        paddingHorizontal: wp(3), // Padding horizontal responsivo
        borderRadius: 8, // Bordes redondeados
        marginRight: wp(2), // Espacio entre botones
    },
    removeButton: {
        backgroundColor: "#dc2626", // Rojo más intenso
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontSize: hp(1.6), // Tamaño de fuente responsivo
        fontWeight: 'bold', // Negrita
        // fontFamily se aplica directamente en el componente
    },
    // Estilos originales que ya no se usan o se han adaptado
    // title: {}, // Reemplazado por screenTitle en headerContainer
    // atras: {}, // Reemplazado por backButton en headerContainer
    // image: {}, // Reemplazado por recipeImage
    // buttons: {}, // Reemplazado por buttonContainer
});
