export interface Stage {
  id: string
  name: string
  color: string
}

export interface EventType {
  id: string
  name: string
  color: string
  icon?: string
}

export interface Performance {
  id: string
  name: string
  artist: string
  stageId: string
  startTime: string
  endTime: string
  eventTypeId?: string
  description?: string
  date: string // Format: "YYYY-MM-DD"
  // For multi-slot events
  startSlot?: number
  endSlot?: number
  spanSlots?: number
  startTimestamp?: number
  endTimestamp?: number
}

export interface TimeSlotInfo {
  time: string
  index: number
  timestamp: number
}

export interface FestivalDay {
  id: string
  date: string // Format: "YYYY-MM-DD"
  name: string
}

