import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';

const EventParticipantsList = () => {
  const route = useRoute();
  const { eventId, channelId } = route.params;
  const [participants, setParticipants] = useState([]);
  const [channelUsers, setChannelUsers] = useState([]);

  // Kanalın kullanıcılarını çekme
  useEffect(() => {
    fetch(`http://localhost:3000/api/channels/${channelId}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.users)) {
          console.log("Kanal Kullanıcıları:", data.users);
          setChannelUsers(data.users);
        } else {
          console.error("Geçersiz kanal verisi:", data);
          setChannelUsers([]);
        }
      })
      .catch(err => console.error("Kanal kullanıcılarını çekerken hata oluştu:", err));
  }, [channelId]);

  // Etkinlik katılımcılarını çekme
  useEffect(() => {
    fetch(`http://localhost:3000/api/event/${eventId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Etkinlik Verisi:", data);
      if (data && data.users) {
        setParticipants(data.users);
      } else {
        console.error("Geçersiz etkinlik verisi:", data);
        setParticipants([]);
      }
    })
    .catch(err => console.error("Etkinlik katılımcılarını çekerken hata oluştu:", err));
    }, [eventId]);

  // Kullanıcının etkinlik durumunu al
  const getUserStatus = (userId) => {
    if (!participants || !Array.isArray(participants)) return 'unknown'; // Güvenli kontrol
    const participant = participants.find(p => p.userId === userId);
    return participant?.status || 'unknown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <View style={styles.container}>
      <Text>Channel Users:</Text>
      <FlatList
        data={channelUsers}
        keyExtractor={(item) => item._id || Math.random().toString()} // Güvenli key
        renderItem={({ item }) => {
          const status = getUserStatus(item._id);
          return (
            <View style={styles.participant}>
              <Text>{item.username || 'No username'} {getStatusIcon(status)}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default EventParticipantsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  participant: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
