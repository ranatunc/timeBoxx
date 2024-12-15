import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Telephone ikonunu eklemek için

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [isMailInput, setIsMailInput] = useState(true); // Mail inputu mu telefon inputu mu kontrolü
  const navigation = useNavigation();

  const handleSignup = async () => {
    // Geçerli girdi kontrolü
    if (!username || !password || (!mail && !telephone)) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    // E-posta format kontrolü
    if (!isMailInput && telephone.length !== 10) {
      Alert.alert('Error', 'Telephone number must be 10 digits!');
      return;
    }

    if (isMailInput) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // E-posta formatı kontrolü
      if (!emailPattern.test(mail)) {
        Alert.alert('Error', 'Please enter a valid email address!');
        return;
      }
    } else {
      const phonePattern = /^\d+$/; // Telefon numarasının yalnızca rakam olmasını kontrol et
      if (!phonePattern.test(telephone)) {
        Alert.alert('Error', 'Telephone number must contain only numbers!');
        return;
      }
    }

    // Kayıt işlemini burada gerçekleştirin
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // Inputu mailden telefona değiştirme işlevi
  const toggleInputType = () => {
    setIsMailInput(!isMailInput);
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

        {/* Mail veya Telephone inputu */}
        <View style={styles.inputWithIcon}>
          <TextInput
            placeholder={isMailInput ? "Mail" : "Telephone"}
            style={styles.inputFlex}
            placeholderTextColor="#C2F7DA"
            keyboardType={isMailInput ? "email-address" : "phone-pad"}
            value={isMailInput ? mail : telephone}
            onChangeText={isMailInput ? setMail : setTelephone}
            maxLength={isMailInput ? 30 : 11} // E-posta için 30, telefon için 10 karakter limiti
          />
          <TouchableOpacity onPress={toggleInputType}>
            <Ionicons 
              name={isMailInput ? "call-outline" : "mail-outline"} 
              size={24} 
              color="#C2F7DA" 
              style={styles.iconStyle}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Password"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>KAYIT OL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.noAccountText}>Hesabın var mı? Giriş yap!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupPage;

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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    height: 50,
  },
  inputFlex: {
    flex: 1,
    color: '#fff',
    paddingLeft: 15,
  },
  iconStyle: {
    paddingRight: 15,
  },
  signupButton: {
    width: '75%',
    height: 50,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noAccountText: {
    color: '#C2F7DA',
    fontSize: 14,
  },
});