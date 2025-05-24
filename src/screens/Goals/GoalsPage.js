import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useContext } from 'react';
import { ChannelContext } from '../../context/ChannelContext';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 
import { GoalsContext } from '../../context/GoalContext';


const GoalsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { activeChannelId } = useContext(ChannelContext); 
  const [channelId, setChannelId] = useState(activeChannelId);
  const { goals, setGoals } = useContext(GoalsContext);

  useEffect(() => {
    if (activeChannelId) {
      setChannelId(activeChannelId);
      fetchGoals(activeChannelId);
    } else {
      setChannelId(null);
    }
  }, [activeChannelId]);

  useEffect(() => {
    if (channelId) {
      fetchGoals(channelId.trim());
    } else {
    }
  }, [channelId]);

  const fetchGoals = async (id) => {
    try {
      if (!id) {
        return;
      }

      const url = `${API_URL}/api/goals/channel/${id}`;
      const response = await axios.get(url);

      setGoals(response.data.goals);

    } catch (err) {
      if (err.response) {

      } else if (err.request) {
      } else {
      }
    } finally {
      setLoading(false);
    }
  };


  const getRandomColor = () => {
    const colors = [
      '#FF6F61', '#FF8C42', '#F4A261', '#E76F51', '#D62828',
      '#ADFF2F', '#7FB800', '#6FCF97', '#2E8B57', '#228B22',
      '#40E0D0', '#20B2AA', '#00CED1', '#00BFFF', '#1E90FF',
      '#6495ED', '#4169E1', '#6A5ACD', '#483D8B', '#191970',
      '#8A2BE2', '#BA55D3', '#DA70D6', '#9932CC', '#9400D3',
      '#C71585', '#FF69B4', '#DB7093', '#E9967A', '#FA8072',
      '#CD853F', '#D2691E', '#A0522D', '#8B4513',
      '#556B2F', '#6B8E23', '#9ACD32',
      '#FFD700', '#FFA500', '#FFB347', '#E1AD01', '#C49E35'

    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const normalizeGoalType = (rawType) => {
    const val = (rawType || '').toLowerCase();
  
    if (val.includes('finans') || val.includes('finance') || val.includes('financial')) return 'financial';

  
    return 'unknown';
  };
  
  return (
    <View style={styles.container }>
        {channelId ? (
            <>
              {goals.length > 0 ? (
                <FlatList
                  contentContainerStyle={styles.listContainer}
                  data={[...goals].reverse()}
                  keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                  
                  renderItem={({ item }) => {
                    const progress = (item.amount > 0 && item.SavedAmount >= 0)
                      ? item.SavedAmount / item.amount
                      : 0;
                  
                    const isComplete = progress >= 1;
 
                    return (
                      <TouchableOpacity
                        style={[
                          styles.goalItem,
                          isComplete && { backgroundColor: '#e4e4e4' }
                        ]}
                        onPress={() =>
                          navigation.navigate('GoalsDetailPage', {
                            goalId: item.id,
                            channelId: item.channelId,
                            goal: item,
                          })
                        }
                      >
                            <View style={styles.goalContentRow}>
                                <View style={[styles.colorBar, { backgroundColor: getRandomColor() }]} />
                                <View style={styles.goalInfo}>
                                      <Text style={styles.goalText}>{t('goals_page.title')} : {item.title}</Text>
                                      <Text style={styles.goalText}>
                                        {t('goals_page.type')} : {t(`goal_types.${normalizeGoalType(item.selectedType)}`)} </Text>
                                      <Text style={styles.goalText}>{t('goals_page.description')} : {item.description}</Text>
                                </View>
                              <View style={styles.chartColumn}>
                                {isComplete ? (
                                  <View style={styles.checkIconWrapper}>
                                      <AntDesign name="checkcircle" size={70} color="#4CAF50" style={{ marginRight: 8 }} />
                                  </View>
                                ) : (
                                  <>
                                    <ProgressChart
                                      data={{ data: [progress] }}
                                      width={100}
                                      height={100}
                                      strokeWidth={10}
                                      radius={32}
                                      chartConfig={{
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                                      }}
                                      hideLegend={true}
                                    />
                                    <Text style={styles.percentageSmall}>
                                      %{(progress * 100).toFixed(1)}
                                    </Text>
                                  </>
                                )}
                              </View>
                            </View>
                      </TouchableOpacity>
                    );
                  }} 
                />
              ) : (
                <View style={styles.noGoalsContainer}>
                      <Text style={styles.noGoalsText}>{t('goals_page.no_goals_text')}</Text>
                </View>
              )}
            </>      
            ) : (
            <View style={styles.messageContainer}>
              <Text style={styles.infoText}>{t('goals_page.open_channel_message')}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.addButton, !channelId && styles.disabledButton]}
            onPress={() => {
              if (channelId) {
                navigation.navigate('CreateGoalsPage', { channelId });
              }
            }}
            disabled={!channelId}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#ECEDF0', 
    marginTop: 5 
  },
  listContainer: { 
    paddingBottom: 20,
     width: '100%'
 },
  goalItem: { 
    padding: 10, 
    backgroundColor: '#fff', 
    marginVertical: 5, 
    borderRadius: 5, 
    position: 'relative' 
  },
  goalText: { 
    fontSize: 18, 
    marginBottom: 10 
  },
  noGoalsContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  noGoalsText: { 
    fontSize: 20, 
    color: '#666', 
    marginBottom: 10 
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 10,
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
  chartColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  colorBar: {
    width: 5,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
    opacity: 0.5,
  },
  infoText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  messageContainer: {
    marginTop: 350,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconWrapper: {
    backgroundColor: '#e4e4e4',
    borderRadius: 35,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
});

export default GoalsPage;
