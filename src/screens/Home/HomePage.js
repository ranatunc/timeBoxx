import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChannelContext } from '../../context/ChannelContext';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 


const HomePage = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const [filterType, setFilterType] = useState('all');
  const [username, setUsername] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { activeChannelId } = useContext(ChannelContext);
  const [channelId, setChannelId] = useState(activeChannelId);
  const [unreadCount, setUnreadCount] = useState(0);


  
  const colors = [
    '#FF6F61', '#FF8C42', '#F4A261', '#E76F51', '#D62828',
    '#7FB800', '#6FCF97', '#2E8B57', '#228B22', '#20B2AA', '#1E90FF',
    '#6495ED', '#4169E1', '#6A5ACD', '#483D8B', '#191970',
    '#8A2BE2', '#BA55D3', '#DA70D6', '#9932CC', '#9400D3',
    '#C71585', '#FF69B4', '#DB7093', '#E9967A', '#FA8072',
    '#CD853F', '#D2691E', '#A0522D', '#8B4513',
    '#556B2F', '#6B8E23', '#9ACD32', '#FFA500', '#FFB347', '#E1AD01', '#C49E35'
  ];

  useEffect(() => {
    if (activeChannelId) {
      setChannelId(activeChannelId);
      fetchEventsFromDatabase(activeChannelId);
    } else {
      setChannelId(null);
    }
  }, [activeChannelId]);

  useEffect(() => {
    const getUsername = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser?.username) {
            setUsername(parsedUser.username);
          }
        }
      } catch (error) {
      }
    };

    getUsername();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) return;

      const response = await fetch(`${API_URL}/api/notifications/unread-count/${storedUserId}`);
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EventNotification')}
          style={{ marginRight: 15 }}
        >
          <View>
            <Ionicons name="notifications-outline" size={28} color="#333" />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  right: -2,
                  top: -2,
                  backgroundColor: 'red',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, unreadCount]);

  useEffect(() => {
    if (channelId) {
      fetchEventsFromDatabase(channelId);
    }
  }, [filterType]);

  const fetchEventsFromDatabase = async (channelId) => {
    try {
      const response = await fetch(`${API_URL}/api/events/${channelId}`);
      const data = await response.json();

      if (!data.events || !Array.isArray(data.events)) {
        return;
      }

      const formattedEvents = {};
      const filteredEvents = data.events.filter((event) => {
        if (filterType === 'completed') return event.completed === true;
        if (filterType === 'incomplete') return event.completed === false;
        return true;
      });

      filteredEvents.forEach((event) => {
        const localDate = new Date(event.date);
        const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const user = event.username || t('unknown_user');

        formattedEvents[formattedDate] = {
          id: event.id,
          marked: true,
          dotColor: randomColor,
          selected: true,
          selectedColor: randomColor,
          user: user,
          time: event.time,
          location: event.location,
          description: event.description,
        };
      });

      setMarkedDates(formattedEvents);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
    const event = markedDates[day.dateString];
    if (event?.id) {
      navigation.navigate('EventListPage', {
        eventId: event.id,
        channelId: channelId,
        selectedDate: day.dateString,
      });
    } else {
    }
  };

  return (
    <View style={styles.container}>
      {channelId ? (
        <>
          <Calendar
            style={styles.calendar}
            markedDates={markedDates}
            markingType={'dot'}
            onDayPress={handleDayPress}
          />
        </>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.infoText}>{t('no_channel_selected')}</Text>
        </View>
      )}

      {isModalVisible && selectedEvent && (
        <Modal visible={isModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{t('event_details')}</Text>
              <Text style={styles.modalText}>{t('user')}: {selectedEvent.user || t('unknown_user')}</Text>
              <Text style={styles.modalText}>{t('time')}: {selectedEvent.time}</Text>
              <Text style={styles.modalText}>{t('location')}: {selectedEvent.location}</Text>
              <Text style={styles.modalText}>{t('description')}: {selectedEvent.description}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <TouchableOpacity
        style={[styles.addButton, !channelId && styles.disabledButton]}
        onPress={() => {
          if (channelId) {
            navigation.navigate('AddEventScreen', { channelId });
          }
        }}
        disabled={!channelId}
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
  messageContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
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
  disabledButton: {
    backgroundColor: '#a5d6a7',
    opacity: 0.5,
  },
});