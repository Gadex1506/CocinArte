import { firestore } from './FirebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Función para agregar un amigo con UID real como ID del documento
 * @param {string} amigoEmail - Correo del amigo
 * @param {string} amigoNombre - Nombre del amigo
 */
export const agregarAmigo = async (amigoEmail, amigoNombre) => {
  try {
    const auth = getAuth();
    const usuarioId = auth.currentUser.uid;

    // 1. Buscar el UID real del amigo (documento en 'users')
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', amigoEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Usuario no encontrado en la colección "users".');
      return 'Usuario no encontrado';
    }

    const amigoDoc = querySnapshot.docs[0];
    const amigoUID = amigoDoc.id;

    // 2. Verificar si ya lo tienes agregado
    const amigosRef = collection(firestore, 'users', usuarioId, 'friends');
    const existe = await getDocs(query(amigosRef, where('email', '==', amigoEmail)));

    if (!existe.empty) {
      console.log('Este amigo ya está en tu lista.');
      return 'Este amigo ya está agregado';
    }

    // 3. Agregar amigo con ID personalizado (su UID)
    await setDoc(doc(amigosRef, amigoUID), {
      email: amigoEmail,
      nombre: amigoNombre,
      fechaAgregado: new Date()
    });

    console.log('Amigo agregado con UID como ID del documento.');
    return 'Amigo agregado exitosamente';
  } catch (error) {
    console.error("Error al agregar amigo:", error);
    return 'Hubo un error al agregar al amigo';
  }
};
