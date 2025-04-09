import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JoinChannelPage = () => {
  const [channelCode, setChannelCode] = useState('');
  const navigation = useNavigation();

  const handleJoinChannel = async () => {
    if (channelCode.trim() === '') {
      alert('Lütfen kanal kodunu girin.');
      return;
    }
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('Kullanıcı kimliği bulunamadı!');
        return;
      }
  
      // Kullanıcı bilgisini AsyncStorage'dan al
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        alert('Kullanıcı bilgisi bulunamadı!');
        return;
      }
  
      const parsedUser = JSON.parse(user);
      const username = parsedUser.username;  // Kullanıcı adını al
  
      // Kanal koduna göre kanal bilgilerini al
      const channelResponse = await fetch(`http://localhost:3000/api/channel-by-code/${channelCode}`);
      const channelData = await channelResponse.json();
  
      if (!channelResponse.ok || !channelData || !channelData._id) {
        alert('Kanal bulunamadı!');
        return;
      }
  
      const channelId = channelData._id; // Kanal ID
  
      // Kanala katılma isteği gönder
      const response = await fetch('http://localhost:3000/api/join-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, userId }),
      });
  
      const text = await response.text();
      console.log('Kanala katılma cevabı:', text);
  
      if (response.ok) {
        alert('Kanala başarıyla katıldınız!');
        navigation.navigate('MyChannelsPage', { refresh: true });
      } else {
        console.error('Kanala katılma hatası:', text);
        alert(`Hata: ${text}`);
      }
  
      // Bildirim oluşturma
      const notificationData = {
        title: 'Yeni Katılımcıı !!📣',
        message: `Kanala ${username} kişisi katıldı.`,  // Burada kullanıcı adını kullandık
        userId, 
        channelId: channelId, 
      };
  
      const notificationResponse = await fetch('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });
  
      const notificationResponseData = await notificationResponse.json();
      if (notificationResponse.ok) {
        console.log('Bildirim başarıyla oluşturuldu:', notificationResponseData);
      } else {
        console.error('Bildirim hatası:', notificationResponseData.message);
      }
  
    } catch (error) {
      console.error('Sunucu hatası:', error);
      alert('Sunucu hatası! Lütfen tekrar deneyin.');
    }
  };
  
  

  return (
    <View style={styles.container}>
      {/* Kanal Kodu Girişi */}
      <TextInput
        style={styles.input}
        placeholder="Kanal Kodu"
        value={channelCode}
        onChangeText={setChannelCode}
      />

      {/* Kanala Katıl Butonu */}
      <TouchableOpacity style={styles.joinButton} onPress={handleJoinChannel}>
        <Text style={styles.joinButtonText}>Katıl</Text>
      </TouchableOpacity>

      {/* Kanal Oluştur Sayfasına Git */}
      <TouchableOpacity
        style={styles.createChannelButton}
        onPress={() => navigation.navigate('CreateChannelPage')}
      >
        <Text style={styles.createChannelButtonText}>Kanal Oluştur</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3a9188',
    borderRadius: 10,
  },
  joinButton: {
    backgroundColor: '#3a9188',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  joinButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  createChannelButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  createChannelButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default JoinChannelPage;
