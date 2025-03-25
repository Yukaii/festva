"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Performance } from "@/types/festival"

interface FestivalDataContextType {
  performances: Performance[]
  setPerformances: (performances: Performance[]) => void
  isLoading: boolean
  error: string | null
}

const FestivalDataContext = createContext<FestivalDataContextType | undefined>(undefined)

// Sample festival data
const initialData: Performance[] = [
  {
    id: "p1",
    name: "嘻哈派對",
    artist: "嘻哈派對",
    stageId: "stage1",
    startTime: "11:00",
    endTime: "12:00",
    eventTypeId: "music",
  },
  {
    id: "p2",
    name: "南西音樂",
    artist: "南西音樂",
    stageId: "stage3",
    startTime: "11:00",
    endTime: "12:00",
    eventTypeId: "music",
  },
  {
    id: "p3",
    name: "真愛第一站",
    artist: "真愛第一站",
    stageId: "stage2",
    startTime: "13:30",
    endTime: "14:30",
    eventTypeId: "talk",
  },
  {
    id: "p4",
    name: "Mario Zwinkle",
    artist: "Mario Zwinkle",
    stageId: "stage4",
    startTime: "13:30",
    endTime: "14:30",
    eventTypeId: "music",
  },
  {
    id: "p5",
    name: "DJ Yellow Yellow",
    artist: "DJ Yellow Yellow",
    stageId: "stage5",
    startTime: "13:30",
    endTime: "15:30",
    eventTypeId: "dj",
  },
  {
    id: "p6",
    name: "公路青少年",
    artist: "公路青少年",
    stageId: "stage9",
    startTime: "13:30",
    endTime: "14:30",
    eventTypeId: "music",
  },
  {
    id: "p7",
    name: "Megaport",
    artist: "Megaport",
    stageId: "stage1",
    startTime: "17:30",
    endTime: "18:30",
    eventTypeId: "special",
  },
  { id: "p8", name: "VH", artist: "VH", stageId: "stage2", startTime: "19:00", endTime: "20:00", eventTypeId: "music" },
  {
    id: "p9",
    name: "Anus",
    artist: "Anus",
    stageId: "stage4",
    startTime: "19:00",
    endTime: "20:00",
    eventTypeId: "music",
  },
  {
    id: "p10",
    name: "一起走",
    artist: "一起走",
    stageId: "stage5",
    startTime: "19:00",
    endTime: "20:00",
    eventTypeId: "music",
  },
  {
    id: "p11",
    name: "孫子王",
    artist: "孫子王",
    stageId: "stage9",
    startTime: "19:00",
    endTime: "20:00",
    eventTypeId: "music",
  },
  {
    id: "p12",
    name: "BATTLES",
    artist: "BATTLES",
    stageId: "stage1",
    startTime: "20:30",
    endTime: "22:30",
    eventTypeId: "music",
  },
  {
    id: "p13",
    name: "EmptyOtto",
    artist: "EmptyOtto",
    stageId: "stage2",
    startTime: "20:30",
    endTime: "21:30",
    eventTypeId: "music",
  },
  {
    id: "p14",
    name: "三寶表演",
    artist: "三寶表演",
    stageId: "stage3",
    startTime: "20:30",
    endTime: "21:30",
    eventTypeId: "workshop",
  },
  {
    id: "p15",
    name: "KoTK",
    artist: "KoTK",
    stageId: "stage5",
    startTime: "20:30",
    endTime: "21:30",
    eventTypeId: "music",
  },
  {
    id: "p16",
    name: "SHOOTUP",
    artist: "SHOOTUP",
    stageId: "stage9",
    startTime: "20:30",
    endTime: "21:30",
    eventTypeId: "music",
  },
  {
    id: "p17",
    name: "Creepy Nuts",
    artist: "Creepy Nuts",
    stageId: "stage1",
    startTime: "22:00",
    endTime: "23:00",
    eventTypeId: "music",
  },
  {
    id: "p18",
    name: "I Mean Us",
    artist: "I Mean Us",
    stageId: "stage3",
    startTime: "22:00",
    endTime: "23:00",
    eventTypeId: "music",
  },
  {
    id: "p19",
    name: "Goose",
    artist: "Goose",
    stageId: "stage5",
    startTime: "22:00",
    endTime: "23:30",
    eventTypeId: "music",
  },
]

export function FestivalDataProvider({ children }: { children: React.ReactNode }) {
  const [performances, setPerformances] = useState<Performance[]>(initialData)
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

