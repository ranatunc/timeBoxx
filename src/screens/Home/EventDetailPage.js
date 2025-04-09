import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;  // Parametreyi alıyoruz
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const channelId = route.params?.channelId;

  useLayoutEffect(() => {
    if (event && loggedUserId) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteEvent}> 
            <Icon name="trash" size={25} color="red" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, event, loggedUserId]);
  
  useEffect(() => {
    const getLoggedUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setLoggedUserId(userId);
          console.log("Kullanıcı ID'si alındı:", userId);
        } else {
          console.log("Kullanıcı ID'si bulunamadı.");
        }
      } catch (error) {
        console.error('Kullanıcı ID alınamadı:', error);
      }
    };

    getLoggedUserId();

    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/event/${eventId}`);
        const data = await response.json();
    
        if (data && data.users) {
          setEvent(data);
        } else {
          console.error("Etkinlik verilerinde kullanıcılar dizisi bulunamadı");
          alert("Etkinlik kullanıcı bilgileri eksik");
        }
      } catch (error) {
        console.error("Etkinlik getirilemedi:", error);
        alert("Bir hata oluştu: " + error.message); 
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [eventId]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const titleFormatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDeleteEvent = async () => {
    console.log('Silme butonuna basıldı');
    console.log("Event:", event);
    console.log("Logged User ID:", loggedUserId);

    if (!event || !event.users || !loggedUserId) {
      console.error('Etkinlik veya kullanıcı verisi eksik!');
      alert('Etkinlik veya kullanıcı verisi eksik!');
      return;
    }
    
    if (!event.users.includes(loggedUserId)) {
      alert('Bu etkinliği siz oluşturmadınız veya katılımcı değilsiniz, silemezsiniz.');
      return;
    }
    
    console.log("Alert.show() öncesi");
  
    Alert.alert(
      'Etkinliği Sil',
      'Bu etkinliği silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          onPress: async () => {
            console.log('Silme işlemi başlatılıyor...');
            try {
              const response = await fetch(`http://localhost:3000/api/event/${eventId}`, {
                method: 'DELETE',
              });
              const text = await response.text();
              console.log("Delete Response:", text);
    
              const result = JSON.parse(text);
              if (response.ok) {
                alert('Etkinlik başarıyla silindi');
                
                // Sending a notification after successful deletion
                const notificationData = {
                  title: 'Etkinlik Silindi',
                  message: `${event.username} etkinliği ${formatDate(new Date())} tarihinde silindi.`,
                  eventId: event._id,
                  userId: loggedUserId, // Event creator (logged user)
                };

                const notificationResponse = await fetch('http://localhost:3000/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(notificationData),
                });

                const notificationResponseData = await notificationResponse.json();

                if (!notificationResponse.ok) {
                  throw new Error(notificationResponseData.message || 'Bildirim oluşturulamadı');
                }

                navigation.navigate('HomePage', { refresh: true });
              } else {
                alert('Etkinlik silinirken bir hata oluştu');
              }
            } catch (error) {
              console.error('Etkinlik silinemedi:', error);
              alert('Bir hata oluştu: ' + error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!event || !event.channelId) {
      console.error("❌ Hata: channelId tanımlı değil!");
      alert("Kanal bilgisi eksik, işlem yapılamıyor!");
      return;
    }
  
    console.log("🛠 Gönderilen eventId:", eventId);
    console.log("🛠 Gönderilen userId:", loggedUserId);
    console.log("🛠 Gönderilen channelId:", event.channelId); // Kanal ID'yi buradan al
    console.log("🛠 Gönderilen status:", newStatus);
  
    try {
      const response = await fetch(`http://localhost:3000/api/events/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId: loggedUserId, status: newStatus, channelId: event.channelId }),
      });
  
      const responseText = await response.text();
      console.log("🔍 API Yanıtı:", responseText);
  
      const data = JSON.parse(responseText);
      if (response.ok) {
        setStatus(newStatus);  // Durumu UI'da güncelle
        await AsyncStorage.setItem(`eventStatus-${eventId}`, newStatus);  // Her etkinlik için ayrı kaydet
      } else {
        alert(data.message || "Bir hata oluştu.");
      }
    } catch (error) {
      console.error("❌ Status güncellenemedi:", error);
      alert("Bir hata oluştu: " + error.message);
    }
  };
  
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem(`eventStatus-${eventId}`);
        if (savedStatus) {
          setStatus(savedStatus);  // Seçili etkinlik için durumu yükle
        }
      } catch (error) {
        console.error('Durum yüklenemedi:', error);
      }
    };
  
    if (eventId) {
      loadStatus();  // Etkinlik ID'sine göre durumu yükle
    }
  }, [eventId]);
  
  
  
  if (loading) {
    return <Text>Yükleniyor...</Text>;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => {
          console.log("Navigating to EventParticipantsList with eventId:", eventId);
          console.log("Event channelId:", event.channelId);
      
          if (!eventId || !event.channelId) {
            console.error("eventId veya channelId eksik!");
            alert("Etkinlik ID veya kanal ID eksik!");
            return;
          }
      
          navigation.navigate('EventParticipantsList', { channelId: event.channelId, eventId });
        }}
      >
        <Text style={styles.buttonText}>Katılımcıları Gör</Text>
      </TouchableOpacity>
        <Text style={styles.profileName}>{titleFormatDate(event.date)}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="person" size={20} color="#000" />
          <Text style={styles.menuItemText}>{event.username}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={20} color="#000" />
          <Text style={styles.menuItemText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location" size={20} color="#000" />
          <Text style={styles.menuItemText}>{event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="document-text" size={20} color="#000" />
          <Text style={styles.menuItemText}>{event.description}</Text>
        </View>
      </View>

    {status === null || status === 'pending' ? (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleStatusUpdate('approved', channelId)}>
          <Text style={styles.buttonText}>Onayla</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleStatusUpdate('rejected', channelId)}>
          <Text style={styles.buttonText}>Reddet</Text>
        </TouchableOpacity>
      </View>
    ) : status === 'approved' ? (
      <View style={styles.statusContainer}>
        <Text style={styles.approvedText}>✅ Bu etkinliğe katılım sağlamayı onayladınız</Text>
      </View>
    ) : status === 'rejected' ? (
      <View style={styles.statusContainer}>
        <Text style={styles.rejectedText}>❌ Bu etkinliğe katılım sağlamayı onaylamadınız</Text>
      </View>
    ) : (
      <View style={styles.statusContainer}>
        <Text style={styles.pendingText}>⏳ Durumunuz beklemede</Text>
      </View>
    )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { alignItems: 'center', padding: 20 },
  profileName: { fontSize: 20, fontWeight: 'bold' },
  detailsContainer: { marginVertical: 20 },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 10 
  },
  menuItemText: { 
    fontSize: 16,    
    marginLeft: 10,
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 20 
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  rejectButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  statusContainer: { marginTop: 20, alignItems: 'center' },
  approvedText: { color: 'green', fontWeight: 'bold' },
  rejectedText: { color: 'red', fontWeight: 'bold' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  deleteButtonText: { 
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default EventDetailPage;
