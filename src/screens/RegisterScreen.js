// RegisterScreen.js
import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Vibration,
  Animated
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useFonts } from 'expo-font';
import { widthPercentageToDP as wp, 
    heightPercentageToDP as hp 
} from 'react-native-responsive-screen';


export default function RegisterScreen({ navigation }) {

  {/* Exportacion de fuente Nunito */}
      const [fontsLoaded] = useFonts({
          'Nunito-Regular': require('@expo-google-fonts/nunito/Nunito_400Regular.ttf'),
          'Nunito-Medium': require('@expo-google-fonts/nunito/Nunito_500Medium.ttf'),
          'Nunito-SemiBold': require('@expo-google-fonts/nunito/Nunito_600SemiBold.ttf'),
          'Nunito-Bold': require('@expo-google-fonts/nunito/Nunito_700Bold.ttf'),
          'Nunito-ExtraBold': require('@expo-google-fonts/nunito/Nunito_800ExtraBold.ttf'),
      });


  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  // Estados para errores de validación
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Animación de shake
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Función de animación de sacudida (shake)
  const shakeAnimation = () => {
    Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Validación del nombre
  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      return false;
    }
    setNameError('');
    return true;
  };

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

  // Validación de contraseña
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Validación de confirmación de contraseña
  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Por favor confirma tu contraseña');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = () => {
    // Validar todos los campos
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      Vibration.vibrate(300);
      shakeAnimation();
      return;
    }
    
    setIsLoading(true);
    const auth = getAuth();
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        
        // Actualizar el perfil del usuario con el nombre
        return updateProfile(user, {
          displayName: name
        }).then(() => {
          Alert.alert(
            'Registro Exitoso', 
            '¡Tu cuenta ha sido creada correctamente!',
            [{ text: 'OK', onPress: () => navigation.replace('Welcome') }]
          );
        });
      })
      .catch((error) => {
        // Traducción de errores comunes de Firebase para una mejor UX
        let errorMessage;
        switch(error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está en uso';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil';
            break;
          default:
            errorMessage = error.message;
        }
        Alert.alert('Error', errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        >
        <View style={styles.innerContainer}>
        {/* Imagen de fondo con opacidad */}
        <Image source={require("../../assets/images/background.png")} style={styles.fruitBackground} />
          <Text style={styles.title}>Crear Cuenta</Text>
          
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Nombre completo"
              placeholderTextColor={"#20202099"}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) validateName(text);
              }}
              onFocus={() => Vibration.vibrate(25)} // Agregar vibración al enfocar el input
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor={"#20202099"}
              value={email}
              onChangeText={(text) => {
                setEmail(text.trim());
                if (emailError) validateEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => Vibration.vibrate(25)} // Agregar vibración al enfocar el input
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Contraseña"
              placeholderTextColor={"#20202099"}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
                if (confirmPassword && confirmPasswordError) {
                  validateConfirmPassword(confirmPassword);
                }
              }}
              secureTextEntry
              onFocus={() => Vibration.vibrate(25)} // Agregar vibración al enfocar el input
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputError : null]}
              placeholder="Confirmar contraseña"
              placeholderTextColor={"#20202099"}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) validateConfirmPassword(text);
              }}
              secureTextEntry
              onFocus={() => Vibration.vibrate(25)} // Agregar vibración al enfocar el input
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            
            <TouchableOpacity 
              style={[styles.button, isLoading ? styles.buttonDisabled : null]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => {
                Vibration.vibrate(25);
                navigation.navigate('Login');
              }}>
                <Text style={styles.loginLink}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0277BD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContainer: {
      flex: 1,
      paddingBottom: 50,
      paddingTop: 14,
      justifyContent: 'center',
      alignItems: 'center',
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
    fontSize: 50,
    fontFamily: 'Nunito-ExtraBold',
    marginBottom: 24,
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    fontFamily: "Nunito-SemiBold",
    color: '#0277BD',
  },
  inputError: {
    borderColor: '#fff',
    marginBottom: 4,
  },
  errorText: {
    fontFamily: "Nunito-Bold",
    color: '#fff',
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#93c5fd',
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
    marginHorizontal: 100,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#0277BD',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
    color: '#ffffffcc',
  },
  loginLink: {
    fontFamily: "Nunito-ExtraBold",
    fontSize: 14,
    color: '#00D8FF',
    fontWeight: '600',
  },
});