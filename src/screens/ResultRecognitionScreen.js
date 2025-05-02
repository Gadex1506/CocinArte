import React, { useRef, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon, CheckCircleIcon, CheckIcon, XCircleIcon } from "react-native-heroicons/outline";
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';

export default function ResultRecognitionScreen() {

    {/* Exportacion de fuente Nunito */}
    const [fontsLoaded] = useFonts({
        'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
        'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
        'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
        'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
        'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
    });

    const route = useRoute();
    const navigation = useNavigation();

    const { image, initialIngredients } = route.params;
    const [ingredients, setIngredients] = useState(initialIngredients || []);

    const [newIngredient, setNewIngredient] = useState('');

    const removeIngredient = (itemToRemove) => {
        setIngredients(prev => prev.filter(item => item !== itemToRemove));
    };

    const addIngredient = (newItem) => {
        if (newItem && !ingredients.includes(newItem)) {
            setIngredients(prev => [...prev, newItem]);
        }
    };

    return (
        <View style={styles.container}>

            {/* Boton de regresar */}
            <TouchableOpacity onPress={() => navigation.navigate("Vision")} style={styles.atras} >
                <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#ff5c2e" right={1.5} />
            </TouchableOpacity>

            {/* Imagen de la foto tomada */}
            <Image source={{ uri: image }} style={styles.image} />

            <Text style={styles.resultTitle}>Ingredientes detectados</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Agregar ingrediente"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={newIngredient}
                    onChangeText={setNewIngredient}
                    onSubmitEditing={(e) => {
                        addIngredient(e.nativeEvent.text.trim());
                        setNewIngredient('');
                    }}
                />
                <TouchableOpacity onPress={() => {
                    addIngredient(newIngredient.trim());
                    setNewIngredient('');
                    }}
                    style={styles.checkIcon}
                >
                    <CheckCircleIcon size={hp(4)} color="#1dab20" strokeWidth={2} />
                </TouchableOpacity>
            </View>

            <FlatList
                style={{ maxHeight: hp(23) }}
                contentContainerStyle={{ alignItems: 'center' }}
                data={ingredients}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => (
                    <View style={styles.ingredientItem}>
                        <Text style={styles.ingredientText}>{item}</Text>
                        <TouchableOpacity onPress={() => removeIngredient(item)}>
                            <XCircleIcon size={hp(3.5)} strokeWidth={1.8} color="#d22b35" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity onPress={() => navigation.navigate('GenerateRecipe', {ingredients})} style={styles.button} >
                <Image 
                    source={require('../../assets/icons/10.png')}
                    style={{ width: 45, height: 45, tintColor: '#0277BD' }}
                />
            </TouchableOpacity>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202020',
        alignItems: 'center',
        paddingTop: 50,
    },
    atras: {
        position: "absolute",
        backgroundColor: "white",
        width: 45,
        height: 45,
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
        right: "82%",
        top: 50,
    },
    backText: {
        color: '#ff5c2e',
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
        marginTop: 70,
    },
    resultTitle: {
        color: '#ff5c2e',
        fontSize: 20,
        marginBottom: 10,
        fontFamily: 'Nunito-ExtraBold',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
        width: '90%',
    },
    ingredientText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito-SemiBold',
    },
    removeButton: {
        color: '#ff5c2e',
        fontSize: 20,
        fontWeight: 'bold',
        right: 5,
    },
    input: {
        flex: 1,
        color: 'white',
        fontFamily: 'Nunito-Bold',
        paddingVertical: 10,
    },
    button: {
        //position: "absolute",
        backgroundColor: "white",
        width: 62,
        height: 62,
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
        //right: "82%",
        top: hp(2),
    },
    aiText: {
        fontSize: 18,
        padding: 2,
        color: '#ff5c2e',
        fontFamily: 'Nunito-ExtraBold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#444',
        borderRadius: 8,
        paddingHorizontal: 10,
        width: '82%',
        height: '6%',
        marginBottom: 15,
    },
    checkIcon: {
        paddingLeft: 10,
    }
});