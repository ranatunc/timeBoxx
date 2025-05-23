import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert,Modal, FlatList } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 


const EventDetailPage = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params; 
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [channelUsers, setChannelUsers] = useState([]);
  const channelId = route.params?.channelId;

  const isDecisionPeriodOver = (event) => {
    if (!event || !event.decisionDeadline) return false;
  
    const now = new Date();
    const deadline = new Date(event.decisionDeadline);
    return now > deadline;
  };
  const renderParticipantIcon = (userId) => {
    const participant = event?.users?.find(user => {
      return (
        user.userId?._id?.toString() === userId?.toString() ||
        user.userId?.toString() === userId?.toString()
      );
    });
    
    if (!participant || !participant.status) {
      return  <MaterialIcons name="hourglass-top" size={20} color="#E4B16D" style={{ marginLeft: 4 }} />
    }
  
    switch (participant.status) {
      case 'approved':
        return  <AntDesign name="checkcircle" size={20} color="#4CAF50" style={{ marginLeft: 4 }} />;
      case 'rejected':
        return  <AntDesign name="closecircle" size={20} color="#f44336" style={{ marginLeft: 4 }} />;
      default:
        return  <MaterialIcons name="hourglass-top" size={20} color="#E4B16D" style={{ marginLeft: 4 }} />
        ;
    }
  };

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
        } else {
        }
      } catch (error) {
      }
    };

    getLoggedUserId();
  }, [eventId]);

    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/event/${eventId}`);
        const data = await response.json();

        if (data && data.users) {
          setEvent(data);
        } else {
          alert(t(' event_user_information_is_missing'));
        }
      } catch (error) {
        alert(t('error_occurred') + ': ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    // useEffect’in içinde sadece çağır
    useEffect(() => {
      fetchEvent();
    }, [eventId]);


  //  Kanal kullanıcılarını al (channelId değişince tetiklenir)
  const fetchChannelData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/channel/${channelId}`);
      if (response.data && Array.isArray(response.data.users)) {
        setChannelUsers(response.data.users);
      } else {
        setChannelUsers([]);
       
      }
    } catch (err) {
    } 
  };
  
  useEffect(() => {
    if (channelId && channelId.length === 24) {
      fetchChannelData();
    }
  }, [channelId]);

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
    if (!event || !event.creatorId || !loggedUserId) {
      alert(t('event_or_user_data_missing'));
      return;
    }

    
    if (event.creatorId?.toString() !== loggedUserId?.toString()) {
      alert(t('you_did_not_create_this_event_you_cannot_delete_it'));
      return;
    }
    
    Alert.alert(
      (t('delete_event')),
      (t('are_you_sure_you_want_to_delete_this_event')),
      [
        {
          text:(t('cancel')),
          style: 'cancel',
        },
        {
          text:(t('delete')),
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/event/${eventId}?userId=${loggedUserId}&username=${event.username}`, {
                method: 'DELETE',
              });
              const text = await response.text();
    
              const result = JSON.parse(text);
              if (response.ok) {
                alert(t('event_deleted_successfully'));
                
                const notificationData = {
                  titleKey: 'event_deleted_title', 
                  messageKey: 'event_deleted_message', 
                  messageParams: {
                    username: event.username,
                    date: formatDate(new Date()),
                    description: event.description,
                  },
                  eventId: event._id,
                  userId: loggedUserId,
                };

                const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
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
                alert(t('an_error_occurred_while_deleting_the_event'));

              }
            } catch (error) {
              alert((t('an_error_occurred'))+ error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!loggedUserId) {
      return;
    }

    if (!event || !event.channelId) {
      alert(t('missing_channel_information_unable_to_operate'));
      return;
    }
  
    const currentUser = channelUsers.find(user => user._id === loggedUserId);
    const username = currentUser?.username || "Bilinmeyen";
  
    try {
      const response = await fetch(`${API_URL}/api/events/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId, 
          userId: loggedUserId, 
          status: newStatus, 
          channelId: event.channelId,
          username
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        await fetchEvent();
        setEvent(prev => {
          const updatedUsers = [...prev.users];
          const index = updatedUsers.findIndex(u => u.userId.toString() === loggedUserId);
          
          if (index !== -1) {
            updatedUsers[index].status = newStatus;
          } else {
            updatedUsers.push({ userId: loggedUserId, status: newStatus });
          }
      
          return {
            ...prev,
            users: updatedUsers
          };
        });
      } else {
        alert(data.message || t('an_error_has_occurred'));
      }
    } catch (error) {
      alert((t('an_error_has_occurred')) + error.message);
    }
  };
  
  if (loading || !event) {
    return <Text>{t('loading')}</Text>;
  }
  
  const approved = channelUsers.filter(u => {
    const participant = event.users.find(evUser =>
      evUser.userId?._id?.toString() === u._id?.toString() ||
      evUser.userId?.toString() === u._id?.toString()
    );
    return participant?.status === 'approved';
  }).length;
  
  const rejected = channelUsers.filter(u => {
    const participant = event.users.find(evUser =>
      evUser.userId?._id?.toString() === u._id?.toString() ||
      evUser.userId?.toString() === u._id?.toString()
    );
    return participant?.status === 'rejected';
  }).length;
  
  const pending = channelUsers.length - approved - rejected;

  const chartData = [
    { name: '', population: approved, color: '#4CAF50', legendFontColor: '#000', legendFontSize: 14 },
    { name: '', population: rejected, color: '#f44336', legendFontColor: '#000', legendFontSize: 14 },
    { name: '', population: pending, color: '#ffc107', legendFontColor: '#000', legendFontSize: 14 },
  ];
  const screenWidth = Dimensions.get('window').width;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{titleFormatDate(event.date)}</Text>
        <TouchableOpacity
          onPress={() => {
            setIsModalVisible(true);
            if (channelId && channelId.length === 24) {
              fetchChannelData();
            }
          }}
        >
          <AntDesign name="user" size={24} color="black" />
        </TouchableOpacity>
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
  
      {(() => {
        const currentUserStatus = event?.users?.find(
          u =>
            u.userId?._id?.toString() === loggedUserId?.toString() ||
            u.userId?.toString() === loggedUserId?.toString()
        )?.status;
  
        if (isDecisionPeriodOver(event)) {
          return (
            <View style={styles.statusContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AntDesign name="checkcircleo" size={24} color="#888" style={{ marginRight: 6 }} />
                <Text style={{ color: '#888', fontWeight: 'bold' }}>
                  {t('decision_period_over')}
                </Text>
              </View>
            </View>
          );
        }
  
        if (!currentUserStatus || currentUserStatus === 'pending') {
          return (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleStatusUpdate('approved')}
              >
                <Text style={styles.buttonText}>{t('approve')}</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleStatusUpdate('rejected')}
              >
                <Text style={styles.buttonText}>{t('reject')}</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (currentUserStatus === 'approved') {
          return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.statusContainer}>
                <AntDesign name="checkcircle" size={20} color="#4CAF50" style={{ marginRight: 4 }} />
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.approvedText}>{t('you_approved_event')}</Text>
              </View>
            </View>
          );
        } else if (currentUserStatus === 'rejected') {
          return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.statusContainer}>
                <AntDesign name="closecircle" size={20} color="#f44336" style={{ marginRight: 4 }} />
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.rejectedText}>{t('you_rejected_event')}</Text>
              </View>
            </View>
          );
        } else {
          return null;
        }
      })()}
  
      <View style={styles.goalContentRow}>
        <View style={styles.textColumn}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{t('participation_summary')}</Text>
          <Text>{t('approved_count')}: {approved}</Text>
          <Text>{t('rejected_count')}: {rejected}</Text>
          <Text>{t('pending_count')}: {pending}</Text>
        </View>
        <View style={styles.chartColumn}>
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width / 2.2}
            height={100}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
          />
        </View>
      </View>
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('participants')}</Text>
            <FlatList
              style={{ maxHeight: 300 }}
              data={channelUsers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.modalItemContainer}>
                  <Text style={styles.modalItem}>{item.username}</Text>
                  {renderParticipantIcon(item._id)}
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );  
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  header: {
    alignItems: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },
  profileName: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  detailsContainer: { 
    marginVertical: 20 
  },
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
  goalContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  textColumn: {
    flex: 1,
    paddingRight: 10,
  },
  chartColumn: {
    width: Dimensions.get('window').width /2.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 70,
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
  buttonText: {
    color: '#fff', 
    fontWeight: 'bold' 
  },
  statusContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  approvedText: { 
    color: 'green', 
    fontWeight: 'bold' 
  },
  rejectedText: { 
    color: 'red', 
    fontWeight: 'bold' 
  },
  deleteButton: {
    marginRight: 10 

  },
  deleteButtonText: { 
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%', 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalHeader: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  modalItem: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    width: '100%',
    paddingHorizontal: 10,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: 'white', 
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white', 
  },
  closeModalText: {
    color: '#007BFF', 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center' 
  },

});

export default EventDetailPage;