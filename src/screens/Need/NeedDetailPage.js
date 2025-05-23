import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { CheckBox } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, Modal,ActivityIndicator  } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 


const NeedDetailPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { needId, channelId: routeChannelId } = route.params;
  const { t } = useTranslation();
  const [channelId, setChannelId] = useState(routeChannelId || '');
  const [need, setNeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [channelUsers, setChannelUsers] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUserId) setLoggedUserId(storedUserId);
      if (storedUsername) setUsername(storedUsername);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const getChannelId = async () => {
      const storedChannelId = await AsyncStorage.getItem('activeChannel');
      if (routeChannelId && routeChannelId.length === 24) {
        setChannelId(routeChannelId);
      } else if (storedChannelId && storedChannelId.length === 24) {
        setChannelId(storedChannelId);
      }
    };
    getChannelId();
  }, []);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/channel/${channelId}`);
        if (Array.isArray(response.data.users)) {
          setChannelUsers(response.data.users);
        } else {
          setChannelUsers([]);
        }
      } catch (err) {
      }
    };

    if (channelId && channelId.length === 24) {
      fetchChannelData();
    }
  }, [channelId]);

  useFocusEffect(
    useCallback(() => {
      const fetchNeedDetails = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/need/${needId}`);
          setNeed(response.data);
        } catch (error) {
        } finally {
          setLoading(false); 
        }
      };
  
      if (needId && needId.length === 24) {
        fetchNeedDetails();
      }
    }, [needId])
  );
  
  
  const renderParticipantIcon = (userId) => {
    const id = userId?.toString();
  
    const completedIds = (need.completedUsers || []).map(u => {
      if (typeof u === 'string') return u;
      if (typeof u === 'object' && u._id) return u._id.toString();
      return u.toString();
    });

    const isCompleted = completedIds.includes(id);
  
    return isCompleted ? (
      <AntDesign name="checkcircle" size={20} color="#4CAF50" style={{ marginLeft: 4 }} />
          ) : (
      <MaterialIcons name="hourglass-top" size={16} color="#E4B16D" style={{ marginLeft: 4 }} />
          );
  };

  const handleDeleteNeed = async () => {
    if (!need || !need.users || !loggedUserId) {
      alert(t('need_detail_page.missing_data'));
      return;
    }

    const userHasPermission = need.users.some(user => user._id === loggedUserId);
    if (!userHasPermission) {
      alert(t('need_detail_page.no_permission'));
      return;
    }

    Alert.alert(
      t('need_detail_page.delete_title'),
      t('need_detail_page.delete_message'),
      [
        { text: t('need_detail_page.cancel'), style: 'cancel' },
        {
          text: t('need_detail_page.delete'),
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/need/${needId}`, { method: 'DELETE' });
              if (response.ok) {
                alert(t('need_detail_page.delete_success'));

                const notificationData = {
                  titleKey: 'need_detail_page.notification_need_deleted_title',
                  messageKey: 'need_detail_page.notification_need_deleted_message',
                  messageParams: {
                    username:need.username,
                    title:need.title
                  }, 
                  needId: need._id,
                  userId: loggedUserId, 
                };

                const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(notificationData),
                });

                const notificationResponseData = await notificationResponse.json();

                if (!notificationResponse.ok) {
                  throw new Error(notificationResponseData.message || t('need_detail_page.error_notification_failed'));
                }
                navigation.navigate('NeedPage', { refresh: true });
              } else {
                alert(t('need_detail_page.delete_error'));
              }
            } catch (error) {
              alert(t('need_detail_page.error_occurred') + error.message);
            }
          }
        },
      ],
      { cancelable: true }
    );
  }; 

  const handleCompletionToggle = async () => {
    try {
      if (!need || !loggedUserId) {
        alert(t('need_detail_page.missing_data'));
        return;
      }
  
      if (need.completed) {
        alert(t('need_detail_page.already_completed'));
        return;
      }
  
      const response = await axios.put(
        `${API_URL}/api/complete-need/${needId}`,
        { userId: loggedUserId }
      );
  
      const updated = await axios.get(`${API_URL}/api/need/${needId}`);
      setNeed(updated.data);
      setLoading(false);
  
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const message = error.response.data?.message || t('need_detail_page.you_have_already_completed');
        alert(message);
      } else {
        alert(t('need_detail_page.error_occurred') + error.message);
      }
    }
  };
  
  
  
  useLayoutEffect(() => {
    if (need) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteNeed}>
            <Icon name="trash" size={25} color="red" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, need]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>{t("need_detail_page.loading")}</Text>
      </View>
    );
  }
  
  if (!need) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t("need_detail_page.need_not_found")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{need.title}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <AntDesign name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="person" size={30} color="#000" />
          <Text style={styles.creator}>{need.username}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="document-text" size={30} color="#000" />
          <Text style={styles.note}>{need.note}</Text>
        </View>

        {need.completed ? (
          <View style={styles.statusContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                  <AntDesign name="checkcircle" size={20} color="#4CAF50" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {need.singleCompletion
                      ? t('need_detail_page.task_completed_single', { username: need.completedUsers[0]?.username || t('need_detail_page.someone') })
                      : t('need_detail_page.task_completed_all')}
                  </Text>
              </View>
          </View>
          ) : need.endDate && new Date(need.endDate) < new Date() ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
              <AntDesign name="clockcircleo" size={20} color="#888" style={{ marginRight: 6 }} />
              <Text style={{ color: '#888', fontStyle: 'italic' }}>
                {need.singleCompletion ? t('need_detail_page.task_expired_single') : t('need_detail_page.task_expired_all')}
              </Text>
          </View>
          ) : (
          <TouchableOpacity style={styles.itemContainer}>
              <View style={styles.itemContent}>
                 <Text style={styles.itemTitle}>{t('need_detail_page.completion_prompt')}</Text>
              </View>
              <CheckBox
                checked={need.completed}
                onPress={() => handleCompletionToggle(!need.completed)}
                checkedIcon="check-square"
                uncheckedIcon="square-o"
                containerStyle={{ margin: 0, padding: 0 }}
              />
          </TouchableOpacity>
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('need_detail_page.modal_title')}</Text>
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
                          <Text style={styles.closeModalText}>{t('need_detail_page.modal_close')}</Text>
                      </TouchableOpacity>
                </View>
            </View>
          </Modal>
      </View>
    </View>
  );
};
export default NeedDetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsContainer: {
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  note: {
    fontSize: 16,
    marginLeft: 10,
    lineHeight: 30, 
  },
  creator: {
    fontSize: 16,
    fontStyle: 'italic',
    marginLeft: 10,
    lineHeight: 30, 
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
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
    marginVertical: 5,
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
  closeModalText: {
    color: '#007BFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    marginRight: 10 

  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    width: '100%', 
    paddingHorizontal: 10,
  },
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    margin: 0,
    padding: 0,
    alignSelf: 'flex-end',
  },
  statusContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
});