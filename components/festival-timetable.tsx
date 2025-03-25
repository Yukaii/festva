"use client"

import { useState, useMemo } from "react"
import { useStages } from "./stage-provider"
import { useEventTypes } from "./event-type-provider"
import { StageFilter } from "./stage-filter"
import { EventTypeFilter } from "./event-type-filter"
import type { Performance, TimeSlotInfo } from "@/types/festival"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileView } from "./mobile-view"
import { useMobile } from "@/hooks/use-mobile"
import { getEventTypeById, getEventTypeIcon } from "@/lib/event-types"

export function FestivalTimetable() {
  const { stages, visibleStages } = useStages()
  const { visibleEventTypes } = useEventTypes()
  const [favorites, setFavorites] = useState<string[]>([])
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const isMobile = useMobile()

  const timeSlots = generateTimeSlots("11:00", "23:30", 30)
  const performances = festivalData

  // Process performances to add slot information
  const processedPerformances = useMemo(() => {
    return performances.map((performance) => {
      const startSlotIndex = timeSlots.findIndex((slot) => slot.time === performance.startTime)
      const endSlotIndex = timeSlots.findIndex((slot) => slot.time === performance.endTime)

      // If we can't find the exact end time, find the next closest one
      const actualEndSlotIndex =
        endSlotIndex === -1
          ? timeSlots.findIndex(
              (slot) =>
                new Date(`2025-03-29T${slot.time}:00`).getTime() >
                new Date(`2025-03-29T${performance.endTime}:00`).getTime(),
            )
          : endSlotIndex

      const spanSlots = actualEndSlotIndex - startSlotIndex

      return {
        ...performance,
        startSlot: startSlotIndex,
        endSlot: actualEndSlotIndex,
        spanSlots: spanSlots > 0 ? spanSlots : 1,
      }
    })
  }, [performances, timeSlots])

  const toggleFavorite = (performanceId: string) => {
    setFavorites((prev) =>
      prev.includes(performanceId) ? prev.filter((id) => id !== performanceId) : [...prev, performanceId],
    )
  }

  const filteredPerformances = useMemo(() => {
    return processedPerformances.filter((performance) => {
      const stageVisible = visibleStages.includes(performance.stageId)
      const eventTypeVisible = !performance.eventTypeId || visibleEventTypes.includes(performance.eventTypeId)
      const favoriteVisible = !showOnlyFavorites || favorites.includes(performance.id)
      return stageVisible && eventTypeVisible && favoriteVisible
    })
  }, [processedPerformances, visibleStages, visibleEventTypes, showOnlyFavorites, favorites])

  if (isMobile) {
    return (
      <MobileView
        performances={filteredPerformances}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
      />
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-4">
          <StageFilter />
          <EventTypeFilter />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={cn(
              "flex items-center space-x-1 px-3 py-1.5 rounded-md border",
              showOnlyFavorites ? "bg-pink-100 border-pink-300 text-pink-800" : "bg-white",
            )}
          >
            <Heart className={cn("h-4 w-4", showOnlyFavorites ? "fill-pink-500 text-pink-500" : "")} />
            <span>{showOnlyFavorites ? "Showing favorites" : "Show favorites"}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px] relative">
          {/* Header row with stage names */}
          <div className="grid grid-cols-[100px_repeat(10,1fr)] border-b sticky top-0 bg-background z-10">
            <div className="p-2 font-bold text-center">Time</div>
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={cn(
                  "p-2 font-bold text-center border-l",
                  visibleStages.includes(stage.id) ? stage.color : "bg-gray-100 text-gray-400",
                )}
              >
                {stage.name}
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          <div className="relative">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-[100px] border-r">
              {timeSlots.map((slot, index) => (
                <div key={index} className="h-[60px] p-2 text-center font-medium border-b">
                  {slot.time}
                </div>
              ))}
            </div>

            {/* Stage columns */}
            <div className="ml-[100px] grid grid-cols-10">
              {stages.map((stage) => {
                const isVisible = visibleStages.includes(stage.id)

                return (
                  <div
                    key={stage.id}
                    className={cn("relative border-l", !isVisible && "bg-gray-100")}
                    style={{ height: `${timeSlots.length * 60}px` }}
                  >
                    {/* Horizontal time slot lines */}
                    {timeSlots.map((_, index) => (
                      <div
                        key={index}
                        className="absolute w-full border-b"
                        style={{ top: `${index * 60}px`, height: "1px" }}
                      />
                    ))}

                    {/* Performances */}
                    {isVisible &&
                      filteredPerformances
                        .filter((p) => p.stageId === stage.id)
                        .map((performance) => {
                          const startTime = new Date(`2025-03-29T${performance.startTime}:00`).getTime()
                          const endTime = new Date(`2025-03-29T${performance.endTime}:00`).getTime()

                          // Find the closest time slots
                          const startSlotIndex = timeSlots.findIndex((slot) => slot.timestamp >= startTime)
                          const endSlotIndex = timeSlots.findIndex((slot) => slot.timestamp >= endTime)

                          // Calculate position and height
                          const firstSlotTime = timeSlots[0].timestamp
                          const lastSlotTime = timeSlots[timeSlots.length - 1].timestamp
                          const totalTimeRange = lastSlotTime - firstSlotTime

                          const startPosition = ((startTime - firstSlotTime) / totalTimeRange) * (timeSlots.length * 60)
                          const endPosition = ((endTime - firstSlotTime) / totalTimeRange) * (timeSlots.length * 60)
                          const height = endPosition - startPosition

                          const isFavorite = favorites.includes(performance.id)
                          const eventType = getEventTypeById(performance.eventTypeId)

                          return (
                            <div
                              key={performance.id}
                              className={cn(
                                "absolute w-[calc(100%-8px)] mx-1 rounded p-2 flex flex-col justify-between",
                                stage.color,
                                "border border-gray-300 overflow-hidden",
                              )}
                              style={{
                                top: `${startPosition}px`,
                                height: `${Math.max(height, 40)}px`, // Minimum height for very short events
                              }}
                            >
                              <div>
                                <div className="font-medium text-sm">{performance.name}</div>
                                {eventType && (
                                  <div className="flex items-center mt-1 text-xs bg-white/50 rounded px-1 py-0.5 w-fit">
                                    {getEventTypeIcon(eventType.icon)}
                                    <span className="ml-1">{eventType.name}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs opacity-75">{performance.artist}</span>
                                <button
                                  onClick={() => toggleFavorite(performance.id)}
                                  className="opacity-75 hover:opacity-100"
                                >
                                  <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): TimeSlotInfo[] {
  const slots: TimeSlotInfo[] = []
  let current = new Date(`2025-03-29T${startTime}:00`)
  const end = new Date(`2025-03-29T${endTime}:00`)
  let index = 0

  while (current <= end) {
    slots.push({
      time: current.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      index: index++,
      timestamp: current.getTime(),
    })
    current = new Date(current.getTime() + intervalMinutes * 60000)
  }

  return slots
}

// Sample festival data
const festivalData: Performance[] = [
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
    startTime: "22:40",
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

