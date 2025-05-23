import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const MyChannelsPage = () => {
  const [channels, setChannels] = useState([]);
  const [isUserMember, setIsUserMember] = useState(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const fetchChannels = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const response = await fetch(`${API_URL}/api/user-channels/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setChannels(data);
        setIsUserMember(data.length > 0);
      } else {
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <View style={styles.container}>
      {isUserMember ? (
        <FlatList
          data={channels}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.channelItem}
              onPress={() =>
                navigation.navigate('ChannelDetailPage', { channelId: item._id }) 
              }
            >
              <Text style={styles.channelName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noChannelsContainer}>
            <Text style={styles.noChannelsText}>{t('my_channels.no_membership')}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('JoinChannelPage')}
      >
        <Ionicons name="add" size={30} color="white" />
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
  channelItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  channelName: { 
    fontSize: 16 
  },
  noChannelsContainer: { 
    alignItems: 'center',
     marginTop: 50 
    },
  noChannelsText: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 10 
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 10,
  },
});

export default MyChannelsPage;
