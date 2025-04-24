import React from 'react'
import { PlusIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OlympicCard from '../../components/layout/OlimpiadaCard'
import '../../styles/components/DasboardOlimpiada.css'

function DasboardOlimpiada() {

  const navigate = useNavigate()

  const olympicsData = [
    {
      id: 1,
      title: 'Olimpia Científica 2022',
      status: 'En Curso',
      statusColor: 'text-green-600 bg-green-100',
      areas: 'Matemáticas, Física',
      participants: 50,
      modality: 'Virtual',
      imageUrl:
        'https://anitrendz.net/news/wp-content/uploads/2023/02/angel-next-door-spoils-me-rotten-mahiru-shiina-valentines-visual-e1676143192341.jpg',
    },
    {
      id: 2,
      title: 'Olimpia Científica 2019',
      status: 'Terminado',
      statusColor: 'text-red-600 bg-red-100',
      areas: 'Química, Robótica',
      participants: 45,
      modality: 'Presencial',
      imageUrl:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/aZGHtpZzaBEziP9uzAe13s/image.png',
    },
    {
      id: 3,
      title: 'Olimpia Científica 2025',
      status: 'Pendiente',
      statusColor: 'text-blue-600 bg-blue-100',
      areas: 'Matemáticas, Física',
      participants: 60,
      modality: 'Virtual',
      imageUrl:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/aZGHtpZzaBEziP9uzAe13s/image.png',
    },
    {
      id: 4,
      title: 'Olimpia Científica 2017',
      status: 'Terminado',
      statusColor: 'text-red-600 bg-red-100',
      areas: 'Matemáticas, Robótica',
      participants: 35,
      modality: 'Híbrida',
      imageUrl:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/aZGHtpZzaBEziP9uzAe13s/image.png',
    },
    {
      id: 5,
      title: 'Olimpia Científica 2015',
      status: 'Terminado',
      statusColor: 'text-red-600 bg-red-100',
      areas: 'Informática, Robótica',
      participants: 103,
      modality: 'Presencial',
      imageUrl:
        'https://uploadthingy.s3.us-west-1.amazonaws.com/aZGHtpZzaBEziP9uzAe13s/image.png',
    },
  ]

  return (
    <div className="dashboard-olimpiada">

      <div className="dashboard-header card-style">
        <div>
          <h2 className="dashboard-title">Olimpiadas</h2>
          <p className="dashboard-subtitle">
            Historial de las olimpiadas creadas
          </p>
        </div>
        <button className="create-btn" onClick={() => navigate('/app/formulario_Olimpiada')}>
          <PlusIcon size={16} />
          Crear nueva olimpiada
        </button>
      </div>


      <div className="dashboard-grid">
        {olympicsData.map((olympic) => (
          <OlympicCard key={olympic.id} olympic={olympic} />
        ))}
      </div>
    </div>
  )
}

export default DasboardOlimpiada
