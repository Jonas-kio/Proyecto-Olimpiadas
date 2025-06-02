import React, { useState } from 'react'
import OcrResults from './OcrResults'

const OcrPaymentFlow = () => {
  // Datos simulados
  const tutors = [
    { id: 1, name: 'Ana García', studentIds: [1, 2] },
    { id: 2, name: 'Carlos Mendez', studentIds: [3] },
    { id: 3, name: 'Elena Rodríguez', studentIds: [4, 5] },
  ]

  const [students] = useState([
    { id: 1, name: 'Luis García', tutorId: 1, grade: '3ro Primaria' },
    { id: 2, name: 'María García', tutorId: 1, grade: '5to Primaria' },
    { id: 3, name: 'Juan Mendez', tutorId: 2, grade: '2do Secundaria' },
    { id: 4, name: 'Paula Rodríguez', tutorId: 3, grade: '1ro Primaria' },
    { id: 5, name: 'Diego Rodríguez', tutorId: 3, grade: '4to Primaria' },
  ])

  // Mostrar resultados directamente para un tutor específico (ejemplo: tutor con id 1)
  const selectedTutorId = 3
  const detectedName = tutors.find(tutor => tutor.id === selectedTutorId)?.name || ''

  const getAssociatedStudents = () => {
    return students.filter(student => student.tutorId === selectedTutorId)
  }

  const handleConfirmAssociation = () => {
    alert('Asociación confirmada exitosamente')
  }

  return (
    <OcrResults
      detectedName={detectedName}
      students={getAssociatedStudents()}
    />
  )
}

export default OcrPaymentFlow
