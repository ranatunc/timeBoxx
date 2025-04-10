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
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }
    try {
      const response = await fetch('https://timeboxx.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
  
      if (data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user)); // Kullanıcı bilgisini sakla
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('username', data.user.username);
        setIsLoggedIn(true);
        navigation.navigate('Home'); // Profili aç
      } else {
        alert('Hatalı giriş!');
      }
    }catch (error) {      
      if (error.response) {
        if (error.response.status === 401) {
          // Geçersiz kullanıcı adı veya şifre hatasını Türkçeleştiriyoruz
          const errorMessage = error.response.data.message === 'Invalid credentials' 
            ? 'Geçersiz kullanıcı adı veya şifre!' 
            : error.response.data.message;
          
          Alert.alert('Hata', errorMessage); // Kullanıcıya Türkçe hata mesajını gösteriyoruz
        } else {
          const errorMessage = `Bir hata oluştu: ${error.response.statusText}`;
          Alert.alert('Hata', errorMessage); // Diğer hata mesajlarını da Türkçeleştirebiliriz
        }
      } else if (error.request) {
        console.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        Alert.alert('Hata', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Bir hata oluştu:', error.message);
        Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
    
    
  };
  

  const goToSignup = () => {
    navigation.navigate('Signup');  // Signup sayfasına yönlendir
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('/Users/ranatunc/timeBoxx/assets/login/logo.jpg')} />
      <View style={styles.bottomContainer}>
        <TextInput
          placeholder="Kullanıcı Adı"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Şifre"
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
