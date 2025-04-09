import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Rastgele renkler için bir dizi
const colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow'];

const HomePage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [username, setUsername] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [channelId, setChannelId] = useState(route.params?.channelId);

  useEffect(() => {
    const getActiveChannel = async () => {
      if (!channelId) {
        const storedChannelId = await AsyncStorage.getItem('activeChannel');
        if (storedChannelId) {
          setChannelId(storedChannelId);
          fetchEventsFromDatabase(storedChannelId);
        } else {
          console.error("HATA: Active channel verisi bulunamadı.");
        }
      } else {
        fetchEventsFromDatabase(channelId);
      }
    };

    getActiveChannel();
  }, [channelId]);

  useEffect(() => {
    const getUsername = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser && parsedUser.username) {
            setUsername(parsedUser.username);
          } else {
            console.log("Kullanıcı adı bulunamadı.");
          }
        } else {
          console.log("Kullanıcı verisi AsyncStorage'da bulunamadı.");
        }
      } catch (error) {
        console.error('Kullanıcı adı alınamadı:', error);
      }
    };
  
    getUsername();
  }, []);  

  const fetchEventsFromDatabase = async (channelId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${channelId}`);
      const data = await response.json();
  
      if (!data.events || !Array.isArray(data.events)) {
        console.error("HATA: API 'events' dizisini göndermedi!");
        return;
      }
  
      const formattedEvents = {};
      data.events.forEach((event) => {
        const formattedDate = new Date(event.date).toISOString().split('T')[0];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
        // Burada kullanıcı adını doğru şekilde alıyoruz
        const user = event.username ? event.username : "Bilinmeyen Kullanıcı";
  
        formattedEvents[formattedDate] = {
          id: event.id,
          marked: true,
          dotColor: randomColor,
          selected: true,
          selectedColor: randomColor,
          user: user,  // Kullanıcı adı buraya geliyor
          time: event.time,
          location: event.location,
          description: event.description,
        };
      });

      // API yanıtını ve veriyi kontrol etmek için log ekledim

      setMarkedDates(formattedEvents);
    } catch (error) {
      console.error("Etkinlikler alınamadı:", error);
    }
  };

  const handleDayPress = (day) => {

    const event = markedDates[day.dateString];  // Tıklanan günün etkinliğini al
  
    if (event) {
  
      if (!event.id) {
        console.error("HATA: event.id tanımsız! API'den eksik geliyor olabilir.");
        return;
      }
  
      navigation.navigate('EventDetailPage', { eventId: event.id ,channelId: channelId});  // eventId'yi gönder
    } else {
      console.error("HATA: Etkinlik bulunamadı!");
    }
  };
  
  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        markingType={'dot'} // Nokta işaretleme türünü belirt
        onDayPress={handleDayPress}
      />

      {isModalVisible && selectedEvent && (
        <Modal visible={isModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Etkinlik Detayları</Text>
              <Text style={styles.modalText}>Kullanıcı: {selectedEvent.user || "Bilinmeyen"}</Text>
              <Text style={styles.modalText}>Saat: {selectedEvent.time}</Text>
              <Text style={styles.modalText}>Yer: {selectedEvent.location}</Text>
              <Text style={styles.modalText}>Açıklama: {selectedEvent.description}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEventScreen', { channelId })}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEDF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    borderRadius: 10,
    elevation: 2,
    width: 400,
    height: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: -100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#28A745',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
