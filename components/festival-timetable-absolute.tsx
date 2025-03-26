"use client"

import { useState, useMemo, useEffect } from "react"
import { useStages } from "./stage-provider"
import { DateSelector } from "./date-selector"
import type { Performance, TimeSlotInfo, FestivalDay } from "@/types/festival"
import { Heart, Grid, Moon, Sun, Calendar, Settings, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileFavoritesView } from "./mobile-favorites-view"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useFestivalData } from "./festival-data-provider"
import { ExportSchedule } from "./export-schedule"

// Festival days
const festivalDays: FestivalDay[] = [
  { id: "day1", date: "2025-03-29", name: "第一天 (3月29日)" },
  { id: "day2", date: "2025-03-30", name: "第二天 (3月30日)" },
]

export function FestivalTimetable() {
  const { stages } = useStages()
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Try to load favorites from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('festivalFavorites')
      return savedFavorites ? JSON.parse(savedFavorites) : []
    }
    return []
  })
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(festivalDays[0].date)
  const [mobileView, setMobileView] = useState<"grid" | "favorites">("grid")
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()

  // Generate time slots every 10 minutes
  const timeSlots = generateTimeSlots("11:00", "23:50", 10, selectedDate)

  // Get performances from the FestivalDataProvider
  const { performances } = useFestivalData()
  
  // Process performances to add timestamp information
  const processedPerformances = useMemo(() => {
    return performances.map((performance) => {
      const startTime = new Date(`${performance.date}T${performance.startTime}:00`).getTime()
      const endTime = new Date(`${performance.date}T${performance.endTime}:00`).getTime()

      return {
        ...performance,
        startTimestamp: startTime,
        endTimestamp: endTime,
      }
    })
  }, [performances])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('festivalFavorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (performanceId: string) => {
    setFavorites((prev) =>
      prev.includes(performanceId) ? prev.filter((id) => id !== performanceId) : [...prev, performanceId],
    )
  }

  const filteredPerformances = useMemo(() => {
    return processedPerformances.filter((performance) => {
      const favoriteVisible = !showOnlyFavorites || favorites.includes(performance.id)
      const dateMatch = performance.date === selectedDate
      return favoriteVisible && dateMatch
    })
  }, [processedPerformances, showOnlyFavorites, favorites, selectedDate])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (isMobile) {
    return (
      <div className="pb-[200px]">
        {/* Main content area */}
        {mobileView === "grid" ? (
          <ImprovedGridView
            performances={filteredPerformances}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            timeSlots={timeSlots}
            selectedDate={selectedDate}
            isMobile={true}
            showOnlyFavorites={showOnlyFavorites}
          />
        ) : (
          <MobileFavoritesView
            performances={processedPerformances.filter((p) => favorites.includes(p.id))}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            selectedDate={selectedDate}
          />
        )}

        {/* Export section for mobile */}
        {favorites.length > 0 && mobileView === "favorites" && (
          <div>
            <ExportSchedule
              performances={processedPerformances}
              favorites={favorites}
              stages={stages}
              selectedDate={selectedDate}
              theme={theme || "light"}
              onShare={() => setMobileView("grid")}
            />
          </div>
        )}
        
        {/* Floating filter button for grid view */}
        {mobileView === "grid" && (
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={cn(
              "fixed bottom-20 right-4 z-[100] rounded-full shadow-lg",
              "px-4 py-2 text-sm border bg-background",
              showOnlyFavorites ? "bg-pink-50 dark:bg-pink-900" : ""
            )}
          >
            <Heart className={cn(
              "h-4 w-4 inline-block mr-1",
              showOnlyFavorites ? "fill-pink-500 text-pink-500" : ""
            )} />
            <span>{showOnlyFavorites ? "全部" : "篩選"}</span>
          </button>
        )}

        {/* Mobile Tools Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex flex-col p-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          {/* Date selector section */}
          {mobileView === "grid" && (
            <div className="flex justify-center w-full mb-3 border-b border-border pb-3">
              <DateSelector days={festivalDays} selectedDate={selectedDate} onChange={setSelectedDate} />
            </div>
          )}
          
          {/* View and action tools section */}
          <div className="flex justify-center w-full flex-wrap gap-2">
            <button 
              type="button"
              className={cn(
                "flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex-1 min-w-[70px] max-w-[120px]",
                mobileView === "favorites" && "bg-primary text-primary-foreground font-medium"
              )}
              onClick={() => setMobileView(mobileView === "grid" ? "favorites" : "grid")}
            >
              {mobileView === "grid" ? (
                <>
                  <Heart className="h-4 w-4 mr-1.5" />
                  收藏清單
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4 mr-1.5" />
                  時程表
                </>
              )}
            </button>
            
            {favorites.length > 0 && (
              <button 
                type="button"
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex-1 min-w-[70px] max-w-[120px]",
                  mobileView === "favorites" && "bg-primary text-primary-foreground font-medium"
                )}
                onClick={() => setMobileView("favorites")}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                分享
              </button>
            )}

            <button 
              type="button"
              className="flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex-1 min-w-[70px] max-w-[120px]"
              onClick={toggleTheme}
            >
              {theme === "dark" 
                ? <Sun className="h-4 w-4 mr-1.5" />
                : <Moon className="h-4 w-4 mr-1.5" />
              }
              {theme === "dark" ? "亮色" : "暗色"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <DateSelector days={festivalDays} selectedDate={selectedDate} onChange={setSelectedDate} />

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {theme === "dark" ? "亮色模式" : "暗色模式"}
          </Button>

          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={cn(
              "flex items-center space-x-1 px-3 py-1.5 rounded-md border",
              "bg-white dark:bg-gray-800",
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                showOnlyFavorites ? "fill-pink-500 text-pink-500 dark:fill-pink-300 dark:text-pink-300" : "",
              )}
            />
            <span>{showOnlyFavorites ? "僅顯示收藏" : "顯示全部"}</span>
          </button>
          
          {favorites.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMobileView("favorites")}
            >
              <Share2 className="h-4 w-4 mr-2" />
              分享行程
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <ImprovedGridView
          performances={filteredPerformances}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          timeSlots={timeSlots}
          selectedDate={selectedDate}
          isMobile={false}
          showOnlyFavorites={showOnlyFavorites}
        />
        
        {favorites.length > 0 && (
          <div className={cn(mobileView === "favorites" ? "" : "border-t pt-6 mt-6")}>
            <ExportSchedule
              performances={processedPerformances}
              favorites={favorites}
              stages={stages}
              selectedDate={selectedDate}
              theme={theme || "light"}
              onShare={() => {
                // Desktop view doesn't need to switch views
                // Just refresh to ensure state is updated
                void(0)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface ImprovedGridViewProps {
  performances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
  timeSlots: TimeSlotInfo[]
  selectedDate: string
  isMobile: boolean
  showOnlyFavorites: boolean
}

function ImprovedGridView({
  performances,
  favorites,
  toggleFavorite,
  timeSlots,
  selectedDate,
  isMobile,
  showOnlyFavorites,
}: ImprovedGridViewProps) {
  const { stages } = useStages()

  // Get stages to display
  const stagesToDisplay = useMemo(() => {
    if (!showOnlyFavorites) {
      // Show all stages when not filtering by favorites
      return stages
    }
    
    // When showing only favorites, only include stages with favorited performances
    const stageIds = new Set(performances.filter((p) => favorites.includes(p.id)).map((p) => p.stageId))
    return stages.filter((stage) => stageIds.has(stage.id))
  }, [stages, performances, favorites, showOnlyFavorites])

  // Calculate the total time range
  const firstSlotTime = timeSlots[0].timestamp
  const lastSlotTime = timeSlots[timeSlots.length - 1].timestamp
  const totalTimeRange = lastSlotTime - firstSlotTime

  // Calculate row height - smaller for mobile
  const rowHeight = isMobile ? 20 : 30

  return (
    <div className={cn(
      "grid grid-rows-[auto_1fr] overflow-auto h-[calc(100vh-200px)] relative border border-border scrollbar",
      isMobile ? "grid-cols-[50px_1fr]" : "grid-cols-[80px_1fr]"
    )}>
      <div className="bg-background border-r border-b border-border sticky top-0 left-0 z-30" />

      {/* Stage headers */}
      <div className="grid auto-cols-[minmax(120px,1fr)] grid-flow-col sticky top-0 z-20 bg-background">
        {stagesToDisplay.map((stage) => (
          <div key={stage.id} className={cn("p-2 font-bold text-center border-l border-b border-border", stage.color)}>
            {stage.name}
          </div>
        ))}
      </div>

      {/* Time labels */}
      <div className="flex flex-col sticky left-0 z-10 bg-background border-r border-border">
        {timeSlots.map((slot, index) => {
          // Determine if this is an hour, half-hour, or 10-minute mark
          const date = new Date(slot.timestamp)
          const isHourMark = date.getMinutes() === 0
          const isHalfHourMark = date.getMinutes() === 30

          // Only show labels at hour and half-hour marks
          const showLabel = isHourMark || isHalfHourMark

          return (
            <div
              key={`time-${slot.timestamp}`}
              className={cn(
                "h-[30px] flex items-center justify-center border-b border-border",
                isMobile ? "text-xs px-0.5" : "text-sm",
                isHourMark ? "font-bold border-b-2 border-foreground/70" : 
                isHalfHourMark ? "border-b border-foreground/50" : ""
              )}
            >
              {showLabel && slot.time}
            </div>
          )
        })}
      </div>

      {/* Grid content */}
      <div
        className="grid grid-flow-col relative"
        style={{
          gridTemplateColumns: `repeat(${stagesToDisplay.length}, minmax(120px, 1fr))`,
        }}
      >
        {stagesToDisplay.map((stage) => (
          <div key={stage.id} className="relative border-l border-border min-h-full">
            {timeSlots.map((slot, slotIndex) => {
              // Determine line style based on time
              const date = new Date(slot.timestamp)
              const isHourMark = date.getMinutes() === 0
              const isHalfHourMark = date.getMinutes() === 30

              return (
                <div
                  key={`${stage.id}-${slot.timestamp}`}
                  className={cn(
                    "h-[30px] border-b border-border",
                    isHourMark ? "border-b-2 border-foreground/70" : 
                    isHalfHourMark ? "border-b border-foreground/50" : ""
                  )}
                />
              )
            })}

            {/* Performances for this stage */}
            {performances
              .filter((p) => p.stageId === stage.id)
              .map((performance) => {
                const startTime = performance.startTimestamp || 0
                const endTime = performance.endTimestamp || 0

                // Calculate position and height
                const startPosition = ((startTime - firstSlotTime) / totalTimeRange) * (timeSlots.length * rowHeight)
                const endPosition = ((endTime - firstSlotTime) / totalTimeRange) * (timeSlots.length * rowHeight)
                const height = endPosition - startPosition

                const isFavorite = favorites.includes(performance.id)

                return (
                  <button
                    key={performance.id}
                    type="button"
                    className={cn(
                      "absolute w-[calc(100%-8px)] mx-1 rounded p-2 flex flex-col justify-between border border-border overflow-hidden text-left",
                      stage.color
                    )}
                    style={{
                      top: `${startPosition}px`,
                      height: `${Math.max(height, isMobile ? 50 : 60)}px`,
                      minHeight: isMobile ? "50px" : "60px"
                    }}
                    onClick={() => toggleFavorite(performance.id)}
                  >
                    <div className="flex-1 min-w-0 pr-6 text-black">
                      <div className={cn("font-bold line-clamp-5", isMobile ? "text-xs" : "text-sm")}>
                        {performance.name}
                      </div>
                      <div className={cn(isMobile ? "text-[10px]" : "text-xs text-gray-600 dark:text-gray-400")}>
                        {performance.startTime} - {performance.endTime}
                      </div>
                    </div>
                    <div className="absolute top-1 right-1">
                      <Heart
                        className={cn(
                          isMobile ? "h-3 w-3" : "h-4 w-4",
                          isFavorite ? "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400" : "",
                        )}
                      />
                    </div>
                  </button>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}

function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number, date: string): TimeSlotInfo[] {
  const slots: TimeSlotInfo[] = []
  let current = new Date(`${date}T${startTime}:00`)
  const end = new Date(`${date}T${endTime}:00`)
  let index = 0

  while (current <= end) {
    slots.push({
      time: current.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }),
      index: index++,
      timestamp: current.getTime(),
    })
    current = new Date(current.getTime() + intervalMinutes * 60000)
  }

  return slots
}
