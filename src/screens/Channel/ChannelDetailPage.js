import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { ChannelContext } from '../../context/ChannelContext';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const ChannelDetailPage = ({ route ,navigation}) => {
  const [channel, setChannel] = useState(null);
  const [participants, setParticipants] = useState([]);
  const channelId = route.params?.channelId;
  const { t } = useTranslation();


  useEffect(() => {
    if (channelId) {
      fetchChannelDetails();
    }
  }, [channelId]); 

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/username/${userId}`);
      const data = await response.json();
      return data.username || t('channel_detail.user_data_not_found');
    } catch (error) {
      return t('channel_detail.user_data_not_found');
    }
  };
  const fetchChannelDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const url = `${API_URL}/api/channel/${channelId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setChannel(data);
      setParticipants(data.users || []); 

      if (data.users && Array.isArray(data.users)) {
        const userNames = data.users.map(user => user.username || t("channel_detail.unknown_user"));
        setParticipants(userNames);
      } else {
        setParticipants([]);
      }

      const loggedInChannel = await AsyncStorage.getItem('activeChannel');

    } catch (error) {
    }
  };

  const { activeChannelId, loginToChannel, logoutFromChannel } = useContext(ChannelContext);

  const isLoggedIn = activeChannelId === channelId;
  
  const toggleLogin = async () => {
    if (isLoggedIn) {
      await logoutFromChannel();
      navigation.navigate('ProfilePage');
    } else {
      await loginToChannel(channelId);
      navigation.navigate('ProfilePage');
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
        <Text>{t('channel_detail.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{channel?.name || t('channel_detail.unknown_channel')}</Text>
      <Text style={styles.details}>{t('channel_detail.channel_code_placeholder')}: {channel?.channelCode || t("channel_detail.none")}</Text>
      <Text style={styles.participantsHeader}>{t('channel_detail.participants')}:</Text>
      {participants.length > 0 ? (
        participants.map((participant, index) => (
          <Text key={index} style={styles.participant}>
            {participant}
          </Text>
        ))
      ) : (
        <Text style={styles.noParticipants}>{t('channel_detail.no_participants')}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={toggleLogin}>
         <Text style={styles.buttonText}>{isLoggedIn ? t('channel_detail.logout'): t('channel_detail.login')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20 
    },
  details: { 
    fontSize: 16,
    marginBottom: 10 
    },
  participantsHeader: { 
    fontSize: 18, 
    marginTop: 20, 
    fontWeight: 'bold' 
  },
  participant: { 
    fontSize: 16, 
    marginBottom: 5 
  },
  noParticipants: { 
    fontSize: 16, 
    color: '#666' 
  },
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
