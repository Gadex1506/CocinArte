import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native'; // Importamos StatusBar
import { useFriends } from '../context/FriendsContext';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';
import { useNavigation } from "@react-navigation/native"; // Importamos useNavigation
import { ChevronLeftIcon } from "react-native-heroicons/outline"; // Importamos el icono

const statusBarHeight = StatusBar.currentHeight || 0; // Obtiene la altura de la barra de estado

export default function Friends() {
    const route = useRoute();
    const { receta } = route.params || {};

    const { amigos, loading, eliminarAmigo, compartirReceta, cargarAmigos } = useFriends();
    const navigation = useNavigation(); // Inicializamos useNavigation

    // Cargar las fuentes Nunito
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });


    const renderItem = ({ item }) => (
        <View style={styles.friendItem}>
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { fontFamily: fontsLoaded ? 'Nunito-SemiBold' : 'System' }]}>{item.nombre}</Text>
                <Text style={[styles.friendEmail, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>{item.correo}</Text>
            </View>
            <View style={styles.buttonContainer}>
                {/* Solo mostramos el botón Compartir si hay una receta para compartir */}
                {receta && (
                     <TouchableOpacity
                         onPress={() => compartirReceta(item.id, receta)}
                         style={styles.shareButton}
                     >
                         <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>Compartir</Text>
                     </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => eliminarAmigo(item.id)}
                >
                    <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Nunito-Bold' : 'System' }]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    useFocusEffect(
        React.useCallback(() => {
            const auth = getAuth();
            if (auth.currentUser) {
                cargarAmigos(auth.currentUser.uid);
            }
        }, [])
    );

    // Mostramos el loader solo si las fuentes están cargando o los amigos
    if (loading || !fontsLoaded) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#ff5c2e" />
            </View>
        );
    }

    if (!loading && amigos.length === 0) {
        return (
            <View style={styles.emptyStateContainer}>
                 <StatusBar style='light'/> {/* Aseguramos la barra de estado también en este estado */}
                 {/* Contenedor para el título y el botón de regreso */}
                 <View style={styles.headerContainer}>
                     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                         <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" />
                     </TouchableOpacity>
                     <Text style={[styles.screenTitle, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>Mis Amigos</Text>
                 </View>
                <Text style={[styles.emptyStateText, { fontFamily: fontsLoaded ? 'Nunito-Regular' : 'System' }]}>Aún no tienes amigos agregados.</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <StatusBar style='light'/> {/* Aseguramos la barra de estado */}

            {/* Contenedor para el título y el botón de regreso */}
            <View style={styles.headerContainer}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                     <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" />
                 </TouchableOpacity>
                 <Text style={[styles.screenTitle, { fontFamily: fontsLoaded ? 'Nunito-ExtraBold' : 'System' }]}>Mis Amigos</Text>
            </View>

            <FlatList
                data={amigos}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={false} // Ocultar la barra de scroll
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202020',
        paddingTop: statusBarHeight, // Añadimos padding superior igual a la altura de la barra de estado
    },
    listContentContainer: {
        paddingHorizontal: wp(5), // Aplicamos padding responsivo horizontal
        paddingBottom: hp(2), // Espacio al final de la lista
        // Eliminamos paddingTop ya que el headerContainer ya proporciona espacio
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202020',
    },
    emptyStateContainer: { // Estilo para el contenedor del estado vacío
        flex: 1,
        // Eliminamos justify y align para que el headerContainer tome control
        backgroundColor: '#202020',
        paddingHorizontal: wp(5),
    },
    emptyStateText: {
        color: '#b0b0b0',
        fontSize: hp(1.8),
        textAlign: 'center',
        marginTop: hp(2),
    },
    // Nuevos estilos para el encabezado y botón de regreso, copiados de SharedRecipes.js
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
    screenTitle: { // Estilo para el título principal de la pantalla
        fontSize: hp(3), // Ajustamos el tamaño para que quepa mejor en el encabezado
        color: '#ffffff',
        textAlign: 'center',
        flex: 1, // Permite que el título ocupe el espacio restante
        // Eliminamos marginTop y marginBottom ya que el headerContainer los maneja
    },
    friendItem: {
        backgroundColor: '#333333',
        padding: wp(4),
        borderRadius: 12,
        marginBottom: hp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444444',
    },
    friendInfo: {
        flex: 1,
        marginRight: wp(2),
    },
    friendName: {
        fontSize: hp(2),
        color: '#ffffff',
        marginBottom: hp(0.5),
    },
    friendEmail: {
        fontSize: hp(1.6),
        color: '#b0b0b0',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#dc2626',
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        borderRadius: 8,
        marginLeft: wp(2),
    },
    shareButton: {
        backgroundColor: '#ff5c2e',
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        borderRadius: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: hp(1.7),
        fontWeight: 'bold',
    },
});