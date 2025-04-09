import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateChannelPage = () => {
  const [channelName, setChannelName] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString()); // Anlık tarih durumu
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const navigation = useNavigation();

  // Kullanıcı bilgilerini kontrol et ve state'e kaydet
  useEffect(() => {
    const checkUserInfo = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedUsername = await AsyncStorage.getItem('username');
  
      if (!storedUserId || !storedUsername) {
        alert('Kullanıcı bilgileri eksik! Lütfen tekrar giriş yapın.');
        return;
      }
  
      setUserId(storedUserId);
      setUsername(storedUsername);
    };
  
    checkUserInfo();
  }, []);
  

  const handleCreateChannel = async () => {
    if (!userId || !username) {
      alert('Kullanıcı bilgileri eksik! Lütfen tekrar giriş yapın.');
      return;
    }

    if (channelName.trim() === '' || selectedCommunity === '') {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    const newChannel = {
      name: channelName,
      createdAt: currentDate,
      communityName: selectedCommunity,
      channelCode: Math.random().toString(36).substr(2, 8),
      userId,
      username,
    };

    try {
      const response = await fetch('http://localhost:3000/api/channelCreate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel),
      });

      const data = await response.json(); // JSON formatında veriyi al

      if (response.ok) {
        alert(`Kanal oluşturuldu: ${data.channel.name}`);
        navigation.navigate('MyChannelsPage', { refresh: true });
        setChannelName('');
        setSelectedCommunity('Teknoloji');
      } else {
        console.error('Kanal oluşturma hatası:', data);
        alert(`Hata: ${data.message || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Sunucu hatası:', error);
      alert('Sunucu hatası! Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Kanal Adı"
        value={channelName}
        onChangeText={setChannelName}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCommunity}
          onValueChange={(itemValue) => setSelectedCommunity(itemValue)}
        >
          <Picker.Item label="Topluluk Seçiniz" value="" />
          <Picker.Item label="Teknoloji" value="Teknoloji" />
          <Picker.Item label="Eğlence" value="Eğlence" />
          <Picker.Item label="Oyun" value="Oyun" />
          <Picker.Item label="Spor" value="Spor" />
          <Picker.Item label="Müzik" value="Müzik" />
        </Picker>
      </View>
      <Text style={styles.dateText}>Tarih: {new Date(currentDate).toLocaleString()}</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateChannel}>
        <Text style={styles.createButtonText}>Oluştur</Text>
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
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  createButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  dateText: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 10 
  },
});

export default CreateChannelPage;
