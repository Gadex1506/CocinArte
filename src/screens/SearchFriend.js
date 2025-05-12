import { View, Text, TextInput, Button, Alert, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useState } from 'react';
import { firestore } from '../components/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { agregarAmigo } from '../components/Friend';  // Importamos la función para agregar amigo
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';

export default function BuscarAmigosScreen() {
  const [correo, setCorreo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null); // Para almacenar el amigo encontrado

  {/* Exportacion de fuente Nunito */}
  const [fontsLoaded] = useFonts({
    'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
    'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
    'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
    'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
    'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
  });

  // Asegurarse de que las fuentes hayan cargado correctamente antes de continuar
  if (!fontsLoaded) {
    return null;
  }

  // Función para buscar un usuario
  const buscarUsuario = async () => {
    const correoBuscado = correo.trim().toLowerCase();
    if (!correoBuscado) {
      Alert.alert('Ingresa un correo');
      return;
    }

    try {
      const usuariosRef = collection(firestore, 'users');
      const q = query(usuariosRef, where('email', '==', correoBuscado));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResultado('Usuario no encontrado');
        setUsuarioEncontrado(null); // Si no se encuentra, se reinicia el estado
      } else {
        const user = querySnapshot.docs[0].data();
        const usuarioData = {
          nombre: user.name,
          correo: user.email,
        };
        setResultado(usuarioData);
        setUsuarioEncontrado(usuarioData); // Guardamos al usuario encontrado
      }
    } catch (error) {
      console.error("Error al buscar usuario:", error);
    }
  };

  // Función para agregar un amigo
  const agregarAmigoHandler = async () => {
    if (!usuarioEncontrado) {
      Alert.alert('No se ha encontrado un amigo para agregar');
      return;
    }

    const { correo, nombre } = usuarioEncontrado;

    // Llamamos a la función de agregar amigo
    const respuesta = await agregarAmigo(correo, nombre);

    if (respuesta === 'Este amigo ya está en tu lista de amigos') {
      Alert.alert('Amigo ya agregado', `${nombre} ya está en tu lista de amigos.`);
    } else {
      Alert.alert('Amigo agregado', `${nombre} ha sido agregado a tu lista de amigos.`);
    }

    setUsuarioEncontrado(null);  // Reiniciamos después de agregar
    setResultado(null);  // Reiniciamos el resultado mostrado
    setCorreo(''); // Limpiar el campo de correo
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Buscar Amigos</Text>
          <TextInput
            placeholder="Correo del amigo"
            placeholderTextColor="#969696" // Color del placeholder
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={buscarUsuario}>
            <Text style={styles.buttonText}>Buscar Amigo</Text>
          </TouchableOpacity>

          {/* Mostramos la tarjeta del amigo si se encontró */}
          {usuarioEncontrado && (
            <View style={styles.friendCard}>
              <Text style={styles.friendName}>{usuarioEncontrado.nombre}</Text>
              <Text style={styles.friendEmail}>{usuarioEncontrado.correo}</Text>
              <TouchableOpacity style={styles.addButton} onPress={agregarAmigoHandler}>
                <Text style={styles.addButtonText}>Agregar Amigo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mensaje si el usuario no fue encontrado */}
          {resultado && typeof resultado === 'string' && (
            <View style={styles.noEncontradoContainer}>
                <Text style={styles.noEncontradoText}>{resultado}</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020', // Fondo oscuro
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    paddingHorizontal: wp(5), 
    paddingBottom: hp(5),
    paddingTop: hp(2),
    alignItems: 'center',
  },
  title: {
    fontSize: hp(3.5),
    fontFamily: "Nunito-ExtraBold",
    color: "white",
    textAlign: "center",
    marginBottom: hp(4),
    marginTop: hp(5),
  },
  input: {
    width: wp(90),
    height: hp(6),
    borderColor: '#ff5c2e',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: hp(2),
    paddingLeft: wp(4),
    color: 'white',
    backgroundColor: '#333333',
    fontFamily: "Nunito-Regular",
  },
  button: {
    backgroundColor: '#ff5c2e',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(10),
    borderRadius: 10,
    marginTop: hp(2),
    width: wp(90),
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: "Nunito-Bold",
    fontSize: hp(2),
  },
  // Estilo para la tarjeta del amigo encontrado
  friendCard: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: wp(5),
    marginTop: hp(4),
    width: wp(90),
    alignItems: 'center',
  },
  friendName: {
    fontSize: hp(2.5),
    fontFamily: "Nunito-Bold",
    color: '#fff',
    marginBottom: hp(1),
  },
  friendEmail: {
    fontSize: hp(1.8),
    fontFamily: "Nunito-Regular",
    color: '#969696',
    marginBottom: hp(2),
  },
  addButton: {
    backgroundColor: '#ff5c2e',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: 8,
    marginTop: hp(1),
  },
  addButtonText: {
    color: 'white',
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(1.8),
  },
  // Estilo para el mensaje de "Usuario no encontrado"
  noEncontradoContainer: {
    marginTop: hp(4),
    alignItems: 'center',
  },
  noEncontradoText: {
    color: '#ef4444',
    fontFamily: "Nunito-SemiBold",
    fontSize: hp(2),
  },
});
