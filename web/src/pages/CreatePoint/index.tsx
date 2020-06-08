import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'

import api from '../../services/api'
import Dropzone from '../../components/Dropzone'

import './styles.css'

import logo from '../../assets/logo.svg'

interface Item {
  id: number
  title: string
  image_url: string
}

interface State {
  sigla: string
  nome: string
}

interface City {
  nome: string
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])

  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  
  const [selectState, setSelectState] = useState("0")
  const [selectCity, setSelectCity] = useState("0")

  const [initialLatlng, setInitialLatlng] = useState<[number, number]>([0, 0])
  const [selectLatlng, setSelectLatlng] = useState<[number, number]>([0, 0])

  const [selectedFile, setSelectedFile] = useState<File>()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })

  const [selectItems, setSelectItems] = useState<number[]>([])
  
  const [sendStatus, setSendStatus] = useState(false)
  
  const history = useHistory()

  useEffect( () => {
    api.get('items').then(res => {
      setItems(res.data)
    })
  }, [])

  useEffect( () => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(res => {
        setStates(res.data)
      })
  }, [])

  useEffect( () => {
    if (selectState === "0"){
      setCities([])
      return
    }
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectState}/municipios`)
      .then(res => {
        setCities(res.data)
      })
  }, [selectState])

  useEffect( () => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords
      setInitialLatlng([latitude, longitude])
    })
  }, [])

  function handleSelectState (e: ChangeEvent<HTMLSelectElement>) {
    setSelectState(e.target.value)
  }

  function handleSelectCity (e: ChangeEvent<HTMLSelectElement>) {
    setSelectCity(e.target.value)
  }

  function handleMapClick (e: LeafletMouseEvent) {
    setSelectLatlng([e.latlng.lat, e.latlng.lng])
  }

  function handleChangeInput (e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData({...formData, [name]: value })
  }

  function handleSelectItem (id: number) {
    if (selectItems.includes(id)){
      const filterItems = selectItems.filter( item => item !== id)
      setSelectItems(filterItems)
    }
    else
      setSelectItems([...selectItems, id])
  }

  async function handleSubmit (e: FormEvent) {
    e.preventDefault()

    const { name, email, whatsapp } = formData
    const uf = selectState
    const city = selectCity
    const [ latitude, longitude ] = selectLatlng
    const items = selectItems

    const data = new FormData()

    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('city', city)
    data.append('uf', uf)
    data.append('items', items.join(','))
    
    if(selectedFile)
      data.append('image', selectedFile)
    else
      alert ('Falha ao criar o ponto de coleta')

          
    try {
      await api.post('points', data)
      
      setSendStatus(true)
      setTimeout(GoHome, 2500)
    } catch (e) {
      alert ('Falha ao criar o ponto de coleta')
    }
  }
  
  function GoHome() {
    history.push('/')    
  }

  return (
    <div id="page-create-point">
      <header>
        <Link to="/">
          <img src={logo} alt="Ecoleta"/>
        </Link>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
        </fieldset>

        <div className="field">
          <label htmlFor="name">Nome da da entidade</label>
          <input
            type="text"
            name="name"
            id="name"
            onChange={handleChangeInput}
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleChangeInput}
            />
          </div>
          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleChangeInput}
            />
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>
        </fieldset>

        <Map center={initialLatlng} zoom={15} onClick={handleMapClick}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={selectLatlng}/>
        </Map>

        <div className="field-group">
          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select 
              name="uf"
              id="uf"
              onChange={handleSelectState}
              value={selectState}
            >
              <option value="0">Selecione uma UF</option>
              {states.map(state => (
                <option key={state.sigla} value={state.sigla}>{state.nome}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select 
              name="city"
              id="city"
              onChange={handleSelectCity}
              value={selectCity}
            >
              <option value="0">Selecione uma cidade</option>
              {cities.map(city => (
                <option key={city.nome} value={city.nome}>{city.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
        </fieldset>

        <ul className="items-grid">
          
          { items.map(item => (
            <li
              key={item.id}
              onClick={() => handleSelectItem(item.id)}
              className={selectItems.includes(item.id) ? 'selected' : ''}
            >
              <img src={item.image_url} alt={item.title}/>
              <span>{item.title}</span>
            </li>
          ))}
          
        </ul>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
      
      <div className={sendStatus ? "screenModal active" : "screenModal"}>
        <div className="container">
          <div className="check">
            <FiCheckCircle color={"#34CB79"} size={"64px"}/>
          </div>
          <h1>Cadastro Concluido!</h1>
        </div>
      </div>
    </div>
  )
}

export default CreatePoint