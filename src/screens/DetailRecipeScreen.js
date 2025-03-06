import {View, Text, ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';

export default function DetailRecipeScreen(props) {

    // Almacenar la informacion de la receta seleccionada en el home
    let item = props.route.params;

    return (
        <ScrollView 
            style={styles.scrollStyle}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 30}}
        >
            <StatusBar style='light' /> {/* Color de la barra de notificaciones de la parte superior del movil */}
        
            {/* Imagen de la Receta */}
            <View style={styles.imagenReceta}>

            </View>
        
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollStyle: {
        flex: 1,
        backgroundColor: '#171d24',
    },
    imagenReceta: {
        flex: "row",
        justifyContent: "center",
    },
});