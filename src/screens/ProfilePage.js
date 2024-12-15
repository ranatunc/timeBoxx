import React from 'react'
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = ({ setIsLoggedIn }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Kullanıcı verilerini sil
      setIsLoggedIn(false); // Oturum durumunu güncelle
    } catch (error) {
      console.error('Error during logout', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text>bays</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

export default ProfilePage;