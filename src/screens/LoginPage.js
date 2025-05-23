import React, { useState, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Modal} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '/Users/ranatunc/Desktop/timeBoxx/src/Language/LanguageContext.js';
import { TouchableWithoutFeedback } from 'react-native'; 
import AntDesign from 'react-native-vector-icons/AntDesign';

const LoginPage = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useContext(LanguageContext);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);


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

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(t('login'), t('errorFillFields'));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(t('login'), data.message || t('loginFailed'));
        return;
      }

      if (data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('loggedUserId', data.user._id);
        await AsyncStorage.setItem('username', data.user.username);
        setIsLoggedIn(true);
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert(t('login'), t('serverError'));
    }
  };

  const goToSignup = () => {
    navigation.navigate('Signup');
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

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t('password')}
            style={styles.passwordInput}
            placeholderTextColor="#C2F7DA"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconButton}>
            <Icon name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} color="#C2F7DA" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{t('login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToSignup}>
          <Text style={styles.noAccountText}>{t('dontHaveAccountSignup')}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContainer}>
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

export default LoginPage;

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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    marginBottom: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
  },
  eyeText: {
    fontSize: 18,
    color: '#C2F7DA',
    paddingHorizontal: 10,
  },
  modalContainer: {
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