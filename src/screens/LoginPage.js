import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    // Kullanıcı adı ve şifre kontrolü
    if (username === 'Admin' && password === '1234') {
      try {
        await AsyncStorage.setItem('user', JSON.stringify({ username }));
        setIsLoggedIn(true);  // Kullanıcı giriş yaptıktan sonra oturum durumunu güncelle
        navigation.navigate('Home');
      } catch (error) {
        console.log('Error saving data', error);
      }
    } else {
      Alert.alert('Error', 'Invalid credentials!');
    }
  };

  const goToSignup = () => {
    navigation.navigate('Signup');  // Signup sayfasına yönlendir
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('../../assets/login/logo.jpg')} />
      <View style={styles.bottomContainer}>
        <TextInput
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToSignup}>
          <Text style={styles.noAccountText}>Hesabın yok mu? Kayıt Ol!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 75,
  },
  bottomContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 60,
  },
  input: {
    width: '100%',
    height: 50,
    marginBottom: 10,
    backgroundColor: '#333',
    color: '#fff',
    paddingLeft: 15,
    borderRadius: 10,
  },
  loginButton: {
    marginTop: 35,
    width: '75%',
    height: 50,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noAccountText: {
    color: '#C2F7DA',
    fontSize: 14,
  },
});
