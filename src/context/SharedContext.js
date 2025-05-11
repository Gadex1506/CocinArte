import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, onSnapshot } from "firebase/firestore";
import { app } from '../components/FirebaseConfig';

const SharedContext = createContext();
const firestore = getFirestore(app);

export const SharedProvider = ({ children }) => {
  const [sharedRecipes, setSharedRecipes] = useState([]);
  const [hasShared, setHasShared] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref = collection(firestore, 'users', currentUser.uid, 'share');
        return onSnapshot(ref, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSharedRecipes(docs);
          setHasShared(docs.length > 0);
        });
      } else {
        setSharedRecipes([]);
        setHasShared(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSharedRecipes = async (uid) => {
    try {
      const ref = collection(firestore, "users", uid, "share");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setSharedRecipes(data);
    } catch (error) {
      console.log("Error al cargar recetas compartidas:", error);
    }
  };

  const removeSharedRecipe = async (recipeId) => {
    try {
      const uid = user?.uid;
      if (!uid) return;

      await deleteDoc(doc(firestore, "users", uid, "share", recipeId));
      setSharedRecipes(prev => prev.filter(item => item.id !== recipeId));
    } catch (error) {
      console.error("Error al eliminar receta compartida:", error);
    }
  };

  const clearNotification = () => {
    setHasShared(false);
  };

  return (
    <SharedContext.Provider value={{ sharedRecipes, removeSharedRecipe, loadSharedRecipes, hasShared, clearNotification }}>
      {children}
    </SharedContext.Provider>
  );
};

export const useShared = () => useContext(SharedContext);
