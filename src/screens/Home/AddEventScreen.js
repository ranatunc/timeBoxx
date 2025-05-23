import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const AddEventScreen = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [date, setDate] = useState(new Date());  
  const [time, setTime] = useState(new Date());    
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [decisionPeriod, setDecisionPeriod] = useState('1g');
  const [infoVisible, setInfoVisible] = useState(false);
  const navigation = useNavigation(); 
 const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);



  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };
  
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };
  
  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0'); 
    const month = String(d.getMonth() + 1).padStart(2, '0');  
    const year = d.getFullYear(); 
  
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');  
  
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatDate = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (d) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleAddEvent = async () => {
    const userId = await AsyncStorage.getItem('userId');
  
    if (!username || !date || !time || !location || !description) {
      alert(t('fill_all_fields'));
      return;
    }

    const activeChannel = await AsyncStorage.getItem('activeChannel');
    if (!activeChannel) {
      alert(t('active_channel_not_found'));
      return;
    }
    const combinedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    const eventData = {
      name: description,
      description,
      date: combinedDateTime, 
      time,
      location,
      color: generateRandomColor(), 
      channelId: activeChannel,  
      userId: userId,  
      username,
      decisionPeriod 
    };
  
    try {
      const response = await fetch(`${API_URL}/api/create-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
  
      const eventResponseData = await response.json();
  
      if (!response.ok) {
        throw new Error(eventResponseData.message || (t('event_creation_failed')));
      }

      const formattedDateTime = formatDateTime(date);
      
      const notificationData = {
        titleKey: 'new_event_add_title', 
        messageKey: 'new_event_add_message', 
        messageParams: {
          time: formattedDateTime,
          name: description,
        },
        eventId: eventResponseData._id,
        userId,
        channelId: activeChannel,
      };      
  
      const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });
  
      const notificationResponseData = await notificationResponse.json();
  
      if (!notificationResponse.ok) {
        throw new Error(notificationResponseData.message || (t('failed_to_create_notification')));
      }
  
      const updatedMarkedDates = {
        ...markedDates,
        [date]: {
          ...eventData,
          selected: true,
          marked: true,
        },
      };
      setMarkedDates(updatedMarkedDates);
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomePage' }],
        markedDates: updatedMarkedDates,
      });
  
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    const getUsername = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUsername(parsedUser.username);
        }
      } catch (error) {
        console.error((t('unable_to_fetch_username')), error);
      }
    };

    getUsername();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer} marginTop='30'>
        <Icon name="person" size={30} color="#000" />
        <Text style={styles.labeluser}><Text style={styles.user}>   {username}</Text> </Text>
      </View>

      <View style={styles.labelContainer}>
      <Icon name="calendar" size={30} color="#000" />

      <View style={styles.dateContainer}>
  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBox}>
  <Text style={styles.dateText}>
  {`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`}
</Text>

  </TouchableOpacity>

  <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeBox}>
    <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
  </TouchableOpacity>

  {showDatePicker && (
    <DateTimePicker
      value={date}
      mode="date"
      display="default"
      onChange={handleDateChange}
    />
  )}

  {showTimePicker && (
    <DateTimePicker
      value={time}
      mode="time"
      display="default"
      onChange={handleTimeChange}
    />
  )}
</View>

    </View>

      <View style={styles.inputContainer}>
        <Icon name="location" size={30} color="#000" />
        <TextInput 
          style={styles.input} 
          placeholder={t('place')} 
          value={location} 
          placeholderTextColor="#808080" 
          onChangeText={setLocation} 
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="document-text" size={30} color="#000" />
        <TextInput 
          style={styles.input} 
          placeholder={t('description')} 
          value={description} 
          placeholderTextColor="#808080" 
          multiline 
          onChangeText={setDescription} 
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="stopwatch" size={30} color="#000" />

        <View style={styles.decisionPeriodContainer}>
          <Text style={styles.label}></Text>
          <TouchableOpacity onPress={() => setDecisionPeriod('test-3dk')} style={[styles.decisionOption, decisionPeriod === 'test-3dk' && styles.selectedDecision]}>
            <Text>{t('decision_test')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDecisionPeriod('1g')} style={[styles.decisionOption, decisionPeriod === '1g' && styles.selectedDecision]}>
            <Text>{t('decision_1_day')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDecisionPeriod('7g')} style={[styles.decisionOption, decisionPeriod === '7g' && styles.selectedDecision]}>
            <Text>{t('decision_1_week')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDecisionPeriod('30g')} style={[styles.decisionOption, decisionPeriod === '30g' && styles.selectedDecision]}>
            <Text>{t('decision_1_month')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setInfoVisible(true)}>
            <Icon name="help-circle-outline" size={24} color="#4CAF50" style={{  marginBottom:19 }}/>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddEvent}>
        <Text style={styles.addButtonText}>{t('add')}</Text>
      </TouchableOpacity>

      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            maxWidth: '80%',
            elevation: 5
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{t('what_is_decision_time')}</Text>
            <Text>{t('what_is_decision_time_description')}</Text>
            <TouchableOpacity onPress={() => setInfoVisible(false)} style={{ marginTop: 15, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddEventScreen;

const styles = StyleSheet.create({
  container:{
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20,
  },
  labelContainer:{
    marginBottom: 10,
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  inputContainer: {
    marginBottom: 10,
    flexDirection: 'row', 
    alignItems: 'center', 
    marjinLeft: 5,
  },
  user:{
    fontSize: 20,
    fontWeight: "lighter",
    color: '#062925',
    marginBottom: 5,
  },
  input: { 
    width: 340, 
    backgroundColor: '#fff', 
    marginTop: 20, 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#044a42', 
  },

  addButton: {
    backgroundColor: '#4CAF50', 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  addButtonText: {
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  decisionPeriodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 15,
  },
  decisionOption: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 6,
    marginRight: 5,
  },
  selectedDecision: {
    backgroundColor: '#4CAF50',
  }, 
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#044a42',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 340,
    height: 45,
    marginBottom: 10,
  },
  
  dateBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  timeBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  



  
});
