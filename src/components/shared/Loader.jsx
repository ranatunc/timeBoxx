import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {ActivityIndicator} from 'react-native';

const Loader = () => {
  return (
    <View className='absolute w-full h-full bg-[#ffffff7f] justify-center items-center'>
        <ActivityIndicator siz="large" color="#3B5BDB" />
      <Text className="text-main mt-3">Loader...</Text>
    </View>
  )
}

export default Loader

