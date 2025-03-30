import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, setDoc } from "firebase/firestore";

//Credenciales a Firebase
import app from '../components/FirebaseConfig';

const FavoritesContext = createContext();

// Configuraciones de Firebase
/*const firebaseConfig = {
    apiKey: "AIzaSyAqGrjVKqgkJWYg40zSUD2UzIdlaKMN1uY",
    authDomain: "cocinarte-afd3c.firebaseapp.com",
    projectId: "cocinarte-afd3c",
    storageBucket: "cocinarte-afd3c.firebasestorage.app",
    messagingSenderId: "784701390883",
    appId: "1:784701390883:web:d504d7a70abc2d5ab13196"
};*/

// Inicializar Firebase
//const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            
            // Cargar desde AsyncStorage
            const storedFavorites = await AsyncStorage.getItem("favorites");
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }

            // Cargar desde Firestore
            const favoritesCollection = collection(database, "favorites");
            const snapshot = await getDocs(favoritesCollection);
            
            const favoritesList = snapshot.docs.map((doc) => ({
                idMeal: doc.id,
                ...doc.data(),
            }));

            //Actualizar estado y guardar en AsyncStorage
            setFavorites(favoritesList);
            await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));

            console.log("Favoritos sincronizados desde Firestore");

        } catch (error) {
            console.log("Error al cargar favoritos ", error);
        }
    };

    const saveFavorites = async (newFavorites) => {
        try {
            await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
        } catch (error) {
            console.log("Error al guardar favoritos", error);
        }
    };

    const addFavorite = async (meal) => {
        try {
            const favoritesCollection = collection(database, "favorites");

            // Guarda la receta con su idMeal como ID en Firestore
            const favoriteDoc = doc(favoritesCollection, meal.idMeal.toString()); //Agrega la receta a la coleccion de favoritos en Firestore
            await setDoc(favoriteDoc, meal);

            // Actualizar estado y guardar en AsyncStorage
            setFavorites((prev) => {
                const updatedFavorites = [...prev, meal];
                AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
                return updatedFavorites;
            });

            console.log("Receta agregada con exito a FireStore y AsyncStorage");

        } catch (error) {
            console.error("Error al agregar favorito: ", error);
        }
    };

    const removeFavorite = async (mealId) => {
        
        try {

            console.log("Intentando eliminar: ", mealId); // Verificar qué ID se está enviando

            const favoriteDoc = doc(database, "favorites", mealId.toString()); // Convertir ID a string
            
            await deleteDoc(favoriteDoc);
            console.log("Receta eliminada en Firestore");

            //Actualizar estado y AsynStorage
            setFavorites((prev) => {
                const updatedFavorites = prev.filter((fav) => fav.idMeal !== mealId);
                AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
                return updatedFavorites;
            });

            console.log("Receta eliminada de Firestore y AsynStorage");

        } catch (error) {
            console.error("Erro al eliminar la receta favorita ", error);
        }

    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);