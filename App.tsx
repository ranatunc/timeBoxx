import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from "react-native";

export default function App() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [mail, setMail]= useState('')

  const handleLogin = async () => {
    if (!username || !password || !mail) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, mail }),
      });
  
      const data = await response.json();
      console.log('Response:', response); // Tüm response nesnesini yazdırıyoruz
      console.log('Response Data:', data); // Gelen veriyi yazdırıyoruz
  
      if (response.ok) {
        Alert.alert('Success', `Welcome ${data.user.username}!`);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.log('Error:', error); // Hata mesajlarını konsola yazdırdık
      Alert.alert('Error', 'Unable to connect to server.');
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/logın/logo.jpg')} 
        style={styles.image}
      />
      
      <View style={styles.bottomContainer}>
        <TextInput
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={username}
          onChangeText={setUsername} // Kullanıcı adı güncelleme işlemi yapıyoruz
        />
        <TextInput
          placeholder="Mail"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={mail}
          onChangeText={setMail} 
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          secureTextEntry
          value={password}
          onChangeText={setPassword} // Şifre güncelleme işlemi yapıyoruz
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>KAYIT OL</Text>
        </TouchableOpacity>
        <Text style={styles.noAccountText}>Hesabın var mı? Giriş yap!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', 
  },
  image: {
    width: 150,  
    height: 150, 
    marginBottom: 150, 
    borderRadius: 75,
  },
  bottomContainer: {
    width: '80%',
    alignItems: 'center',
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
    width: '100%',
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
