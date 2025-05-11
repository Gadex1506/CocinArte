import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFriends } from '../context/FriendsContext';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

export default function Friends() {
    const route = useRoute();
    const { receta } = route.params || {};
    
  const { amigos, loading, eliminarAmigo, compartirReceta, cargarAmigos } = useFriends();

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.correo}>{item.correo}</Text>
      <View style={styles.botones}>
        <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarAmigo(item.id)}>
          <Text style={styles.textoBoton}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => compartirReceta(item.id, receta)} style={styles.botonCompartir}>
            <Text style={styles.textoBoton}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      const auth = getAuth();
      if (auth.currentUser) {
        cargarAmigos(auth.currentUser.uid);
      }
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ff5c2e" />
      </View>
    );
  }

  if (!loading && amigos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Mis Amigos</Text>
        <Text style={{ color: 'white' }}>Aún no tienes amigos agregados.</Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Amigos</Text>
      <FlatList
        data={amigos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  nombre: {
    fontSize: 18,
    color: '#202020',
    fontFamily: 'Nunito-SemiBold',
  },
  correo: {
    fontSize: 14,
    color: '#555',
  },
  botones: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  botonEliminar: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },
  botonCompartir: {
    backgroundColor: '#ff5c2e',
    padding: 10,
    borderRadius: 8,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});