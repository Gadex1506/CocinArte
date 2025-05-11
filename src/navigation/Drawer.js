import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, StatusBar, TouchableOpacity, ActivityIndicator} from 'react-native';
import {  ArrowLeftStartOnRectangleIcon} from 'react-native-heroicons/outline';
import { auth } from '../components/FirebaseConfig';
import { signOut } from "firebase/auth";
import { useShared } from '../context/SharedContext';


// Importar pantallas
import BuscarAmigosScreen from '../screens/SearchFriend';
import Favorite from '../screens/Favorite';
import HomeScreen from '../screens/HomeScreen';
import Friends from '../screens/Friends';
import SharedRecipes from '../screens/SharedRecipes';


const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (

      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#fff',
            width: 240,
          },
          drawerActiveTintColor: '#fff',   // Texto activo
          drawerInactiveTintColor: '#969696', // Texto inactivo
          drawerActiveBackgroundColor: '#ff5c2e', // Fondo activo
          headerStyle: {
            backgroundColor: '#202020',
          },
          headerTintColor: '#fff',
        }}
      >

        {/* Home con botón de salir en la esquina superior derecha */}
        <Drawer.Screen 
          name="Home" 
          component={HomeScreen}
          options={({ navigation }) => ({
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
        <Drawer.Screen name="Recetas favoritas" component={Favorite} />
        <Drawer.Screen name="Lista amigos" component={Friends} />
        <Drawer.Screen
            name="SharedRecipes"
            component={SharedRecipes}
            options={{
              drawerLabel: () => {
                const { hasShared } = useShared();
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text >Recetas Compartidas</Text>
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
