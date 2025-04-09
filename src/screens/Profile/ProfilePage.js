import React, { useState , useEffect} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const ProfilePage = ({ setIsLoggedIn }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Logout fonksiyonu
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('mail');
      await AsyncStorage.removeItem('telephone');
      await AsyncStorage.removeItem('profileImage')
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    fetchUser();
  }, []);


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
        { label: t("language"), screen: 'LanguagePage' },
        { label: t("location"), screen: 'LocationPage' },
        { label: t("privacy"), screen: 'PrivacyAndSecurityPage' },

      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handleNavigation(item.screen)} // Sayfa yönlendirme
        >
          <Text style={styles.menuItemText}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
        {/* Kanallarım Seçeneği */}


        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>{t("log_out")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.versionText}>App version 9.0.3</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', padding: 20 },
  profileImage: {
    width: 100,
    height: 100,
    marginTop: 70,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3a9188',
    marginBottom: 10,
  },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  profileEmail: { fontSize: 14, color: '#666', marginBottom: 10 },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  menu: { marginVertical: 20 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  menuItemText: { fontSize: 16 },
  logoutItem: { marginTop: 20 },
  logoutText: { color: 'red' },
  versionText: { textAlign: 'center', color: '#aaa', marginTop: 10 },
});

export default ProfilePage;
