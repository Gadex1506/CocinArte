import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Importacion de las pantallas de la app
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import ParallaxScreen from '../screens/ParallaxScreen';
import Details from '../screens/Details';
import Vision from '../screens/Vision';
import Favorite from '../screens/Favorite';
import { FavoritesProvider } from '../context/FavoriteContext';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <FavoritesProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Welcome"
                    screenOptions={{
                        headerShown: false
                    }}
                >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Parallax" component={ParallaxScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Details" component={Details} />
                    <Stack.Screen name="Vision" component={Vision} />
                    <Stack.Screen name="Favorite" component={Favorite} />
                </Stack.Navigator>
            </NavigationContainer>
        </FavoritesProvider>
    );
}