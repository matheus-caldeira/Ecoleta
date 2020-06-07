import React, { useEffect, useState } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { View, ImageBackground, StyleSheet, Text, Image } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'

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
            placeholder={{ label: 'Selecione um Estado (UF)', value: '0', color: '#fff'}}
            onValueChange={(value) => setSelectState(value)}
            items={states.map(state => ({label: state.nome, value: state.sigla}))}
        />
        <RNPickerSelect
            placeholder={{ label: 'Selecione uma Cidade', value: '0'}}
            onValueChange={(value) => handleSelectCity(value)}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});