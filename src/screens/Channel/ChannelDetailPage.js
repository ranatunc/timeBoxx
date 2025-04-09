import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChannelDetailPage = ({ route }) => {
  const [channel, setChannel] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Oturum durumu
  const channelId = route.params?.channelId;
 
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/username/${userId}`);
      if (!response.ok) {
        throw new Error(`Kullanıcı API hatası: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.username || "Bilinmeyen Kullanıcı Adı";
    } catch (error) {
      console.error(`Kullanıcı ${userId} bilgisi alınamadı:`, error?.message || error);
      return "Bilinmeyen Kullanıcı";
    }
  };

  const fetchChannelDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('Kullanıcı ID bulunamadı!');
        return;
      }

      const url = `http://localhost:3000/api/channel/${channelId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Kanal detayları alınamadı:', response.statusText);
        return;
      }

      const data = await response.json();
      setChannel(data);

      // Eğer API yanıtında `users` dizisi zaten username içeriyorsa, fetchUserDetails çağrısına gerek yok
      if (data.users && Array.isArray(data.users)) {
        const userNames = data.users.map(user => user.username || "Bilinmeyen Kullanıcı");
        setParticipants(userNames);
      } else {
        setParticipants([]);
      }

      // Oturum açma durumu kontrolü
      const loggedInChannel = await AsyncStorage.getItem('activeChannel');
      setIsLoggedIn(loggedInChannel === channelId);

    } catch (error) {
      console.error('Hata:', error.message || error);
    }
  };

  // Oturumu açma / kapama işlemi
  const toggleLogin = async () => {
    if (isLoggedIn) {
      // Oturumu kapat
      await AsyncStorage.removeItem('activeChannel');
      setIsLoggedIn(false);
    } else {
      // Başka kanallardaki oturumları kapatıyoruz
      await AsyncStorage.removeItem('activeChannel');
      // Yeni kanal için oturumu aç
      await AsyncStorage.setItem('activeChannel', channelId);
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchChannelDetails();
    }
  }, [channelId]);

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{channel?.name || "Bilinmeyen Kanal"}</Text>
      <Text style={styles.details}>Kanal Kodu: {channel?.channelCode || "Yok"}</Text>
      <Text style={styles.participantsHeader}>Katılımcılar:</Text>
      {participants.length > 0 ? (
        participants.map((participant, index) => (
          <Text key={index} style={styles.participant}>
            {participant}
          </Text>
        ))
      ) : (
        <Text style={styles.noParticipants}>Henüz katılımcı yok.</Text>
      )}

      {/* Oturum açma / kapama butonu */}
      <TouchableOpacity style={styles.button} onPress={toggleLogin}>
        <Text style={styles.buttonText}>{isLoggedIn ? 'Oturumu Kapat' : 'Oturumu Aç'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  details: { fontSize: 16, marginBottom: 10 },
  participantsHeader: { fontSize: 18, marginTop: 20, fontWeight: 'bold' },
  participant: { fontSize: 16, marginBottom: 5 },
  noParticipants: { fontSize: 16, color: '#666' },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChannelDetailPage;
