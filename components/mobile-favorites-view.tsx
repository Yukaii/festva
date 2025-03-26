"use client"
import { useStages } from "./stage-provider"
import type { Performance } from "@/types/festival"
import { Heart, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MobileFavoritesViewProps {
  performances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
  selectedDate: string
}

export function MobileFavoritesView({
  performances,
  favorites,
  toggleFavorite,
  selectedDate,
}: MobileFavoritesViewProps) {
  const { stages } = useStages()

  // Group performances by time
  const performancesByTime = performances.reduce(
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
    return new Date(`${selectedDate}T${a}:00`).getTime() - new Date(`${selectedDate}T${b}:00`).getTime()
  })

  if (performances.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">此日期沒有收藏的表演。</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">點擊表演上的愛心圖標來添加收藏。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add share button at top */}
      {performances.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const exportRef = document.getElementById("export-schedule-button");
            if (exportRef) exportRef.click();
          }}
          className="w-full"
        >
          <Share2 className="h-4 w-4 mr-2" />
          分享我的行程
        </Button>
      )}
      <div className="space-y-4">
        {sortedTimes.map((time) => (
          <div key={time} className="border rounded-lg overflow-hidden dark:border-gray-800">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 font-medium border-b dark:border-gray-700">{time}</div>
            <div className="divide-y dark:divide-gray-800">
              {performancesByTime[time].map((performance) => {
                const stage = stages.find((s) => s.id === performance.stageId)
                const isFavorite = favorites.includes(performance.id)
                const duration = calculateDuration(performance.startTime, performance.endTime)

                // Calculate duration width as percentage
                const startTime = new Date(`${performance.date}T${performance.startTime}:00`).getTime()
                const endTime = new Date(`${performance.date}T${performance.endTime}:00`).getTime()
                const durationMs = endTime - startTime
                const maxDuration = 3 * 60 * 60 * 1000 // 3 hours as max reference
                const durationPercentage = Math.min(100, (durationMs / maxDuration) * 100)

                return (
                  <div key={performance.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="w-full pr-10">
                        <div className="font-medium">{performance.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <div className={cn("w-2 h-2 rounded-full mr-1", stage?.color || "bg-gray-300")} />
                          {stage?.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{duration}</div>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-1 rounded-full w-full">
                          <div
                            className={cn("h-full rounded-full", stage?.color || "bg-gray-400")}
                            style={{ width: `${durationPercentage}%` }}
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => toggleFavorite(performance.id)} className="p-2">
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
    return `${durationMinutes} 分鐘`
  }
  
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  return minutes > 0 ? `${hours}小時 ${minutes}分鐘` : `${hours}小時`
}
