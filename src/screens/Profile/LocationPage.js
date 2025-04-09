import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';

const LocationPage = () => {
    const { t } = useTranslation();


  return (
    <View>
      <Text>LocationPage</Text>
    </View>
  )
}

export default LocationPage

const styles = StyleSheet.create({})