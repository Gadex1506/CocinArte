import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, StatusBar, TouchableOpacity, ActivityIndicator} from 'react-native';
import {  ArrowLeftStartOnRectangleIcon} from 'react-native-heroicons/outline';
import { auth } from '../components/FirebaseConfig';
import { signOut } from "firebase/auth";
import { useShared } from '../context/SharedContext';
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Importar pantallas
import BuscarAmigosScreen from '../screens/SearchFriend';
import Favorite from '../screens/Favorite';
import HomeScreen from '../screens/HomeScreen';
import Friends from '../screens/Friends';
import SharedRecipes from '../screens/SharedRecipes';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {

  {/* Exportacion de fuente Nunito */}
  const [fontsLoaded] = useFonts({
      'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
      'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
      'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
      'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
      'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
  });

  return (

      <Drawer.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#202020',
            width: 240,
          },
          drawerActiveTintColor: '#fff',   // Texto activo
          drawerInactiveTintColor: '#969696', // Texto inactivo
          drawerActiveBackgroundColor: '#ff5c2e', // Fondo activo
          headerStyle: {
            backgroundColor: '#ff5c2e',
            height: hp(11),
          },
          headerTintColor: '#fff',
            headerTitleStyle: {
              fontFamily: 'Nunito-ExtraBold',
            },
            drawerLabelStyle: {
              fontFamily: 'Nunito-ExtraBold',
            },
        }}
      >

        {/* Home con botón de salir en la esquina superior derecha */}
        <Drawer.Screen 
          name="Inicio" 
          component={HomeScreen}
          options={({ navigation }) => ({
              title: 'Inicio',
            headerRight: () => (
              <TouchableOpacity style={{ marginRight: 20 }} onPress={() => {
                signOut(auth).then(() => {
                    navigation.replace('Login');
                });
              }}>
                <ArrowLeftStartOnRectangleIcon size={25} color="white" />
              </TouchableOpacity>
            ),
          })}
        />

        <Drawer.Screen name="Buscar Amigos" component={BuscarAmigosScreen} />
        <Drawer.Screen name="Recetas Favoritas" component={Favorite} />
        <Drawer.Screen name="Lista de Amigos" component={Friends} />
        
        <Drawer.Screen
            name="Recetas Compartidas"
            component={SharedRecipes}
            options={{
                title: 'Recetas Compartidas',
              drawerLabel: ({ focused }) => {
                const { hasShared } = useShared();
                const textColor = focused ? '#fff' : '#969696';
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{color: textColor, fontFamily: 'Nunito-ExtraBold' }}>Recetas Compartidas</Text>
                    {hasShared && (
                      <View style={{
                        width: 10,
                        height: 10,
                        backgroundColor: 'red',
                        borderRadius: 5,
                        marginLeft: 8
                      }} />
                    )}
                  </View>
                );
              }
            }}
          />

      </Drawer.Navigator>

  );
}
