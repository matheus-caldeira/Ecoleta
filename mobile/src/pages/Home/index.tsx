import React, { useEffect, useState } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { View, ImageBackground, Text, Image } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'
import styles, { defaultStyles } from './styles'

interface State {
  sigla: string
  nome: string
}

interface City {
  nome: string
}


const Home = () => {
  const navigation = useNavigation()

  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  
  const [selectState, setSelectState] = useState("0")
  const [selectCity, setSelectCity] = useState("0")

  useEffect( () => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(res => {
        setStates(res.data)
      })
  }, [])

  useEffect( () => {
    if (selectState === "null"){
      setCities([])
      return
    }
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectState}/municipios`)
      .then(res => {
        setCities(res.data)
      })
  }, [selectState])

  function handleNavigateToPoints () {
    navigation.navigate('Points', { city: selectCity, uf: selectState })
  }

  function handleSelectState (state: string){
    setSelectState(state)
  }

  function handleSelectCity (city: string) {
    setSelectCity(city)
  }

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos a encontrarem pontos de coleta de forma eficiente.</Text>
      </View>

      <View style={styles.footer} >
        <RNPickerSelect
            placeholder={{ label: 'Selecione o estado', value: '0', color: '#fff'}}
            onValueChange={(value) => setSelectState(value)}
            style={{
              ...defaultStyles,			
              //  viewContainer:styles.select,
              //  inputAndroid:styles.input
             }}
            items={states.map(state => ({label: state.nome, value: state.sigla}))}
        />
        <RNPickerSelect
            placeholder={{ label: 'Selecione a cidade', value: '0'}}
            onValueChange={(value) => handleSelectCity(value)}
            style={defaultStyles}
            items={cities.map(city => ({label: city.nome, value: city.nome}))}
        />
        <RectButton style={styles.button} onPress={handleNavigateToPoints} >
          <View style={styles.buttonIcon} >
            <Icon name="arrow-right" color="#FFF" size={24} ></Icon>
          </View>
          <Text style={styles.buttonText} >
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

export default Home