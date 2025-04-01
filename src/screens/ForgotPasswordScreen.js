// ForgotPasswordScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator,Image , ScrollView} from 'react-native';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { useFonts } from 'expo-font';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  {/* Exportacion de fuente Nunito */}
      const [fontsLoaded] = useFonts({
          'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
          'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
          'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
          'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
          'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
  });

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('El correo electrónico es obligatorio');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Introduce un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = () => {
    if (!validateEmail(email)) return;
    
    setIsLoading(true);
    const auth = getAuth();
    
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        Alert.alert(
          'Correo enviado', 
          'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert('Error', errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
        {/* Imagen de fondo con opacidad */}
        <Image source={require("../../assets/images/background.png")} style={styles.fruitBackground} />
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>
            Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </Text>
        
        <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Correo Electrónico..."
            placeholderTextColor={"#20202099"}
            value={email}
            onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        
        <TouchableOpacity 
            style={[styles.button, isLoading ? styles.buttonDisabled : null]} 
            onPress={handleResetPassword}
            disabled={isLoading}
        >
            {isLoading ? (
            <ActivityIndicator color="white" />
            ) : (
            <Text style={styles.buttonText}>Enviar correo</Text>
            )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Volver a Iniciar Sesión</Text>
        </TouchableOpacity>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d22b35',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#d22b35',
  },
  fruitBackground: {
    position: 'absolute',
    width: wp(100),
    height: hp(100),
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Nunito-ExtraBold",
    marginBottom: 12,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Nunito-SemiBold",
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
  },
  input: {
    fontFamily: "Nunito-SemiBold",
    color: '#d22b35',
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontFamily: "Nunito-SemiBold",
    color: '#fff',
    marginTop: -8,
    marginBottom: 20,
    fontSize: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#FFB0A5',
    padding: 14,
    borderRadius: 18,
    //top: hp("38%"),
    marginHorizontal: 100,

  },
  buttonDisabled: {
    backgroundColor: '#FFB0A5',
  },
  buttonText: {
    fontFamily: "Nunito-Bold",
    color: '#FF1C0F',
    textAlign: 'center',
    fontSize: 16,
  },
  linkText: {
    fontFamily: "Nunito-SemiBold",
    color: '#ffffffdd',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});