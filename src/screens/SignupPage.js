import React, { useState, useContext, useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Modal, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Dropdown } from 'react-native-element-dropdown'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '/Users/ranatunc/Desktop/timeBoxx/src/Language/LanguageContext.js';
import { TouchableWithoutFeedback } from 'react-native'; 
import AntDesign from 'react-native-vector-icons/AntDesign';


const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState(''); 
  const [verificationCode, setVerificationCode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useContext(LanguageContext);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const genderOptions = [
    { label: t('male'), value: 'male' },
    { label: t('female'), value: 'female' },
    { label: t('other'), value: 'other' },
  ];

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };
  
  useLayoutEffect(() => {
    if (i18n && i18n.language) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={toggleLanguageModal}
            style={styles.languageButton}
          >
            <Text style={styles.languageText}>{i18n.language === 'tr' ? '🇹🇷' : '🇬🇧'}</Text>
            <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
            <AntDesign name="down" size={20} color="#808080" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, i18n.language]);
  

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLanguageModalVisible(false);
  };


  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength(t('weak'));
    } else if (password.length < 12) {
      setPasswordStrength(t('medium'));
    } else {
      setPasswordStrength(t('strong'));
    }
  };

  const handleSignup = async () => {
    if (!username || !password || !mail || !firstName || !lastName || !gender) {
      Alert.alert(t('signup'), t('errorFillFields'));
      return;
    }

    if (!mail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert(t('signup'), t('errorEmail'));
      return;
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      Alert.alert(t('signup'), t('errorPassword'));
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
      const response = await axios.post(`${API_URL}/api/send-code`, userData);
      if (response.data.success) {
        setTempUserData(userData);
        const user = response.data.user;
        if (user) {
          await AsyncStorage.setItem('mail', JSON.stringify(mail));
          await AsyncStorage.setItem('userId', user._id);
          await AsyncStorage.setItem('username', user.username);
        }
        setIsModalVisible(true);
      } else {
        Alert.alert(t('signup'), response.data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(t('signup'), t('signupFail'));
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
        Alert.alert(t('signup'), t('emailNotFound'));
        return;
      }

      const response = await axios.post(`${API_URL}/api/verify-code`, {
        mail: parsedMail,
        verificationCode,
      });

      if (response.data.success) {
        Alert.alert(t('signup'), t('signupSuccess'));
        setIsModalVisible(false);
        navigation.navigate('Login');
      } else {
        Alert.alert(t('signup'), response.data.message);
      }
    } catch (error) {
      Alert.alert(t('signup'), t('serverError'));
    }
  };

  const verifyCodeClear = () => {
    setVerificationCode('');
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('/Users/ranatunc/Desktop/timeBoxx/assets/login/logo5.png')} />
      <View style={styles.bottomContainer}>
        <TextInput
          placeholder={t('username')}
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder={t('email')}
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          keyboardType="email-address"
          value={mail}
          onChangeText={setMail}
        />

        <TextInput
          placeholder={t('firstName')}
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          placeholder={t('lastName')}
          style={styles.input}
          placeholderTextColor="#C2F7DA"
          value={lastName}
          onChangeText={setLastName}
        />

        <Dropdown
          style={styles.dropdown}
          data={genderOptions}
          labelField="label"
          valueField="value"
          value={gender}
          placeholder={t('selectGender')}
          onChange={(item) => setGender(item.value)}
          placeholderStyle={{ color: '#C2F7DA' }}
          selectedTextStyle={{ color: '#C2F7DA' }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder={t('password')}
            style={styles.passwordInput}
            placeholderTextColor="#C2F7DA"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              checkPasswordStrength(text);
            }}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconButton}>
            <Icon name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} color="#C2F7DA" />
          </TouchableOpacity>
        </View>
        <Text style={styles.strengthText}>{passwordStrength}</Text>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>{t('signupTitle')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.noAccountText}>{t('haveAccount')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('verificationCode')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterCode')}
              placeholderTextColor="#C2F7DA"
              keyboardType="numeric"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            <TouchableOpacity style={styles.signupButton} onPress={verifyCode}>
              <Text style={styles.signupButtonText}>{t('verify')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={verifyCodeClear}>
              <Text style={styles.signupButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContainerLang}>
            <TouchableWithoutFeedback>
              <View style={styles.languageTooltip}>
                <TouchableOpacity style={styles.langOption} onPress={() => handleLanguageChange('tr')}>
                  <Text style={styles.langText}>🇹🇷 Türkçe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.langOption} onPress={() => handleLanguageChange('en')}>
                  <Text style={styles.langText}>🇬🇧 English</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    width: 150,
    height: 150,
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
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContent: {
     width: '80%', 
     padding: 20, 
     backgroundColor: '#333', 
     borderRadius: 10, 
     alignItems: 'center' 
    },
  modalTitle: { 
    fontSize: 18, 
    color: '#fff', 
    marginBottom: 10 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 50,
    width: '100%',
  },
  iconButton: {
    paddingHorizontal: 5,
  },
  strengthText: {
    color: '#C2F7DA',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    height: '100%',
  },
  iconButton: {
    paddingHorizontal: 5,
  },
  modalContainerLang: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 15,
    backgroundColor: 'transparent',
    marginTop:30,
  },
  languageTooltip: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  langOption: {
    paddingVertical: 6,
  },
  langText: {
    fontSize: 16,
    color: '#333',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10, 
  },
  languageText: {
    fontSize: 16,
    marginRight: 5,
    color: '#fff',
  },

  languageHeader: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 0,
    padding: 15,
    backgroundColor: '#f5f5f5',
    zIndex: 10,
    marginTop:30,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageDropdown: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});