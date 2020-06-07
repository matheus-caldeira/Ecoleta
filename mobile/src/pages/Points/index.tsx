import React, { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, Alert } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location'
import api from '../../services/api'

interface Item {
  id: number
  title: string
  image_url: string
}

interface Point {
  id: number
  name: string
  image: string
  image_url: string
  latitude: number
  longitude: number
}

interface Params { 
  city: string
  uf: string
}

const Points = () => {
  const navigation = useNavigation()
  const route = useRoute()

  const routeParams = route.params as Params
  
  const [points, setPoints] = useState<Point[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectItems, setSelectItems] = useState<number[]>([])
  
  const [positionInit, setPositionInit] = useState<[number, number]>([0, 0])

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data)
    })
  }, [])

  useEffect(() => {
    async function loadPosition(){
      const { status } = await Location.requestPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert('Oops...', 'Precisamos da sua permissão para obter sua localização')
        return;
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords

      setPositionInit([latitude, longitude])
    }

    loadPosition()
  }, [])

  useEffect(() => {
    api.get('points', {
      params: {
        ...routeParams,
        items: selectItems
      }
    }).then(res => {
      setPoints(res.data)
    })
  }, [selectItems])

  function handleNavigateBack () {
    navigation.goBack()
  }

  function handleNavigateToDetail (id: Number) {
    navigation.navigate('Detail', { point_id: id })
  }

  function handleSelectItem (id: number) {
    if (selectItems.includes(id)){
      const filterItems = selectItems.filter( item => item !== id)
      setSelectItems(filterItems)
    }
    else
      setSelectItems([...selectItems, id])
  }

  return (
    <>
      <View style={styles.container} >
        <TouchableOpacity  onPress={handleNavigateBack} >
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          { positionInit[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: positionInit[0],
                longitude: positionInit[1],
                latitudeDelta: 0.015,
                longitudeDelta: 0.015
              }}
            >
              {points.map(point => (
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer} >
                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          ) }
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal:20 }}
        >
          {items.map(item => (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectItems.includes(item.id) ? styles.selectedItem : {}
              ]}
              activeOpacity={0.6}
              onPress={() => handleSelectItem(item.id)}>
              <SvgUri width={42} height={42} uri={item.image_url}/>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </View>
    </>
  )
}

export default Points


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});