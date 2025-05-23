import React, { useEffect, useState ,useContext} from 'react';
import { StyleSheet,View, TouchableOpacity, FlatList, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { ChannelContext } from '../../context/ChannelContext';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 


const NeedPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [channelUsers, setChannelUsers] = useState([]);
  const { activeChannelId } = useContext(ChannelContext);
  const [channelId, setChannelId] = useState(activeChannelId);
  const { t } = useTranslation();

  useEffect(() => {
    if (activeChannelId) {
      setChannelId(activeChannelId);
      fetchNeeds(activeChannelId);
    } else {
      setChannelId(null);
    }
  }, [activeChannelId]);

  useEffect(() => {
    const getActiveChannel = async () => {
      const storedChannelId = await AsyncStorage.getItem('activeChannel');
      if (!channelId && storedChannelId) {
        setChannelId(storedChannelId);
      }
    };
    getActiveChannel();
  }, [channelId]);

  useEffect(() => {
    if (channelId) {
      fetchNeeds(channelId.trim());
    } else {
    }
  }, [channelId]);

  const fetchNeeds = async (channelId) => {
    try {
      const response = await axios.get(`${API_URL}/api/needs/${channelId}`);
      setNeeds(response.data.needs);
      
    } catch (err) {
      setError(t('need_page.error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6F61', '#FF8C42', '#F4A261', '#E76F51', '#D62828',
       '#7FB800', '#6FCF97', '#2E8B57', '#228B22',
       '#20B2AA',   '#1E90FF',
      '#6495ED', '#4169E1', '#6A5ACD', '#483D8B', '#191970',
      '#8A2BE2', '#BA55D3', '#DA70D6', '#9932CC', '#9400D3',
      '#C71585', '#FF69B4', '#DB7093', '#E9967A', '#FA8072',
      '#CD853F', '#D2691E', '#A0522D', '#8B4513',
      '#556B2F', '#6B8E23', '#9ACD32',
       '#FFA500', '#FFB347', '#E1AD01', '#C49E35'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useFocusEffect(
    useCallback(() => {
      const refreshNeeds = async () => {
        if (channelId) {
          await fetchNeeds(channelId.trim());
        }
      };
  
      refreshNeeds();
    }, [channelId])
  );

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/channel/${channelId}`);
        setChannelUsers(res.data.users);
      } catch (err) {
      }
    };
  
    if (channelId) fetchChannelData();
  }, [channelId]);

  return (
    <View style={styles.container}>
      {channelId ? (
        <>
          {error && <Text style={styles.errorText}>{t('error_occurred')}</Text>}
  
          {needs.length > 0 ? (
            <FlatList
              contentContainerStyle={styles.listContainer}
              data={needs.reverse()} 
              keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
              renderItem={({ item }) => {
                let completedCount = item.completedUsers?.length || 0;
                let pendingCount = 0;
              
                if (item.singleCompletion) {
                  if (item.completed) {
                    completedCount = 1;
                    pendingCount = 0;
                  } else {
                    completedCount = 0;
                    pendingCount = 1;
                  }
                } else {
                  const totalCount = item.users?.length || 0;
                  completedCount = item.completedUsers?.length || 0;
                  pendingCount = totalCount - completedCount;
                }
                return (
                  <TouchableOpacity
                    style={[
                      styles.itemContainer,
                      { backgroundColor: item.completed ? '#eeeeee' : '#fff' }
                    ]}
                    onPress={async () => {
                      let fallbackChannelId = null;
                      if (!item.channelId) {
                        fallbackChannelId = await AsyncStorage.getItem('activeChannel');
                      }
  
                      const finalChannelId = item.channelId || fallbackChannelId;
                      const needId = item._id || item.id;
  
                      if (!needId) {
                        return;
                      }
  
                      navigation.navigate('NeedDetailPage', {
                        needId,
                        channelId: finalChannelId,
                      });
                    }}
                    >
                    
                      <View style={[styles.colorBar, { backgroundColor: getRandomColor() }]} />
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSubtitle}>{item.note}</Text>
    
                        <View style={{ flexDirection: 'row', marginTop: 6 }}>
                          <View style={[styles.iconBox, { borderColor: '#4CAF50' }]}>
                            <AntDesign name="checkcircle" size={16} color="#4CAF50" style={{ marginRight: 6 }} />
                            <Text style={styles.iconBoxText}>{completedCount}</Text>
                          </View>
    
                          <View style={[styles.iconBox, { borderColor: '#FFC107' }]}>
                            <MaterialIcons name="hourglass-top" size={16} color="#E4B16D" style={{ marginRight: 6 }} />
                            <Text style={styles.iconBoxText}>{pendingCount}</Text>
                          </View>
                        </View>
    
                        {item.completed ? (
                         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }} />
                        ) : null}

                      </View>
                          {item.completed &&  (
                            <View style={{ position: 'absolute', top: 10, right: 10 }}>
                              <AntDesign name="checkcircleo" size={24} color="#888" style={{ marginRight: 6 }} />
                            </View>
                          )}

                  </TouchableOpacity>
              
                );
              }}
            />
          ) : (
            <View style={styles.noNeedsContainer}>
              <Text style={styles.noNeedsText}>{t('need_page.no_needs')}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.infoText}>{t('need_page.open_channel_first')}</Text>
        </View>
      )}
  
      <TouchableOpacity
        style={[styles.addButton, !channelId && styles.disabledButton]}
        onPress={() => {
          if (channelId) {
            navigation.navigate('AddNeedPage');
          }
        }}
        disabled={!channelId}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}; 

export default NeedPage;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEDF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    width: '100%',
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  checkbox: {
    alignSelf: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    width: 380,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  colorBar: {
    width: 5,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  icon: {
    fontSize: 20,
    marginLeft: 10,
  },
  noNeedsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNeedsText: {
    fontSize: 18,
    color: '#888',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
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
  statusBoxGreen: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBoxYellow: {
    borderColor: '#FFC107',
    borderWidth: 2,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#000', 
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
  iconBoxText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  
});