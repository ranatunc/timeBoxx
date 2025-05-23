import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const EventListPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { eventId, channelId, selectedDate } = route.params;
  const [channelUsers, setChannelUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDecisionPeriodOver = (event) => {
    if (!event || !event.decisionDeadline || !event.users) return false;
  
    const now = new Date();
    const deadline = new Date(event.decisionDeadline);
    const timeExpired = now > deadline;
  
  
    const creatorStatus = event.creatorStatus || 'approved'; 
  
    const allUsersDecided = event.users.every(u => u.status !== 'pending');
  
    const creatorDecided = creatorStatus !== 'pending';
  
    return timeExpired || (allUsersDecided && creatorDecided);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    d.setHours(d.getHours());

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const titleFormatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return t('invalid_date');

    d.setHours(d.getHours());

    const gun = String(d.getDate()).padStart(2, '0');
    const ay = String(d.getMonth() + 1).padStart(2, '0');
    const yil = d.getFullYear();
    return `${gun}/${ay}/${yil}`;
  };

  const formatForApi = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const formattedDate = formatForApi(selectedDate);
        const response = await fetch(`${API_URL}/api/events/channel/${channelId}?date=${formattedDate}`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        alert(t('could_not_load_events'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

  const getRandomColor = () => {
    const colors = ['#FFD700', '#FF69B4', '#8A2BE2', '#20B2AA'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getParticipationSummary = (event, users) => {
    const approved = users.filter(u => {
      const p = event.users.find(evUser =>
        evUser.userId?.toString() === u._id?.toString() ||
        evUser.userId?._id?.toString() === u._id?.toString()
      );
      return p?.status === 'approved';
    }).length;

    const rejected = users.filter(u => {
      const p = event.users.find(evUser =>
        evUser.userId?.toString() === u._id?.toString() ||
        evUser.userId?._id?.toString() === u._id?.toString()
      );
      return p?.status === 'rejected';
    }).length;

    const pending = users.length - approved - rejected;

    return { approved, rejected, pending };
  };

  const EventSummary = ({ event }) => {
    const [channelUsers, setChannelUsers] = useState([]);

    useEffect(() => {
      const fetchChannelUsers = async () => {
        try {
          const res = await fetch(`${API_URL}/api/channel/${event.channelId}`);
          const data = await res.json();
          if (Array.isArray(data.users)) {
            setChannelUsers(data.users);
          } else {
          }
        } catch (err) {
        }
      };

      if (event.channelId?.length === 24) {
        fetchChannelUsers();
      }
    }, [event.channelId]);

    const { approved, rejected, pending } = getParticipationSummary(event, channelUsers);

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.iconBox, { borderColor: '#4CAF50' }]}>
          <AntDesign name="checkcircle" size={16} color="#4CAF50" style={{ marginRight: 4 }} />
          <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{approved}</Text>
        </View>

        <View style={[styles.iconBox, { borderColor: '#f44336' }]}>
          <AntDesign name="closecircle" size={16} color="#f44336" style={{ marginRight: 4 }} />
          <Text style={{ color: '#f44336', fontWeight: 'bold' }}>{rejected}</Text>
        </View>

        <View style={[styles.iconBox, { borderColor: '#ffc107' }]}>
          <MaterialIcons name="hourglass-top" size={16} color="#E4B16D" style={{ marginRight: 4 }} />
          <Text style={{ color: '#E4B16D', fontWeight: 'bold' }}>{pending}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{titleFormatDate(selectedDate)} {t('events_on_date')}</Text>

      {events.length === 0 ? (
        <Text style={styles.noEventsText}>{t('no_events_on_date')}</Text>
      ) : (
        <FlatList
          data={events.reverse()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.eventCard,
                isDecisionPeriodOver(item) && { backgroundColor: '#e4e4e4' }
              ]}
              onPress={() => navigation.navigate('EventDetailPage', {
                eventId: item._id,
                channelId: item.channelId
              })}
            >
              <View style={styles.goalContentRow}>
                <View style={[styles.colorBar, { backgroundColor: getRandomColor() }]} />
                <View style={styles.goalInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={styles.eventTitle}>{item.username}</Text>
                    {isDecisionPeriodOver(item) && (
                      <AntDesign
                        name="checkcircleo"
                        size={30}
                        color="#888"
                        style={{ position: 'absolute', right: 0, bottom: 7 }}
                      />
                    )}
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar" size={16} color="#000" />
                    <Text style={styles.menuItemText}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="location" size={16} color="#000" />
                    <Text style={styles.menuItemText}>{item.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="document-text" size={16} color="#000" />
                    <Text style={styles.menuItemText}>{item.description}</Text>
                  </View>
                  <EventSummary event={item} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20 
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noEventsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  menuItemText: {
    fontSize: 14,
    marginLeft: 8,
  },
  goalContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
  },
  colorBar: {
    width: 5,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  icon:{
    backgroundColor: '#f5f5f5',
    borderColor:'#ffc107',
    fontWeight: 'bold' ,
    paddingHorizontal: 8,
    borderRadius: 5, 
    padding:3,
    borderWidth:2, 
  },
  iconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    backgroundColor: '#fff',
    fontWeight: 'bold',
  },
  
});

export default EventListPage;