import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../Language/LanguageContext';
import { TouchableWithoutFeedback, Keyboard } from 'react-native'; 
import { AntDesign } from '@expo/vector-icons';
import { ChannelContext } from '../../context/ChannelContext';
import i18n from '../../Language/i18n' 


const ProfilePage = ({ setIsLoggedIn }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { changeLanguage } = useContext(LanguageContext);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const { logoutFromChannel } = useContext(ChannelContext);


  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'mail', 'profileImage']);
      await logoutFromChannel(); 
      setIsLoggedIn(false);
    } catch (error) {
    }
  };
  

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    fetchUser();
  }, []);
  
  useLayoutEffect(() => {
    if (i18n){
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

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>

        <Image
          source={user?.profileImage ? { uri: user?.profileImage } : { uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user?.username}</Text>
        <Text style={styles.profileEmail}>{user?.mail || "Lütfen mailinizi giriniz."}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfilePage')}
        >
          <Text style={styles.editButtonText}>{t("edit_profile")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyChannelsPage')}
        >
            <Text style={styles.menuItemText}>{t("channel")}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        {[
          { label: t("password"), screen: 'PasswordPage' },
          { label: t("privacy"), screen: 'PrivacyAndSecurityPage' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
          >
            <Text style={styles.menuItemText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>{t("log_out")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.versionText}>App version 0.0.1</Text>

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

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5' 
    },
  header: { 
    alignItems: 'center' 
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3a9188',
    marginBottom: 10,
  },
  profileName: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  profileEmail: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 10 
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: { 
    color: '#fff', 
    fontWeight: 'bold'
   },
  menu: { 
    marginVertical: 20 
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  menuItemText: { 
    fontSize: 16 
  },
  logoutItem: { 
    marginTop: 20 
  },
  logoutText: { 
    color: 'red' 
  },
  versionText: { 
    textAlign: 'center', 
    color: '#aaa', 
    marginTop: 10 
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

export default ProfilePage;
