import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqGrjVKqgkJWYg40zSUD2UzIdlaKMN1uY",
    authDomain: "cocinarte-afd3c.firebaseapp.com",
    projectId: "cocinarte-afd3c",
    storageBucket: "cocinarte-afd3c.firebasestorage.app",
    messagingSenderId: "784701390883",
    appId: "1:784701390883:web:d504d7a70abc2d5ab13196"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Obtiene y exporta la instancia de auth
const auth = getAuth(app);

const firestore = getFirestore(app);

export { auth, firestore };
export default app; 