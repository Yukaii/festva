"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { EventType } from "@/types/festival"
import { Music, Mic, Users, Star, Coffee, Film } from "lucide-react"

interface EventTypeContextType {
  eventTypes: EventType[]
  visibleEventTypes: string[]
  toggleEventTypeVisibility: (eventTypeId: string) => void
  resetEventTypeVisibility: () => void
  getEventTypeById: (id: string | undefined) => EventType | undefined
}

const EventTypeContext = createContext<EventTypeContextType | undefined>(undefined)

export function EventTypeProvider({ children }: { children: React.ReactNode }) {
  const eventTypes: EventType[] = [
    { id: "music", name: "Music", color: "bg-blue-500", icon: "Music" },
    { id: "dj", name: "DJ Set", color: "bg-purple-500", icon: "Disc" },
    { id: "talk", name: "Talk", color: "bg-green-500", icon: "Mic" },
    { id: "workshop", name: "Workshop", color: "bg-yellow-500", icon: "Users" },
    { id: "special", name: "Special Event", color: "bg-red-500", icon: "Star" },
    { id: "break", name: "Break", color: "bg-gray-300", icon: "Coffee" },
  ]

  const [visibleEventTypes, setVisibleEventTypes] = useState<string[]>(eventTypes.map((type) => type.id))

  const toggleEventTypeVisibility = (eventTypeId: string) => {
    setVisibleEventTypes((prev) =>
      prev.includes(eventTypeId) ? prev.filter((id) => id !== eventTypeId) : [...prev, eventTypeId],
    )
  }

  const resetEventTypeVisibility = () => {
    setVisibleEventTypes(eventTypes.map((type) => type.id))
  }

  const getEventTypeById = (id: string | undefined) => {
    if (!id) return undefined
    return eventTypes.find((type) => type.id === id)
  }

  return (
    <EventTypeContext.Provider
      value={{
        eventTypes,
        visibleEventTypes,
        toggleEventTypeVisibility,
        resetEventTypeVisibility,
        getEventTypeById,
      }}
    >
      {children}
    </EventTypeContext.Provider>
  )
}

export function useEventTypes() {
  const context = useContext(EventTypeContext)
  if (!context) {
    throw new Error("useEventTypes must be used within an EventTypeProvider")
  }
  return context
}

export function getEventTypeIcon(iconName: string | undefined) {
  switch (iconName) {
    case "Music":
      return <Music className="h-3 w-3" />
    case "Mic":
      return <Mic className="h-3 w-3" />
    case "Users":
      return <Users className="h-3 w-3" />
    case "Star":
      return <Star className="h-3 w-3" />
    case "Coffee":
      return <Coffee className="h-3 w-3" />
    case "Film":
      return <Film className="h-3 w-3" />
    default:
      return <Music className="h-3 w-3" />
  }
}

