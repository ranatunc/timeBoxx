import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const CreateChannelPage = () => {
  const [channelName, setChannelName] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString());
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    const checkUserInfo = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedUsername = await AsyncStorage.getItem('username');

      if (!storedUserId || !storedUsername) {
        alert(t('create_channel.missing_user_info'));
        return;
      }

      setUserId(storedUserId);
      setUsername(storedUsername);
    };

    checkUserInfo();
  }, []);

  const handleCreateChannel = async () => {
    if (!userId || !username) {
      alert(t('create_channel.missing_user_info'));
      return;
    }

    if (channelName.trim() === '' || selectedCommunity === '') {
      alert(t('create_channel.fill_all_fields'));
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
      const response = await fetch(`${API_URL}/api/channelCreate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('create_channel.created_successfully', { channelName: data.channel.name }));
        navigation.navigate('MyChannelsPage', { refresh: true });
        setChannelName('');
        setSelectedCommunity('Teknoloji');
      } else {
        alert(`${t('create_channel.error_creating_channel')} ${data.message || t('create_channel.unknown_error')}`);
      }
    } catch (error) {
      alert(t('create_channel.server_error'));
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('create_channel.channel_name_placeholder')}
        value={channelName}
        onChangeText={setChannelName}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCommunity}
          onValueChange={(itemValue) => setSelectedCommunity(itemValue)}
        >
          <Picker.Item label={t('create_channel.select_community')} value="" />
          <Picker.Item label={t("create_channel.technology")} value="Teknoloji" />
          <Picker.Item label={t("create_channel.entertainment")} value="Eğlence" />
          <Picker.Item label={t("create_channel.games")} value="Oyun" />
          <Picker.Item label={t("create_channel.spor" )}value="Spor" />
          <Picker.Item label={t("create_channel.music")} value="Müzik" />
          <Picker.Item label={t("create_channel.family")} value="Aile" />
          <Picker.Item label={t("create_channel.friends")} value="Arkadaş" />
          <Picker.Item label={t("create_channel.business")} value="İş" />

        </Picker>
      </View>
      <Text style={styles.dateText}>
        {t('create_channel.date')}: {new Date(currentDate).toLocaleString()}
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateChannel}>
        <Text style={styles.createButtonText}>{t('create_channel.create')}</Text>
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
