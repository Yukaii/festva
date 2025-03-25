"use client"
import { useStages } from "./stage-provider"
import { useEventTypes } from "./event-type-provider"
import type { Performance, TimeSlotInfo } from "@/types/festival"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileGridViewProps {
  performances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
  timeSlots: TimeSlotInfo[]
  selectedDate: string
}

export function MobileGridView({
  performances,
  favorites,
  toggleFavorite,
  timeSlots,
  selectedDate,
}: MobileGridViewProps) {
  const { stages, visibleStages } = useStages()
  const { getEventTypeById } = useEventTypes()

  // Filter visible stages
  const filteredStages = stages.filter((stage) => visibleStages.includes(stage.id))

  // Calculate the total time range
  const firstSlotTime = timeSlots[0].timestamp
  const lastSlotTime = timeSlots[timeSlots.length - 1].timestamp
  const totalTimeRange = lastSlotTime - firstSlotTime

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px] relative">
        {/* Header row with stage names - sticky */}
        <div className="sticky top-0 z-10 bg-background">
          <div className="grid grid-cols-[80px_repeat(auto-fill,minmax(120px,1fr))] border-b">
            <div className="p-2 font-bold text-center border-r">Time</div>
            {filteredStages.map((stage) => (
              <div key={stage.id} className={cn("p-2 font-bold text-center border-l text-xs", stage.color)}>
                {stage.name}
              </div>
            ))}
          </div>
        </div>

        {/* Time slots grid */}
        <div className="relative">
          {/* Time labels - sticky */}
          <div className="absolute left-0 top-0 w-[80px] border-r z-10 bg-background">
            {timeSlots.map((slot, index) => {
              // Determine if this is an hour, half-hour, or 10-minute mark
              const date = new Date(slot.timestamp)
              const isHourMark = date.getMinutes() === 0
              const isHalfHourMark = date.getMinutes() === 30

              // Only show labels at hour and half-hour marks
              const showLabel = isHourMark || isHalfHourMark

              return (
                <div
                  key={index}
                  className={cn(
                    "border-b flex items-center justify-center text-xs",
                    isHourMark ? "font-bold" : "font-medium",
                    !showLabel && "text-transparent", // Hide text but keep the element
                  )}
                  style={{
                    height: `20px`,
                    borderBottomWidth: isHourMark ? "2px" : "1px",
                    borderBottomColor: isHourMark ? "#666" : isHalfHourMark ? "#999" : "#ddd",
                  }}
                >
                  {showLabel && slot.time}
                </div>
              )
            })}
          </div>

          {/* Stage columns with grid lines */}
          <div className="ml-[80px] grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
            {filteredStages.map((stage) => (
              <div key={stage.id} className="relative border-l" style={{ height: `${timeSlots.length * 20}px` }}>
                {/* Horizontal time slot lines */}
                {timeSlots.map((slot, index) => {
                  // Determine line style based on time
                  const date = new Date(slot.timestamp)
                  const isHourMark = date.getMinutes() === 0
                  const isHalfHourMark = date.getMinutes() === 30

                  return (
                    <div
                      key={index}
                      className="absolute w-full border-b"
                      style={{
                        top: `${index * 20}px`,
                        height: "1px",
                        borderBottomWidth: isHourMark ? "2px" : "1px",
                        borderBottomColor: isHourMark ? "#666" : isHalfHourMark ? "#999" : "#ddd",
                      }}
                    />
                  )
                })}

                {/* Performances */}
                {performances
                  .filter((p) => p.stageId === stage.id)
                  .map((performance) => {
                    const startTime = performance.startTimestamp!
                    const endTime = performance.endTimestamp!

                    // Calculate position and height
                    const startPosition = ((startTime - firstSlotTime) / totalTimeRange) * (timeSlots.length * 20)
                    const endPosition = ((endTime - firstSlotTime) / totalTimeRange) * (timeSlots.length * 20)
                    const height = endPosition - startPosition

                    const isFavorite = favorites.includes(performance.id)
                    const eventType = getEventTypeById(performance.eventTypeId)

                    return (
                      <div
                        key={performance.id}
                        className={cn(
                          "absolute w-[calc(100%-4px)] mx-0.5 rounded p-1 flex flex-col justify-between",
                          stage.color,
                          "border border-gray-300 overflow-hidden",
                        )}
                        style={{
                          top: `${startPosition}px`,
                          height: `${Math.max(height, 30)}px`, // Minimum height for very short events
                        }}
                      >
                        <div>
                          <div className="font-medium text-xs">{performance.name}</div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] opacity-75">{performance.artist}</span>
                          <button
                            onClick={() => toggleFavorite(performance.id)}
                            className="opacity-75 hover:opacity-100"
                          >
                            <Heart className={cn("h-3 w-3", isFavorite ? "fill-red-500 text-red-500" : "")} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

