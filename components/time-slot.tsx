"use client"

import type { Performance, TimeSlotInfo } from "@/types/festival"
import { useStages } from "./stage-provider"
import { useEventTypes, getEventTypeIcon } from "./event-type-provider"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlotProps {
  timeSlot: TimeSlotInfo
  slotIndex: number
  newPerformances: Performance[]
  spanningPerformances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
}

export function TimeSlot({
  timeSlot,
  slotIndex,
  newPerformances,
  spanningPerformances,
  favorites,
  toggleFavorite,
}: TimeSlotProps) {
  const { stages, visibleStages } = useStages()
  const { getEventTypeById } = useEventTypes()

  // Create a map of stageId -> performance for this slot
  const performanceMap = new Map<string, Performance>()

  // Add performances that start in this slot
  newPerformances.forEach((performance) => {
    performanceMap.set(performance.stageId, performance)
  })

  // Add performances that span this slot
  spanningPerformances.forEach((performance) => {
    // Only add if there isn't already a performance starting in this slot for this stage
    if (!performanceMap.has(performance.stageId)) {
      performanceMap.set(performance.stageId, performance)
    }
  })

  return (
    <div className="grid grid-cols-[100px_repeat(10,1fr)] border-b hover:bg-gray-50">
      <div className="p-2 text-center font-medium border-r">{timeSlot.time}</div>

      {stages.map((stage) => {
        const performance = performanceMap.get(stage.id)
        const isVisible = visibleStages.includes(stage.id)
        const isFavorite = performance ? favorites.includes(performance.id) : false
        const eventType = performance ? getEventTypeById(performance.eventTypeId) : undefined

        // Check if this is the first slot for a spanning performance
        const isFirstSlot = performance && performance.startSlot === slotIndex

        // Check if this performance spans multiple slots
        const isMultiSlot = performance && performance.spanSlots > 1

        // Only render the cell content if this is the first slot of the performance or not a multi-slot performance
        const shouldRenderContent = !performance || isFirstSlot

        // For multi-slot performances that aren't in their first slot, we don't render anything
        if (performance && isMultiSlot && !isFirstSlot) {
          return <div key={stage.id} className="border-l"></div>
        }

        return (
          <div
            key={stage.id}
            className={cn(
              "p-2 border-l min-h-[60px]",
              !isVisible && "bg-gray-100",
              isMultiSlot && `row-span-${performance.spanSlots}`,
            )}
            style={isMultiSlot ? { gridRow: `span ${performance.spanSlots}` } : {}}
          >
            {performance && isVisible && shouldRenderContent && (
              <div
                className={cn(
                  "h-full rounded p-2 flex flex-col justify-between",
                  stage.color,
                  "border border-gray-300",
                )}
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
                  <button onClick={() => toggleFavorite(performance.id)} className="opacity-75 hover:opacity-100">
                    <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

