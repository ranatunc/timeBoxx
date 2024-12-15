import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from '../screens/HomePage';
import NeedPage from '../screens/NeedPage';
import GoalsPage from '../screens/GoalsPage';
import ProfilePage from '../screens/ProfilePage';
import ChatPage from '../screens/ChatPage';
import { SvgXml } from 'react-native-svg';

const Tab = createBottomTabNavigator();

const homeIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,14a3,3,0,0,0-3,3v7.026h6V17A3,3,0,0,0,12,14Z"/><path d="M13.338.833a2,2,0,0,0-2.676,0L0,10.429v10.4a3.2,3.2,0,0,0,3.2,3.2H7V17a5,5,0,0,1,10,0v7.026h3.8a3.2,3.2,0,0,0,3.2-3.2v-10.4Z"/></svg>';
const bubbleIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="M18,9C18,4.037,13.962,0,9,0S0,4.037,0,9v9H9c4.962,0,9-4.037,9-9Zm-9,6H3v-6c0-3.309,2.691-6,6-6s6,2.691,6,6-2.691,6-6,6Zm15,1v8h-8c-2.955,0-5.535-1.615-6.92-4.004,1.159-.008,2.274-.199,3.322-.54,.91,.948,2.184,1.544,3.598,1.544h5v-5c0-1.415-.597-2.688-1.544-3.598,.342-1.048,.532-2.163,.54-3.322,2.389,1.385,4.004,3.965,4.004,6.92Zm-13.5-7c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5,1.5,.672,1.5,1.5Zm-4,0c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5,1.5,.672,1.5,1.5Zm6.5-1.5c.828,0,1.5,.672,1.5,1.5s-.672,1.5-1.5,1.5-1.5-.672-1.5-1.5,.672-1.5,1.5-1.5Z"/></svg>';
const listIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M4.5,7A3.477,3.477,0,0,1,2.025,5.975L.5,4.62a1.5,1.5,0,0,1,2-2.24L4.084,3.794A.584.584,0,0,0,4.5,4a.5.5,0,0,0,.353-.146L8.466.414a1.5,1.5,0,0,1,2.068,2.172L6.948,6A3.449,3.449,0,0,1,4.5,7ZM24,3.5A1.5,1.5,0,0,0,22.5,2h-8a1.5,1.5,0,0,0,0,3h8A1.5,1.5,0,0,0,24,3.5ZM6.948,14l3.586-3.414A1.5,1.5,0,0,0,8.466,8.414l-3.613,3.44a.5.5,0,0,1-.707,0L2.561,10.268A1.5,1.5,0,0,0,.439,12.39l1.586,1.585A3.5,3.5,0,0,0,6.948,14ZM24,11.5A1.5,1.5,0,0,0,22.5,10h-8a1.5,1.5,0,0,0,0,3h8A1.5,1.5,0,0,0,24,11.5ZM6.948,22l3.586-3.414a1.5,1.5,0,0,0-2.068-2.172l-3.613,3.44A.5.5,0,0,1,4.5,20a.584.584,0,0,1-.416-.206L2.5,18.38a1.5,1.5,0,0,0-2,2.24l1.523,1.355A3.5,3.5,0,0,0,6.948,22ZM24,19.5A1.5,1.5,0,0,0,22.5,18h-8a1.5,1.5,0,0,0,0,3h8A1.5,1.5,0,0,0,24,19.5Z"/></svg>';
const incomeIcon = '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"><path d="m24,5v3H0v-3c0-1.654,1.346-3,3-3h3V0h2v2h8V0h2v2h3c1.654,0,3,1.346,3,3Zm-5,9h2c.552,0,1,.448,1,1h2c0-1.654-1.346-3-3-3v-2h-2v2c-1.654,0-3,1.346-3,3,0,1.359.974,2.51,2.315,2.733l3.04.506c.374.062.645.382.645.761,0,.552-.448,1-1,1h-2c-.552,0-1-.448-1-1h-2c0,1.654,1.346,3,3,3v2h2v-2c1.654,0,3-1.346,3-3,0-1.359-.974-2.51-2.315-2.733l-3.04-.506c-.374-.062-.645-.382-.645-.761,0-.552.448-1,1-1Zm-5,5v-4c0-2.045,1.237-3.802,3-4.576v-.424H0v14h17v-.424c-1.763-.774-3-2.531-3-4.576Z"/></svg>';
const userIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="512" height="512"><g><circle cx="256" cy="128" r="128"/><path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z"/></g></svg>';

const UserStack = ({ setIsLoggedIn }) => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home" >
      <Tab.Screen name="Home" 
        options={{
          tabBarIcon: () => <SvgXml xml={homeIcon} width="24" height="24" />
        }}       
      >
        {() => <HomePage setIsLoggedIn={setIsLoggedIn} />}
       
      </Tab.Screen>
      <Tab.Screen name="Need" component={NeedPage} 
              options={{
                tabBarIcon: () => <SvgXml xml={listIcon} width="24" height="24" />
              }}      
      />
      <Tab.Screen name="Chat" component={ChatPage} 
              options={{
                tabBarIcon: () => <SvgXml xml={bubbleIcon} width="24" height="24" />
              }}      
      />
      <Tab.Screen name="Goal" component={GoalsPage}
              options={{
                tabBarIcon: () => <SvgXml xml={incomeIcon} width="24" height="24" />
              }}
      />
      <Tab.Screen name="Profile" 
              options={{
                tabBarIcon: () => <SvgXml xml={userIcon} width="24" height="24" />
              }}
      >
        {() => <ProfilePage setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default UserStack;

