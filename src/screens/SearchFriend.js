import { View, Text, TextInput, Button, Alert, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useState } from 'react';
import { firestore } from '../components/FirebaseConfig'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { agregarAmigo } from '../components/Friend';  // Importamos la función de agregar amigo
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function BuscarAmigosScreen() {
  const [correo, setCorreo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null); // Para almacenar el amigo encontrado

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
        setUsuarioEncontrado(null); // Si no se encuentra, reiniciamos el estado
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
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Buscar Amigos</Text>
          <TextInput
            placeholder="Correo del amigo"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.buttonBuscar} onPress={buscarUsuario}>
            <Text style={styles.buttonText}>Buscar Amigo</Text>
          </TouchableOpacity>

          {usuarioEncontrado && (
            <TouchableOpacity style={styles.buttonAgregar} onPress={agregarAmigoHandler}>
              <Text style={styles.buttonText}>Agregar Amigo</Text>
            </TouchableOpacity>
          )}

          {resultado && (
            <View style={styles.resultado}>
              {typeof resultado === 'string' ? (
                <Text style={styles.noEncontrado}>{resultado}</Text>
              ) : (
                <>
                  <Text style={styles.texto}>Nombre: {resultado.nombre}</Text>
                  <Text style={styles.texto}>Correo: {resultado.correo}</Text>
                </>
              )}
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
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  scrollView: {
    paddingBottom: 50,
    paddingTop: 14,
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 20,
    paddingLeft: 10,
    top: 30,
    textShadowColor: "white",
    backgroundColor: "white"
  },
  title: {
    fontSize: 24,
    fontFamily: "Nunito-ExtraBold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    top: 50
  },
  resultado: {
    marginTop: 50,
    color: "white"
  },
  noEncontrado: {
    color: 'white',
  },
  texto: {
    color: 'white',
  },
  buttonBuscar: {
    backgroundColor: '#ff5c2e',
    padding: 14,
    borderRadius: 18,
    top: hp("3%"),
    marginHorizontal: 100,
  },
  buttonAgregar: {
    backgroundColor: '#ff5c2e',
    padding: 14,
    borderRadius: 18,
    top: hp("5%"),
    marginHorizontal: 100,
  },
});
