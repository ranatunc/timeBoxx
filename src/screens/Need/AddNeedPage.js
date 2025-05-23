import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 
import { Platform } from 'react-native';

const AddNeedPage = () => {
  const navigation = useNavigation();

  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [channelId, setChannelId] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [singleCompletion, setSingleCompletion] = useState(false);  
  const [allMustComplete, setAllMustComplete] = useState(false);   
  const [channelUsers, setChannelUsers] = useState([]);
  const { t } = useTranslation();


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
  
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('add_need_page.error'), t('add_need_page.title_required'));
      return;
    }
  
    if (!singleCompletion && !allMustComplete) {
      Alert.alert(t('add_need_page.error'), t('add_need_page.completion_rule_required'));
      return;
    }
  
    if (!channelId) {
      Alert.alert(t('add_need_page.error'), t('add_need_page.no_active_channel'));
      return;
    }
  

    const users = singleCompletion
    ? [userId]
    : channelUsers.map(user => user._id); 


    const requestData = {
    userId,
    username,
    title,
    note,
    channelId: channelId.trim(),
    singleCompletion,
    allMustComplete,
    users, 
    };
      
  
    try {const response = await fetch(`${API_URL}/api/create-need`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert(t('add_need_page.successful'), t('add_need_page.save_success'));
        navigation.navigate('NeedPage');
      } else {
        Alert.alert(t('add_need_page.error'), result.message || t('add_need_page.unknown_error'));
      }
  
      const notificationData = {
        titleKey: 'add_need_page.notification_title',
        messageKey: 'add_need_page.notification_message', 
        messageParams:{ username, title },
        needId: result._id,
        userId,
        channelId: channelId,
      };
  
      const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });
  
      const notificationResponseData = await notificationResponse.json();
  
      if (!notificationResponse.ok) {
        throw new Error(notificationResponseData.message || t('add_need_page.error_notification_failed'));
      }
  
  
    } catch (error) {
      Alert.alert(t('add_need_page.error'), t('add_need_page.save_error'));
    }
  };
  
  useEffect(() => {
    const fetchChannelUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/channel/${channelId}`);
        setChannelUsers(res.data.users);
      } catch (error) {
      }
    };
  
    if (channelId) {
      fetchChannelUsers();
    }
  }, [channelId]);
  

  return (
    <View style={styles.container}>
        <View style={styles.detailRow}>
            <Icon name="person" size={20} color="#000" />
            <Text style={styles.user}>{username}</Text>
        </View>   
        <TextInput style={styles.input} placeholder={t('add_need_page.input_title')} value={title} placeholderTextColor="#808080" onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder={t('add_need_page.input_note')} value={note} placeholderTextColor="#808080" onChangeText={setNote} multiline />
        <TouchableOpacity style={styles.itemContainer}>
        <CheckBox
  checked={singleCompletion}
  onPress={() => {
    setSingleCompletion(!singleCompletion);
    if (!singleCompletion) setAllMustComplete(false); 
  }}
  checkedIcon="check-square"
  uncheckedIcon="square-o"
  containerStyle={{
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    padding: 0,
    margin: 0,
  }}
  wrapperStyle={{
    margin: 0,
    padding: 0,
  }}
  textStyle={{
    margin: 0,
    padding: 0,
  }}
/>

            <View style={styles.itemContent}>
               <Text style={styles.itemTitle}>{t('add_need_page.option_single')}</Text>
            </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemContainer}>
            <CheckBox
              checked={allMustComplete}
              onPress={() => {
                setAllMustComplete(!allMustComplete);
                if (!allMustComplete) setSingleCompletion(false); 
              }}
              checkedIcon="check-square"
              uncheckedIcon="square-o"
              containerStyle={{ margin: 0, padding: 0 }}
            />
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{t('add_need_page.option_all')}</Text>
            </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>{t('add_need_page.save_button')}</Text>
        </TouchableOpacity>
    </View>
  );
};

export default AddNeedPage;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20,
  },
  user:{
    fontSize: 16,    
    marginLeft: 10, 
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  input: { 
    width: 370, 
    backgroundColor: '#fff', 
    marginTop: 20, 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#044a42', 
  },
  dateContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#044a42',  
  },
itemContainer: {
  marginTop: 20,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 5,
  borderRadius: 10,
  shadowColor: 'transparent',
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
},
  label: { 
    color: '#808080', 
    marginRight: 10, 
  },
  button: { 
    backgroundColor: '#4CAF50', 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

});