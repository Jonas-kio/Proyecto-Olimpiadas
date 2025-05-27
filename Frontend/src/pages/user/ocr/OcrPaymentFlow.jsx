import React, { useState } from 'react'
import PaymentUpload from './PaymentUpload'
import OcrResults from './OcrResults'
import ErrorModal from './ErrorModal'

const OcrPaymentFlow = () => {
  const [currentStep, setCurrentStep] = useState('upload')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [detectedName, setDetectedName] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)

  // Datos simulados de pagadores/tutores
  const tutors = [
    {
      id: 1,
      name: 'Ana García',
      studentIds: [1, 2],
    },
    {
      id: 2,
      name: 'Carlos Mendez',
      studentIds: [3],
    },
    {
      id: 3,
      name: 'Elena Rodríguez',
      studentIds: [4, 5],
    },
  ]

  // Datos simulados de estudiantes
  const [students] = useState([
    {
      id: 1,
      name: 'Luis García',
      tutorId: 1,
      grade: '3ro Primaria',
      matched: false,
    },
    {
      id: 2,
      name: 'María García',
      tutorId: 1,
      grade: '5to Primaria',
      matched: false,
    },
    {
      id: 3,
      name: 'Juan Mendez',
      tutorId: 2,
      grade: '2do Secundaria',
      matched: false,
    },
    {
      id: 4,
      name: 'Paula Rodríguez',
      tutorId: 3,
      grade: '1ro Primaria',
      matched: false,
    },
    {
      id: 5,
      name: 'Diego Rodríguez',
      tutorId: 3,
      grade: '4to Primaria',
      matched: false,
    },
  ])

  const [selectedTutorId, setSelectedTutorId] = useState(null)

  const handleImageUpload = (image) => {
    setUploadedImage(image)
  }

  const processReceipt = () => {
    const simulateOcr = () => {
      // Simular detección de un tutor aleatorio
      const success = Math.random() > 0.3
      //const success = false // ⚠️ Forzar el error
      if (success) {
        const randomTutor = tutors[Math.floor(Math.random() * tutors.length)]
        setDetectedName(randomTutor.name)
        setSelectedTutorId(randomTutor.id)
        setCurrentStep('results')
      } else {
        setShowErrorModal(true)
      }
    }
    setTimeout(simulateOcr, 1000)
  }

  const handleConfirmAssociation = () => {
    alert('Asociación confirmada exitosamente')
    setCurrentStep('upload')
    setUploadedImage(null)
    setDetectedName('')
    setSelectedTutorId(null)
  }

  const handleManualAssociation = (manualName) => {
    // Buscar tutor por nombre similar
    const foundTutor = tutors.find((tutor) =>
      tutor.name.toLowerCase().includes(manualName.toLowerCase())
    )
    setDetectedName(manualName)
    setSelectedTutorId(foundTutor?.id || null)
    setShowErrorModal(false)
    setCurrentStep('results')
  }

  // Filtrar estudiantes por tutorId
  const getAssociatedStudents = () => {
    return students.filter((student) => student.tutorId === selectedTutorId)
  }

  return (
    <>
      {currentStep === 'upload' && (
        <PaymentUpload
          onImageUpload={handleImageUpload}
          uploadedImage={uploadedImage}
          onProcess={processReceipt}
        />
      )}

      {currentStep === 'results' && (
        <OcrResults
          detectedName={detectedName}
          setDetectedName={setDetectedName}
          students={getAssociatedStudents()}
          onConfirm={handleConfirmAssociation}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          onClose={() => setShowErrorModal(false)}
          onManualAssociation={handleManualAssociation}
        />
      )}
    </>
  )
}

export default OcrPaymentFlow;
