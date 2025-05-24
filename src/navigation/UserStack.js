import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/Home/HomePage';
import ProfilePage from '../screens/Profile/ProfilePage';
import EditProfilePage from '../screens/Profile/EditProfilePage'
import MyChannelsPage from '../screens/Channel/MyChannelsPage';
import CreateChannelPage from '../screens/Channel/CreateChannelPage'
import { SvgXml } from 'react-native-svg';
import AddEventScreen from '../screens/Home/AddEventScreen';
import PrivacyAndSecurityPage from '../screens/Profile/PrivacyAndSecurityPage';
import GoalsPage from '../screens/Goals/GoalsPage';
import ChannelDetailPage from '../screens/Channel/ChannelDetailPage'
import JoinChannelPage from '../screens/Channel/JoinChannelPage'
import CreateGoalsPage from '../screens/Goals/CreateGoalsPage';
import {TouchableOpacity , Text, View} from 'react-native';
import NeedPage from '../screens/Need/NeedPage';
import EventDetailPage from '../screens/Home/EventDetailPage';
import AddNeedPage from '../screens/Need/AddNeedPage'
import NeedDetailPage from '../screens/Need/NeedDetailPage'
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import EventNotification from '../screens/Home/EventNotification'
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoalsDetailPage from '../screens/Goals/GoalsDetailPage';
import PasswordPage from '../screens/Profile/PasswordPage';
import EventListPage from '../screens/Home/EventListPage';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const notificationIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="m.212,4.908c-.226-.159-.279-.471-.12-.696C1.552,2.143,4.009.729,7.396.011c.267-.051.535.114.593.386.058.27-.115.535-.386.593-3.133.664-5.385,1.942-6.695,3.799-.097.139-.252.212-.408.212-.1,0-.2-.029-.288-.092Zm20.677,10.269l-3.959,6.447c-.803,1.308-2.138,2.16-3.663,2.341-.2.023-.398.035-.597.035-1.242,0-2.424-.475-3.349-1.322-.804.805-1.923,1.322-3.061,1.322s-2.208-.443-3.012-1.248c-.805-.804-1.248-1.874-1.248-3.012s.494-2.241,1.298-3.045l-1.812-1.809C.402,13.804-.117,12.312.06,10.791c.178-1.521,1.027-2.855,2.332-3.66l6.064-3.742c3.365-2.136,7.647-1.767,10.597.851l2.094-2.094c.195-.195.512-.195.707,0s.195.512,0,.707l-2.091,2.091c2.515,2.795,2.993,6.933,1.126,10.232Zm-12.269,6.831l-4.631-4.624c-.616.615-.989,1.485-.989,2.356s.339,1.689.955,2.305c1.23,1.232,3.434,1.196,4.665-.037Zm11.408-7.339c1.716-3.032,1.188-6.889-1.291-9.364-1.522-1.52-3.516-2.304-5.531-2.304-1.45,0-2.911.405-4.218,1.235l-6.07,3.746c-1.043.643-1.723,1.709-1.864,2.924-.141,1.215.274,2.407,1.141,3.272l7.667,7.655c.869.867,2.071,1.284,3.288,1.138,1.22-.144,2.287-.826,2.93-1.871l3.949-6.432Zm3.586,1.344c-.27-.062-.538.106-.601.374-.759,3.268-2.001,5.46-3.797,6.702-.228.157-.284.469-.127.695.097.141.253.216.411.216.099,0,.197-.028.284-.089,2.01-1.391,3.385-3.777,4.203-7.298.062-.27-.105-.538-.374-.601Z"/></svg>';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


const homeIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,14a3,3,0,0,0-3,3v7.026h6V17A3,3,0,0,0,12,14Z"/><path d="M13.338.833a2,2,0,0,0-2.676,0L0,10.429v10.4a3.2,3.2,0,0,0,3.2,3.2H7V17a5,5,0,0,1,10,0v7.026h3.8a3.2,3.2,0,0,0,3.2-3.2v-10.4Z"/></svg>';
const bubbleIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="M18,9C18,4.037,13.962,0,9,0S0,4.037,0,9v9H9c4.962,0,9-4.037,9-9Zm-9,6H3v-6c0-3.309,2.691-6,6-6s6,2.691,6,6-2.691,6-6,6Zm15,1v8h-8c-2.955,0-5.535-1.615-6.92-4.004,1.159-.008,2.274-.199,3.322-.54,.91,.948,2.184,1.544,3.598,1.544h5v-5c0-1.415-.597-2.688-1.544-3.598,.342-1.048,.532-2.163,.54-3.322,2.389,1.385,4.004,3.965,4.004,6.92Zm-13.5-7c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5,1.5,.672,1.5,1.5Zm-4,0c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5,1.5,.672,1.5,1.5Zm6.5-1.5c.828,0,1.5,.672,1.5,1.5s-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5Z"/></svg>';
const listIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M4.5,7A3.477,3.477,0,0,1,2.025,5.975L.5,4.62a1.5,1.5,0,0,1,2-2.24L4.084,3.794A.584.584,0,0,0,4.5,4a.5.5,0,0,0,.353-.146L8.466.414a1.5,1.5,0,0,1,2.068,2.172L6.948,6A3.449,3.449,0,0,1,4.5,7ZM24,3.5A1.5,1.5,0,0,0,22.5,2h-8a1.5,1.5,0,0,0,0,3h8A1.5,1.5,0,0,0,24,3.5ZM6.948,14l3.586-3.414A1.5,1.5,0,0,0,8.466,8.414l-3.613,3.44a.5.5,0,0,1-.707,0L2.561,10.268A1.5,1.5,0,0,0,.439,12.39l1.586,1.585A3.5,3.5,0,0,0,6.948,14ZM24,11.5A1.5,1.5,0,0,0,22.5,10h-8a1.5,1.5,0,0,0,0,3h8A1.5,1.5,0,0,0,24,11.5ZM6.948,22l3.586-3.414a1.5,1.5,0,0,0-2.068-2.172l-3.613,3.44A.5.5,0,0,1,4.5,20a.584.584,0,0,1-.416-.206L2.5,18.38a1.5,1.5,0,0,0-2,2.24l1.523,1.355A3.5,3.5,0,0,0,6.948,22ZM24,19.5A1.5,1.5,0,0,0,22.5,18h-8a1.5,1.5,0,0,0,0,3h8A1.5,1.5,0,0,0,24,19.5Z"/></svg>';
const incomeIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="m24,5v3H0v-3c0-1.654,1.346-3,3-3h3V0h2v2h8V0h2v2h3c1.654,0,3,1.346,3,3Zm-5,9h2c.552,0,1,.448,1,1h2c0-1.654-1.346-3-3-3v-2h-2v2c-1.654,0-3,1.346-3,3,0,1.359.974,2.51,2.315,2.733l3.04.506c.374.062.645.382.645.761,0,.552-.448,1-1,1h-2c-.552,0-1-.448-1-1h-2c0,1.654,1.346,3,3,3v2h2v-2c1.654,0,3-1.346,3-3,0-1.359-.974-2.51-2.315-2.733l-3.04-.506c-.374-.062-.645-.382-.645-.761,0-.552.448-1,1-1Zm-5,5v-4c0-2.045,1.237-3.802,3-4.576v-.424H0v14h17v-.424c-1.763-.774-3-2.531-3-4.576Z"/></svg>';
const userIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512"><g><circle cx="256" cy="128" r="128"/><path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z"/></g></svg>';

const globalHeaderOptions = {
  headerBackTitle: '', // Geri butonunun yanındaki önceki sayfanın başlığını gizler
  headerStyle: {
    backgroundColor: '#48BD7E', // Başlık arka plan rengi
  },
  headerTitleStyle: {
    fontSize: 22, // Yazı boyutu
    fontWeight: 'bold', // Kalın yazı
    color: 'white', // Yazı rengi
    textAlign: 'center', // Başlığı ortalamak için (Android için)
  },
  headerTintColor: 'white', // Geri butonu ve ikon rengi
};

const HomeStack = () => {
  const { t } = useTranslation();
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
    
        if (!userId) {
          console.error(t('user_ID_not_found'));
          return;
        }
    
        // API_URL ve userId'yi logla
        const response = await fetch(`${API_URL}/api/notifications/${userId}`);
  
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
    
        const unreadExists = data.some((notif) => !notif.isRead);
        setHasNewNotification(unreadExists);
      } catch (error) {
        console.error(t('error_fetching_notifications'), error);
      }
    };
    
  
    fetchNotifications();
  }, []);
  

  return (
    <Stack.Navigator screenOptions={globalHeaderOptions}>
      <Stack.Screen 
        name="HomePage" 
        component={HomePage} 
        options={{title: t('event_calendar') ,headerLeft: () => null,}} 
      />
      <Stack.Screen 
        name="AddEventScreen" 
        component={AddEventScreen} 
        options={{ title: t('add_event'), 
      }} 
      />
      <Stack.Screen 
        name="EventDetailPage" 
        component={EventDetailPage} 
        options={{ title: '' }} 
      />     
      <Stack.Screen 
        name="EventNotification" 
        component={EventNotification} 
        options={{ title: '' }} 
      /> 
      <Stack.Screen 
    name="EventListPage" 
    component={EventListPage} 
    options={{ title: '' }} 
  />
    </Stack.Navigator>
  );
};

const NeedStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={globalHeaderOptions}>   
      <Stack.Screen 
        name="NeedPage" 
        component={NeedPage} 
        options={{ 
          title:t('need') , 
          headerLeft: () => null,
        }} 
      />    
      <Stack.Screen 
      name="AddNeedPage" 
      component={AddNeedPage} 
      options={{ 
        title: '', 
      }} 
    />     
      <Stack.Screen 
      name="NeedDetailPage" 
      component={NeedDetailPage} 
      options={{ 
        title: '', 
      }} 
    />  
    </Stack.Navigator>
  );
};
const GoalsStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={globalHeaderOptions}>   
      <Stack.Screen 
        name="GoalsPage" 
        component={GoalsPage} 
        options={{ 
          title:t('goals') , 
          headerLeft: () => null,
        }} 
      />
      <Stack.Screen 
        name="CreateGoalsPage" 
        component={CreateGoalsPage} 
        options={{ title: ' ' }} // Başlık
      />
      <Stack.Screen 
        name="GoalsDetailPage" 
        component={GoalsDetailPage} 
        options={{ title: ' ' }} // Başlık
      />
    </Stack.Navigator>
  );
};
const ProfileStack = ({ setIsLoggedIn }) => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={globalHeaderOptions}>
      <Stack.Screen 
        name="ProfilePage" 
        options={{ 
          title: ' ' ,
          headerShown: true ,
          headerStyle: {
            backgroundColor: '#f5f5f5',
            elevation: 0, // Android'de gölgeyi kaldırır
            shadowOpacity: 0, // iOS'ta gölgeyi kaldırır
            borderBottomWidth: 0, 
          },
        }} // Profil sayfasında başlık gizleniyor
      >
        {() => <ProfilePage setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen 
        name="EditProfilePage" 
        component={EditProfilePage} 
        options={{  title:t('edit_profile') }} // Düzenleme sayfasının başlığı
      />
      <Stack.Screen 
        name="MyChannelsPage" 
        component={MyChannelsPage} 
        options={{ title:t('my_channels_profile')}} 
      />
      <Stack.Screen 
        name="PasswordPage" 
        component={PasswordPage} 
        options={{ title:t('password') }} 
      />
      <Stack.Screen 
        name="CreateChannelPage" 
        component={CreateChannelPage} 
        options={{ title:t('create_channel_title')}} 
      />
      <Stack.Screen 
        name="ChannelDetailPage" 
        component={ChannelDetailPage} 
        options={{ title: '' }} 
      />
      <Stack.Screen 
        name="JoinChannelPage" 
        component={JoinChannelPage} 
        options={{ title:t('join_channel_title') }}     
       />
      <Stack.Screen 
        name="PrivacyAndSecurityPage" 
        component={PrivacyAndSecurityPage} 
        options={{ title:t('privacy_security')  }} 
      />
      <Stack.Screen 
        name="GoalsPage" 
        component={GoalsPage} 
        options={{ title: 'GoalsPage' }} 
      />
    </Stack.Navigator>
  );
};



const UserStack = ({ setIsLoggedIn }) => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName={t("home") }>
      {/* HomeStack'i burada kullanıyoruz */}
      <Tab.Screen 
        name={t("home") }
        component={HomeStack} // Sadece 'component' kullanılıyor
        options={{
          tabBarIcon: () => <SvgXml xml={homeIcon} width="24" height="24" />
        }} 
      />
      <Tab.Screen 
        name={t("need") }
        component={NeedStack} 
        options={{
          tabBarIcon: () => <SvgXml xml={listIcon} width="24" height="24" />
        }} 
      />
      <Tab.Screen 
        name={t("goals") }
        component={GoalsStack} 
        options={{
          tabBarIcon: () => <SvgXml xml={incomeIcon} width="24" height="24" />
        }} 
      />
      <Tab.Screen 
        name={t("profile") }
        options={{
          tabBarIcon: () => <SvgXml xml={userIcon} width="24" height="24" />
        }}
      >
        {() => <ProfileStack setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>


    </Tab.Navigator>
  );
};


export default UserStack;
