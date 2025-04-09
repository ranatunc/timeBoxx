import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const MyChannelsPage = () => {
  const [channels, setChannels] = useState([]);
  const [isUserMember, setIsUserMember] = useState(false);
  const navigation = useNavigation();

  const fetchChannels = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('Kullanıcı ID bulunamadı!');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/user-channels/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setChannels(data);
        setIsUserMember(data.length > 0);
      } else {
        console.error('Kanal listesi alınamadı:', data);
      }
    } catch (error) {
      console.error('Hata:', error);
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
                navigation.navigate('ChannelDetailPage', { channelId: item._id }) // Kanala tıklandığında detay sayfasına yönlendiriyoruz
              }
            >
              <Text style={styles.channelName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noChannelsContainer}>
          <Text style={styles.noChannelsText}>Henüz bir kanala üye değilsiniz.</Text>
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
