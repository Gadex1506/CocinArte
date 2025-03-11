import React, { createContext, useState, useContext } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]); // Estado global de favoritos

    // Agregar receta a favoritos
    const addFavorite = (meal) => {
        setFavorites((prev) => {
            const exists = prev.some((fav) => fav.idMeal === meal.idMeal);
            return exists ? prev : [...prev, meal];
        });
    };

    // Eliminar receta de favoritos
    const removeFavorite = (mealId) => {
        setFavorites((prev) => prev.filter((fav) => fav.idMeal !== mealId));
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Hook para acceder al contexto
export const useFavorites = () => useContext(FavoritesContext);