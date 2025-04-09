import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Modal, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage import
import { Dropdown } from 'react-native-element-dropdown'; // Dropdown import

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState(''); // Cinsiyet için state
  const [verificationCode, setVerificationCode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const navigation = useNavigation();


  const genderOptions = [
    { label: 'Erkek', value: 'male' },
    { label: 'Kadın', value: 'female' },
    { label: 'Diğer', value: 'other' },
  ];
  const handleSignup = async () => {
    // Validate input
    if (!username || !password || !mail || !firstName || !lastName || !gender) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }

    // Validate email format
    if (!mail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin!');
      return;
    }

    const userData = {
      username,
      password,
      mail, 
      firstName,
      lastName,
      gender,
    };

    try {
      const response = await axios.post('http://localhost:3000/api/send-code', userData);
      if (response.data.success) {
        setTempUserData(userData);
        setIsModalVisible(true);

        // AsyncStorage'a mail kaydediyoruz
        await AsyncStorage.setItem('mail', JSON.stringify(mail));
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('username', data.user.username);
      } else {
        Alert.alert('Hata', response.data.message);
      }
    } catch (error) {
      console.log("Hata:", error.response || error.message);       
      Alert.alert('Hata', 'Doğrulama kodu gönderilirken bir hata oluştu.');
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  const verifyCode = async () => {
    try {
      const storedMail = await AsyncStorage.getItem('mail');
      const parsedMail = storedMail ? JSON.parse(storedMail) : '';
  
      if (!parsedMail) {
        Alert.alert('Hata', 'Kayıtlı e-posta bulunamadı!');
        return;
      }
  
      const response = await axios.post('http://localhost:3000/api/verify-code', {
        mail: parsedMail,
        verificationCode,
      });
  
      if (response.data.success) {
        Alert.alert('Başarı', 'Kayıt başarıyla tamamlandı!');
        setIsModalVisible(false);
        navigation.navigate('Login');
      } else {
        Alert.alert('Hata', response.data.message);
      }
    } catch (error) {
      console.error('Doğrulama hatası:', error.response?.data || error.message);
      Alert.alert('Hata', 'Sunucuya erişim hatası veya yanlış kod!');
    }
  };
  

  const verifyCodeClear = () => {
    setVerificationCode('');
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('../../assets/login/logo.jpg')} />
      <View style={styles.bottomContainer}>
        <TextInput
          placeholder="Kullanıcı Adı"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={username}
          onChangeText={setUsername}
        />
  
        <TextInput
          placeholder="E-posta"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          keyboardType="email-address"
          value={mail}
          onChangeText={setMail}
        />
        
        <TextInput
          placeholder="Ad"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          placeholder="Soyad"
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Cinsiyet Seçimi */}
        <Dropdown
          style={styles.dropdown}
          data={genderOptions}
          labelField="label"
          placeholderStyle={{ color: '#C2F7DA' }} 
          selectedTextStyle={{ color: '#C2F7DA' }} 
          valueField="value"
          placeholder="Cinsiyet Seçin"
          value={gender}
          onChange={item => setGender(item.value)}
        />
        <TextInput
          placeholder="Şifre"
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

      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Doğrulama Kodu</Text>
            <TextInput
              style={styles.input}
              placeholder="Kodu Girin"
              placeholderTextColor="#C2F7DA"
              keyboardType="numeric"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            <TouchableOpacity style={styles.signupButton} onPress={verifyCode}>
              <Text style={styles.signupButtonText}>Doğrula</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={verifyCodeClear}>
              <Text style={styles.signupButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  dropdown: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    color: '#fff',
    paddingLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontWeight: 'bold',
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
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, color: '#fff', marginBottom: 10 }
});
