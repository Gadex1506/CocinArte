import { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../components/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Share, Alert } from 'react-native';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarAmigos = async (uid) => {
    try {
      const friendsRef = collection(firestore, 'users', uid, 'friends');
      const snapshot = await getDocs(friendsRef);
  
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      setAmigos(lista);
    } catch (error) {
      console.error("Error al cargar amigos:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarAmigo = async (id) => {
    try {
      console.log(id);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(doc(firestore, 'users', user.uid, 'friends', id));
      setAmigos(prev => prev.filter(amigo => amigo.id !== id));
      Alert.alert('Amigo eliminado');
    } catch (error) {
      console.error("Error al eliminar amigo:", error);
    }
  };

  const compartirReceta = async (amigoUID, receta) => {
    try {
      if (!receta.idMeal && !receta.id) {
        throw new Error("La receta no tiene un ID válido.");
      }
  
      const recetaId = receta.idMeal || receta.id;
  
      const recetaRef = doc(firestore, 'users', amigoUID, 'share', recetaId);
      await setDoc(recetaRef, {
        ...receta,
        compartidoEn: serverTimestamp(),
      });
  
      Alert.alert('Receta compartida', 'Se envió exitosamente a tu amigo');
    } catch (error) {
      console.error("Error al compartir receta:", error);
      Alert.alert('Error', 'No se pudo compartir la receta');
    }
  };

  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        cargarAmigos(user.uid);
      } else {
        setLoading(false); // Si no hay usuario, igual salimos del loading
      }
    });
  
    return unsubscribe;
  }, []);
  return (
    <FriendsContext.Provider value={{ amigos, loading, eliminarAmigo, compartirReceta, cargarAmigos }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => useContext(FriendsContext);
