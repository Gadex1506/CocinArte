import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SharedProvider } from '../context/SharedContext'; 

// Importación de pantallas
import WelcomeScreen from '../screens/WelcomeScreen';
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
import Friends from '../screens/Friends';

// Drawer
import DrawerNavigator from './Drawer';

// Credenciales Firebase
import '../components/FirebaseConfig';
import { FriendsProvider } from '../context/FriendsContext';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <SharedProvider>
        <FavoritesProvider>
            <FriendsProvider>

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

                        {/* Cambiado Home por DrawerNavigator */}
                        <Stack.Screen name="MainApp" component={DrawerNavigator} />

                        <Stack.Screen name="Parallax" component={ParallaxScreen} />
                        <Stack.Screen name="Details" component={Details} />
                        <Stack.Screen name="Vision" component={Vision} />
                        <Stack.Screen name="Friends" component={Friends} />
                        <Stack.Screen name="ResultScreen" component={ResultRecognitionScreen} />
                        <Stack.Screen name="GenerateRecipe" component={GenerateRecipe} />
                    </Stack.Navigator>
                </NavigationContainer>
                
            </FriendsProvider>
        </FavoritesProvider>
        </SharedProvider>
    );
}