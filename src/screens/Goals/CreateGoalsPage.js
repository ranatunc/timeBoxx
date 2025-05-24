import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 


const CreateGoalsPage = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('financial');
  const [channelId, setChannelId] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    const getActiveChannel = async () => {
      try {
        const storedChannelId = await AsyncStorage.getItem('activeChannel');
        if (storedChannelId) {
          setChannelId(storedChannelId);
        } else {
        }
      } catch (error) {
      }
    };
    getActiveChannel();
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser && parsedUser._id && parsedUser.username) {
            setUserId(parsedUser._id);
            setUsername(parsedUser.username);
          } else {
          }
        } else {
        }
      } catch (error) {
      }
    };
    getUserData();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // Android'de seçim veya iptal sonrası picker kapanır
    }
  
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  

  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year} `;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('create_goals_page.error_title_required'));
      return;
    }
    if (!channelId) {
      Alert.alert(t('create_goals_page.error_no_active_channel'));
      return;
    }
    if (!title || !amount || !username || !date || !selectedType || !description) {
      Alert.alert(t('create_goals_page.error_fill_all_fields'));
      return;
    }
    
    const newGoal = {
      title,
      selectedType,
      amount,
      date,
      description,
      username,
      progress: 0,
      channelId: channelId.trim(),
      userId,
    };

    try {
      const response = await fetch(`${API_URL}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });

      if (response.ok) {
        const goal = await response.json();
        Alert.alert(t('create_goals_page.success_title'), t('create_goals_page.success_message'));
        navigation.reset({ index: 0, routes: [{ name: 'GoalsPage' }] });

        const formattedDateTime = formatDateTime(date);
        const notificationData = {
          titleKey: 'create_goals_page.notification_title', 
          messageKey: 'new_event_add_message', 
          messageParams: {
            time: formattedDateTime,
            name: title,
          },
          goalId: goal._id,
          createdAt: new Date(),
          date,
          userId,
          channelId,
        };

        const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData),
        });

        const notificationResponseData = await notificationResponse.json();
        if (!notificationResponse.ok) throw new Error(notificationResponseData.message || t('create_goals_page.error_notification_failed'));
      } else {
        const errorData = await response.json();
        Alert.alert(t('create_goals_page.error_server'), errorData.message || t('create_goals_page.error_server'));
      }
    } catch (error) {
      Alert.alert(t('create_goals_page.error_save_failed'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer} marginTop="30">
        <Icon name="person" size={30} color="#000" />
        <Text style={styles.labeluser}>
          <Text style={styles.user}>   {username}</Text>
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="clipboard" size={30} color="#000" />
        <TextInput
          style={styles.input}
          placeholder={t('create_goals_page.placeholder_title')}
          value={title}
          placeholderTextColor="#808080"
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="stats-chart" size={30} color="#000" />
        <TextInput
          style={[styles.input, { backgroundColor: '#dcdcdc' }]}
          value={t(`goal_types.${selectedType}`)}
          editable={false}
          placeholder={t('create_goals_page.placeholder_type')}
          placeholderTextColor="#808080"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="cash" size={30} color="#000" />
        <TextInput
          style={styles.input}
          placeholder={t('create_goals_page.placeholder_amount')}
          value={amount}
          placeholderTextColor="#808080"
          onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.labelContainer}>
  <Icon name="calendar" size={30} color="#000" />
  <View style={styles.dateContainer}>
    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ padding: 10 }}>
      <Text>{formatDateTime(date)}</Text>
    </TouchableOpacity>

    {showDatePicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"  // Modal olarak açar
        onChange={(event, selectedDate) => {
          setShowDatePicker(false); // Modalı kapat

          if (selectedDate) {
            // Eğer kullanıcı bir tarih seçtiyse güncelle
            setDate(selectedDate);
          }
        }}
      />
    )}
  </View>
</View>


      <View style={styles.inputContainer}>
        <Icon name="document-text" size={30} color="#000" />
        <TextInput
          style={styles.input}
          placeholder={t('create_goals_page.placeholder_description')}
          value={description}
          placeholderTextColor="#808080"
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity style={styles.kaydetButton} onPress={handleSave}>
        <Text style={styles.kaydetButtonText}>{t('create_goals_page.save_button')}</Text>
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
  inputContainer: { 
    marginBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center' 
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
  labelContainer: { 
    marginBottom: 15, 
    flexDirection: 'row',
    alignItems: 'center' 
  },
  dateContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  kaydetButton: { 
    backgroundColor: '#4CAF50', 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  kaydetButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default CreateGoalsPage;
