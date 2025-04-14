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
import Login from '../screens/loginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResultRecognitionScreen from '../screens/ResultRecognitionScreen';
import GenerateRecipe from '../screens/GenerateRecipeScreen';

//Credenciales a Firebase
import '../components/FirebaseConfig';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <FavoritesProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                        headerShown: false
                    }}
                >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Parallax" component={ParallaxScreen} />
                    <Stack.Screen name="Details" component={Details} />
                    <Stack.Screen name="Vision" component={Vision} />
                    <Stack.Screen name="ResultScreen" component={ResultRecognitionScreen} />
                    <Stack.Screen name="GenerateRecipe" component={GenerateRecipe} />
                    <Stack.Screen name="Favorite" component={Favorite} />
                </Stack.Navigator>
            </NavigationContainer>
        </FavoritesProvider>
    );
}