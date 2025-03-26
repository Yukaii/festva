"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Performance } from "@/types/festival"
import sessions from "@/data"

interface FestivalDataContextType {
  performances: Performance[]
  setPerformances: (performances: Performance[]) => void
  isLoading: boolean
  error: string | null
}

const FestivalDataContext = createContext<FestivalDataContextType | undefined>(undefined)

export function FestivalDataProvider({ children }: { children: React.ReactNode }) {
  const [performances, setPerformances] = useState<Performance[]>(sessions)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // You could add logic here to load data from localStorage or an API
  useEffect(() => {
    const savedData = localStorage.getItem("festivalPerformances")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setPerformances(parsedData)
      } catch (err) {
        console.error("Failed to parse saved data", err)
      }
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("festivalPerformances", JSON.stringify(performances))
  }, [performances])

  return (
    <FestivalDataContext.Provider
      value={{
        performances,
        setPerformances,
        isLoading,
        error,
      }}
    >
      {children}
    </FestivalDataContext.Provider>
  )
}

export function useFestivalData() {
  const context = useContext(FestivalDataContext)
  if (!context) {
    throw new Error("useFestivalData must be used within a FestivalDataProvider")
  }
  return context
}
