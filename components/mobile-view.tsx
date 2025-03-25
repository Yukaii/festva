"use client"

import { useState } from "react"
import { useStages } from "./stage-provider"
import { useEventTypes, getEventTypeIcon } from "./event-type-provider"
import type { Performance } from "@/types/festival"
import { Heart, Filter, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StageFilter } from "./stage-filter"
import { EventTypeFilter } from "./event-type-filter"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MobileViewProps {
  performances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
  showOnlyFavorites: boolean
  setShowOnlyFavorites: (show: boolean) => void
}

export function MobileView({
  performances,
  favorites,
  toggleFavorite,
  showOnlyFavorites,
  setShowOnlyFavorites,
}: MobileViewProps) {
  const { stages } = useStages()
  const { getEventTypeById } = useEventTypes()
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  const filteredPerformances = performances.filter((performance) => {
    return !selectedStage || performance.stageId === selectedStage
  })

  // Group performances by time
  const performancesByTime = filteredPerformances.reduce(
    (acc, performance) => {
      if (!acc[performance.startTime]) {
        acc[performance.startTime] = []
      }
      acc[performance.startTime].push(performance)
      return acc
    },
    {} as Record<string, Performance[]>,
  )

  // Sort times
  const sortedTimes = Object.keys(performancesByTime).sort((a, b) => {
    return new Date(`2025-03-29T${a}:00`).getTime() - new Date(`2025-03-29T${b}:00`).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedStage(null)}
            className={cn("text-xs", !selectedStage && "bg-primary text-primary-foreground")}
          >
            All Stages
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter performances by stage and event type</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <StageFilter />
                <EventTypeFilter />
                <div className="pt-2">
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={cn(
                      "flex items-center space-x-1 px-3 py-1.5 rounded-md border w-full justify-center",
                      showOnlyFavorites ? "bg-pink-100 border-pink-300 text-pink-800" : "bg-white",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", showOnlyFavorites ? "fill-pink-500 text-pink-500" : "")} />
                    <span>{showOnlyFavorites ? "Showing favorites" : "Show favorites"}</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>March 29, 2025</span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTimes.map((time) => (
          <div key={time} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-2 font-medium border-b">{time}</div>
            <div className="divide-y">
              {performancesByTime[time].map((performance) => {
                const stage = stages.find((s) => s.id === performance.stageId)
                const isFavorite = favorites.includes(performance.id)
                const eventType = getEventTypeById(performance.eventTypeId)
                const duration = calculateDuration(performance.startTime, performance.endTime)

                // Calculate duration width as percentage
                const startTime = new Date(`2025-03-29T${performance.startTime}:00`).getTime()
                const endTime = new Date(`2025-03-29T${performance.endTime}:00`).getTime()
                const durationMs = endTime - startTime
                const maxDuration = 3 * 60 * 60 * 1000 // 3 hours as max reference
                const durationPercentage = Math.min(100, (durationMs / maxDuration) * 100)

                return (
                  <div key={performance.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="w-full pr-10">
                        <div className="font-medium">{performance.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <div className={cn("w-2 h-2 rounded-full mr-1", stage?.color || "bg-gray-300")} />
                          {stage?.name}
                        </div>
                        {eventType && (
                          <div className="flex items-center mt-1 text-xs bg-gray-100 rounded px-1 py-0.5 w-fit">
                            {getEventTypeIcon(eventType.icon)}
                            <span className="ml-1">{eventType.name}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{duration}</div>
                        <div className="mt-2 bg-gray-200 h-1 rounded-full w-full">
                          <div
                            className={cn("h-full rounded-full", stage?.color || "bg-gray-400")}
                            style={{ width: `${durationPercentage}%` }}
                          />
                        </div>
                      </div>
                      <button onClick={() => toggleFavorite(performance.id)} className="p-2">
                        <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`2025-03-29T${startTime}:00`)
  const end = new Date(`2025-03-29T${endTime}:00`)

  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = Math.floor(durationMs / 60000)

  if (durationMinutes < 60) {
    return `${durationMinutes} min`
  } else {
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

