import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 


const GoalsDetailPage = () => {
  const route = useRoute();  
  const navigation = useNavigation();
  const { goal, goalId, setGoals, channelId } = route.params;
  const [tasks, setTasks] = useState(goal.tasks || []); 
  const [contribution, setContribution] = useState('');
  const [savedAmount, setSavedAmount] = useState(goal.savedAmount || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [contributions, setContributions] = useState(goal.contributions || []);
  const [participants, setParticipants] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [channelUsers, setChannelUsers] = useState([]);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = await AsyncStorage.getItem('loggedUserId');
      const storedUsername = await AsyncStorage.getItem('username'); 
      if (storedUsername) setUsername(storedUsername);
    };
    fetchUser();
  }, []);
  

  const formatCurrency = (amount, language = 'tr') => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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


    const fetchGoal = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/goals/${goalId}`);
        const updatedGoal = response.data;
        setContributions(updatedGoal.contributions || []);
        setSavedAmount(updatedGoal.SavedAmount || 0);

        if (updatedGoal.users && Array.isArray(updatedGoal.users)) {
          const userNames = await Promise.all(
            updatedGoal.users.map(async userId => {
              const userResponse = await axios.get(`${API_URL}/api/username/${userId}`);
              return userResponse.data.username || t('goals_detail_page.unknown_user');
            })
          );
          setParticipants(userNames);
        }


      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [goalId]);

  const handleAddContribution = async () => {
    if (savedAmount >= goal.amount) {
      Alert.alert(t('goals_detail_page.info'), t('goals_detail_page.info_goal_reached'));
      return;
    }
  
    const amount = parseFloat(contribution);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('goals_detail_page.error'), t('goals_detail_page.error_invalid_amount'));
      return;
    }
  
    const newSavedAmount = savedAmount + amount;
    if (newSavedAmount > goal.amount) {
      Alert.alert(
        t('goals_detail_page.info'),
        t('goals_detail_page.maximum_amount_you_can_add') + `${goal.amount - savedAmount} TL`
      );
      return;
    }
  
    try {
      const response = await axios.post(`${API_URL}/api/goals/${goalId}/contributions`, {
        username,
        amount,
      });
  
      const updatedGoal = response.data;
      setContributions(updatedGoal.contributions || []);
      setSavedAmount(updatedGoal.SavedAmount || 0); 
      setContribution('');
  
      if (typeof setGoals === 'function') {
        setGoals(prevGoals => {
          const updatedGoals = prevGoals.map(g => g.id === goal.id ? updatedGoal : g);
          AsyncStorage.setItem('userGoals', JSON.stringify(updatedGoals));
 
          return updatedGoals;
        });
      }
      
      navigation.setParams({ goal: updatedGoal, refresh: true });
      setTimeout(() => {
        navigation.navigate('GoalsPage', { refresh: true });
      }, 1000); 
    } catch (error) {
      Alert.alert(t('goals_detail_page.error'), t('goals_detail_page.error_contribution_failed_message'));
    }
  };
  

  const handleDeleteGoal = () => {

    if (!goal || !goal.users || !loggedUserId) {
      alert(t('goals_detail_page.error_missing_data'));
      return;
    }
  
    if (!goal.users.includes(loggedUserId)) {
      alert(t('goals_detail_page.error_not_creator_or_participant'));
      return;
    }


    Alert.alert(      
      t('goals_detail_page.delete_goal_confirm_title'),
      t('goals_detail_page.delete_goal_confirm_message'),
    [
      { text: t('goals_detail_page.delete_goal_cancel'), style: 'cancel' },

      {
        text: t('goals_detail_page.delete_goal_delete'),
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/api/goals/${goalId}`, {
              method: 'DELETE',
            });
            const text = await response.text();

            const result = JSON.parse(text);
            if (response.ok) {
              alert(t('goals_detail_page.success_goal_deleted'));
              
              const notificationData = {
                titleKey: 'goals_detail_page.notification_goal_deleted_title', 
                messageKey: 'goals_detail_page.notification_goal_deleted_message', 
                messageParams: {
                  username,
                  title: goal.title,
                },

                goalId: goal._id,
                userId: loggedUserId, 
              };
              const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData),
              });

              const notificationResponseData = await notificationResponse.json();

              if (!notificationResponse.ok) {
                throw new Error(notificationResponseData.message || t('goals_detail_page.error_notification_failed'));
              }

              navigation.navigate('GoalsPage', { refresh: true });
            } else {
              alert(t('goals_detail_page.error_deleting_goal'));
            }
          } catch (error) {
            alert(t('goals_detail_page.error_deleting_goal') + ' ' + error.message);
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  const progress = goal.selectedType === 'Finans'
    ? savedAmount / goal.amount
    : tasks.length > 0
      ? tasks.filter(t => t.completed).length / tasks.length
      : 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGoal}>
          <Icon name="trash" size={24} color="red" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, goal, loggedUserId]);
  

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{goal.title}</Text>
        {goal.selectedType === 'Finans' && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <AntDesign name="user" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.detailText}>{t('goals_detail_page.goal_type_label')} {goal.selectedType}</Text>
      <View style={styles.detailRow}>
          <Icon name="person" size={20} color="#000" />
          <Text style={styles.menuItemText}>{goal.username}</Text>
        </View>

        <View style={styles.chartRow}>
        <ProgressChart
          data={{ data: [progress] }}
          width={150}
          height={150}
          strokeWidth={15}
          radius={35}
          chartConfig={{
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
          }}
          hideLegend={true}
        />
        <View style={styles.percentageContainer}>
        <Text style={styles.percentageLabel}>{t('goals_detail_page.progress_label')}</Text>
          <Text style={styles.percentageValue}>
            %{(progress * 100).toFixed(1)}
          </Text>
        </View>
      </View>

      {goal.selectedType === "Finans" && (
        savedAmount >= goal.amount ? (
          <>
                <Text style={styles.detailText}>{t('goals_detail_page.target_label')} {formatCurrency(goal.amount, i18n.language)}</Text>
                <Text style={styles.detailText}>{t('goals_detail_page.saved_label')} {formatCurrency(savedAmount, i18n.language)}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                  <AntDesign name="checkcircle" size={20} color="#4CAF50" style={{ marginRight: 4 }} />
                  <Text style={styles.approvedText}>{t('goals_detail_page.info_goal_reached')}</Text>
                </View>
          </>
        ) : (
          <>
                <Text style={styles.detailText}>{t('goals_detail_page.target_label')} {formatCurrency(goal.amount, i18n.language)}</Text>
                <Text style={styles.detailText}>{t('goals_detail_page.saved_label')} {formatCurrency(savedAmount, i18n.language)}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('goals_detail_page.contribution_placeholder')}
                keyboardType="numeric"
                value={contribution}
                onChangeText={(text) => {
                  if (/^[0-9]*\.?[0-9]*$/.test(text)) {
                    setContribution(text);
                  }
                }}
                placeholderTextColor="#808080"
              />
              <TouchableOpacity onPress={handleAddContribution} style={styles.addButton}>
                <Text style={styles.addButtonText}>{t('goals_detail_page.add_button')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )
      )}


      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{t('goals_detail_page.contributors_title')}</Text>
              <FlatList
                  data={contributions.reverse()}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <Text style={styles.modalItem}>
                      {item.username}: {formatCurrency(item.amount, i18n.language)}
                    </Text>
                  )}
                />
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>{t('goals_detail_page.close_button')}</Text>
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
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15 ,
    fontSize: 24,
  },
  detailText: { 
    fontSize: 18,
    marginBottom: 10 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  input: { 
    flex: 1, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    padding: 10, 
    marginRight: 10, 
    borderRadius: 5 
  },
  addButton: { 
    backgroundColor: '#4CAF50', 
    padding: 10, 
    borderRadius: 5 
  },
  addButtonText: { 
    olor: 'white'
   },
  chartContainer: { 
    marginTop: 25 
  },
  deleteButton: { 
    marginRight: 10 
  },
  iconContainer: { 
    flexDirection: 'row' 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 10 
  },
  modalHeader: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  modalItem: { 
    fontSize: 16, 
    marginVertical: 5 
  },
  closeButton: { 
    marginTop: 20, 
    textAlign: 'center', 
    color: '#007BFF' 
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  percentageContainer: {
    marginLeft: 15,
  },
  percentageLabel: {
    fontSize: 16,
    color: '#333',
  },
  percentageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  approvedText: { 
    color: 'green', 
    fontWeight: 'bold' 
  },
  statusContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
});

export default GoalsDetailPage;
