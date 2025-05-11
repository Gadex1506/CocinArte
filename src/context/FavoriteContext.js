import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";

//Credenciales a Firebase
import { app } from '../components/FirebaseConfig';
import { onAuthStateChanged, getAuth } from "firebase/auth";

const FavoritesContext = createContext();

const database = getFirestore(app);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userRef = doc(database, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        await setDoc( userRef, {
                            name: currentUser.displayName || "Cocinero",
                            email: currentUser.email,
                        });
                        console.log("Usuario registrado en Firestore: ", currentUser.displayName);
                    }

                    loadFavorites(currentUser.uid);
                } catch (error) {
                    console.log("Error al registrar usuario en Firestore: ", error.message);
                }
            } else {
                setUser(null);
                setFavorites([]); // Si el usuario cierra sesión, limpia los favoritos
            }
        });

        return () => unsubscribe();

    }, []);

    const loadFavorites = async (userId) => {
        try {
            
            if (!userId) {
                return;
            }

            // Obtener el nombre del usuario desde Firestore
            const userDocRef = doc(database, "users", userId);
            const userSnap = await getDoc(userDocRef);

            let userName = "Usuario desconocido";

            if (userSnap.exists()) {
                userName = userSnap.data().name || "Usuario sin nombre";
            }

            // Obtener favoritos
            const userFavoritesCollection = collection(database, "users", userId, "favorites");
            const snapshot = await getDocs(userFavoritesCollection);

            const favoritesList = snapshot.docs.map((doc) => ({
                idMeal: doc.id,
                name: doc.data().name,
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

        if (!user) {
            console.log("El usuario no ha iniciado sesion.");
            return;
        }

        try {
            const userfavoritesCollection = collection(database, "users", user.uid, "favorites");

            // Guarda la receta con su idMeal como ID en Firestore
            const favoriteDoc = doc(userfavoritesCollection, meal.idMeal.toString()); //Agrega la receta a la coleccion de favoritos en Firestore
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

        if (!user) {
            console.log("El usuario no ha iniciado sesion.");
            return;
        }
        
        try {

            console.log("Intentando eliminar: ", mealId); // Verificar qué ID se está enviando

            const favoriteDoc = doc(database, "users", user.uid, "favorites", mealId.toString()); // Convertir ID a string
            
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
        <FavoritesContext.Provider value={{ favorites, user, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);