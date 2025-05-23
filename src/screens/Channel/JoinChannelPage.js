import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const JoinChannelPage = () => {
  const [channelCode, setChannelCode] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation(); 

  const handleJoinChannel = async () => {
    if (channelCode.trim() === '') {
      alert(t('join_channel.enter_channel_code'));
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert(t('join_channel.user_id_not_found'));
        return;
      }

      const user = await AsyncStorage.getItem('user');
      if (!user) {
        alert(t('join_channel.user_info_not_found'));
        return;
      }

      const parsedUser = JSON.parse(user);
      const username = parsedUser.username;

      const channelResponse = await fetch(`${API_URL}/api/channel-by-code/${channelCode}`);
      const channelData = await channelResponse.json();

      if (!channelResponse.ok || !channelData || !channelData._id) {
        alert(t('join_channel.channel_not_found'));
        return;
      }

      const channelId = channelData._id;

      const response = await fetch(`${API_URL}/api/join-channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, userId }),
      });

      const text = await response.text();

      if (response.ok) {
        alert(t('join_channel.joined_successfully'));
        navigation.navigate('MyChannelsPage', { refresh: true });
      } else {
        alert(t('join_channel.join_channel_error'));
      }
      
      const notificationData = {
        titleKey: 'join_channel.new_participant_notification_title', 
        messageKey: 'join_channel.new_participant_notification_message', 
        messageParams: { username },
        userId,
        channelId,
      };

      const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });

      const notificationResponseData = await notificationResponse.json();
      if (notificationResponse.ok) {
      } else {
      }

    } catch (error) {
      alert(t('join_channel.server_error'));
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={t('join_channel.channel_code')}
        value={channelCode}
        onChangeText={setChannelCode}
      />

      <TouchableOpacity style={styles.joinButton} onPress={handleJoinChannel}>
        <Text style={styles.joinButtonText}>{t('join_channel.join')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createChannelButton}
        onPress={() => navigation.navigate('CreateChannelPage')}
      >
        <Text style={styles.createChannelButtonText}>{t('join_channel.create_channel')}</Text>
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
