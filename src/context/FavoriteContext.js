import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem("favorites");
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.log("Error al cargar favoritos", error);
        }
    };

    const saveFavorites = async (newFavorites) => {
        try {
            await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
        } catch (error) {
            console.log("Error al guardar favoritos", error);
        }
    };

    const addFavorite = (meal) => {
        setFavorites((prev) => {
            const updatedFavorites = [...prev, meal];
            saveFavorites(updatedFavorites);
            return updatedFavorites;
        });
    };

    const removeFavorite = (mealId) => {
        setFavorites((prev) => {
            const updatedFavorites = prev.filter((fav) => fav.idMeal !== mealId);
            saveFavorites(updatedFavorites);
            return updatedFavorites;
        });
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);