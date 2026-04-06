import React, { createContext, useContext, useState } from 'react'
import { clinics } from '../data/dummyData'

const ClinicContext = createContext(null)

export function ClinicProvider({ children }) {
  const [selectedClinic, setSelectedClinic] = useState(clinics[0])
  const [clinicList, setClinicList] = useState(clinics)
  const [refreshKey, setRefreshKey] = useState(0)

  const switchClinic = (clinicId) => {
    const clinic = clinicList.find(c => c.id === clinicId)
    if (clinic) {
      setSelectedClinic(clinic)
      setRefreshKey(k => k + 1)
    }
  }

  const updateClinic = (updatedClinic) => {
    setClinicList(prev => prev.map(c => c.id === updatedClinic.id ? updatedClinic : c))
    if (selectedClinic.id === updatedClinic.id) {
      setSelectedClinic(updatedClinic)
    }
  }

  const addClinic = (clinic) => {
    const newClinic = { ...clinic, id: Date.now() }
    setClinicList(prev => [...prev, newClinic])
    return newClinic
  }

  const deleteClinic = (clinicId) => {
    setClinicList(prev => {
      const next = prev.filter(c => c.id !== clinicId)
      if (selectedClinic.id === clinicId && next.length > 0) {
        setSelectedClinic(next[0])
        setRefreshKey(k => k + 1)
      }
      return next
    })
  }

  return (
    <ClinicContext.Provider value={{ selectedClinic, clinicList, switchClinic, updateClinic, addClinic, deleteClinic, refreshKey }}>
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  return useContext(ClinicContext)
}
