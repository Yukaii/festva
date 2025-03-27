"use client"

import { useState, useMemo, useEffect } from "react";
import Link from "next/link"; // Import Link
import { usePathname } from "next/navigation"; // Import usePathname
import { useStages } from "./stage-provider";
import { DateSelector } from "./date-selector";
import type { Performance, TimeSlotInfo, FestivalDay } from "@/types/festival";
import { Heart, Grid, Moon, Sun, Info, Share2, Map, ArrowLeft } from "lucide-react"; // Added Map, ArrowLeft
import { cn } from "@/lib/utils";
import { MobileFavoritesView } from "./mobile-favorites-view";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" // Added Dialog components
import { useFestivalData } from "./festival-data-provider"

// Festival days
const festivalDays: FestivalDay[] = [
  { id: "day1", date: "2025-03-29", name: "第一天 (3月29日)" },
  { id: "day2", date: "2025-03-30", name: "第二天 (3月30日)" },
]

export function FestivalTimetable() {
  const { stages } = useStages()
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('festivalFavorites')
      return savedFavorites ? JSON.parse(savedFavorites) : []
    }
    return []
  })
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(festivalDays[0].date)
  const [mobileView, setMobileView] = useState<"grid" | "favorites">("grid")
  const { theme, setTheme } = useTheme();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); // Added state for modal
  const pathname = usePathname(); // Get current path

  const timeSlots = generateTimeSlots("11:00", "23:50", 10, selectedDate);
  const { performances } = useFestivalData();
  
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

  useEffect(() => {
    localStorage.setItem('festivalFavorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (performanceId: string) => {
    setFavorites((prev) =>
      prev.includes(performanceId)
        ? prev.filter((id) => id !== performanceId)
        : [...prev, performanceId]
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

  // Mobile-first approach: Render mobile layout directly
  return (
    <div>
      {/* Main content area */}
        {mobileView === "grid" ? (
          <ImprovedGridView
            performances={filteredPerformances}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            timeSlots={timeSlots}
            selectedDate={selectedDate}
            showOnlyFavorites={showOnlyFavorites}
          />
        ) : (
          <MobileFavoritesView
            performances={processedPerformances.filter((p) => favorites.includes(p.id))}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            selectedDate={selectedDate}
            theme={theme}
            // Removed onDateChange prop as it's handled internally now
            // onDateChange={setSelectedDate} 
          />
        )}

        {/* Mobile Tools Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex flex-col p-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          {/* Date selector and filter section */}
          {mobileView === "grid" && (
            <div className="flex items-center gap-4 w-full mb-3 border-b border-border pb-3">
              <DateSelector days={festivalDays} selectedDate={selectedDate} onChange={setSelectedDate} />
              <button
                type="button"
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md text-sm whitespace-nowrap",
                  "bg-secondary text-secondary-foreground ml-auto",
                  showOnlyFavorites ? "bg-pink-50 dark:bg-pink-900" : ""
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 mr-1.5",
                    showOnlyFavorites ? "fill-pink-500 text-pink-500" : ""
                  )}
                />
                {showOnlyFavorites ? "全部" : "篩選"}
              </button>
            </div>
          )}
          {/* View and action tools section */}
          <div className="flex justify-center w-full flex-wrap gap-2">
            {/* Back Button (conditional) */}
            {pathname !== "/" && (
              <Link href="/" passHref>
                <button
                  type="button"
                  className="flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
                  aria-label="Back to Timetable"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </Link>
            )}

            {/* Timetable Button */}
            <Link href="/" passHref>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex-1 min-w-[70px] max-w-[120px]",
                  // Style to indicate when grid view is active (and on root path)
                  mobileView === "grid" && pathname === "/" && "bg-primary text-primary-foreground font-medium" 
                )}
                // Timetable button now navigates to root and sets view
                onClick={() => setMobileView("grid")}
              >
                <Grid className="h-4 w-4 mr-1.5" />
                時程表
              </button>
            </Link>

            {/* Map Button */}
            <Link href="/map" passHref>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex-1 min-w-[70px] max-w-[120px]",
                  // Style to indicate when map view is active
                  pathname === "/map" && "bg-primary text-primary-foreground font-medium"
                )}
              >
                <Map className="h-4 w-4 mr-1.5" />
                地圖
              </button>
            </Link>

            {/* Share/Favorites button - only shown if favorites exist, switches TO favorites view */}
            {favorites.length > 0 && pathname === "/" && ( // Only show on timetable page
              <button 
                type="button"
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm flex-1 min-w-[70px] max-w-[120px]",
                  // Style the share button to indicate it leads to favorites view when active
                  mobileView === "favorites" && "bg-primary text-primary-foreground font-medium" 
                )}
                // Share button now switches to the favorites view
                onClick={() => setMobileView("favorites")}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                分享
              </button>
            )}

            <button 
              type="button"
              className="flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
              onClick={toggleTheme}
            >
              {theme === "dark" 
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </button>

            {/* About Button & Modal */}
            <Dialog open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen}>
              <DialogTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center justify-center px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
                  aria-label="About Festva"
                >
                  <Info className="h-4 w-4" />
                </button>
              </DialogTrigger>
              {/* Updated max-height */}
              <DialogContent className="max-h-[calc(100vh-40px)] overflow-y-auto w-[calc(100%-20px)] mx-auto">
                <DialogHeader>
                  <DialogTitle>關於 Festva</DialogTitle>
                  <DialogDescription>
                    Festva 是一個簡單的音樂祭時間表應用程式，幫助您規劃您的音樂祭體驗。
                    <br /><br />
                    原始碼可在 GitHub 上找到：
                    <a 
                      href="https://github.com/Yukaii/festva" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline ml-1"
                    >
                      Yukaii/festva
                    </a>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
  )
  // Removed the desktop-specific return block
}

interface ImprovedGridViewProps {
  performances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
  timeSlots: TimeSlotInfo[]
  selectedDate: string
  showOnlyFavorites: boolean
}

function ImprovedGridView({
  performances,
  favorites,
  toggleFavorite,
  timeSlots,
  selectedDate,
  showOnlyFavorites,
}: ImprovedGridViewProps) {
  const { stages } = useStages()
  const DEBUG_MODE = process.env.NODE_ENV === 'development'; // Enable debug mode in development
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (DEBUG_MODE) {
      // Set a fixed time around 12 PM for debugging
      const debugDate = new Date(selectedDate);
      debugDate.setHours(12, 0, 0, 0);
      setCurrentTime(debugDate);
      // No interval needed in debug mode
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, [DEBUG_MODE, selectedDate]); // Add selectedDate dependency for debug mode

  const stagesToDisplay = useMemo(() => {
    if (!showOnlyFavorites) {
      return stages
    }
    const stageIds = new Set(performances.filter((p) => favorites.includes(p.id)).map((p) => p.stageId))
    return stages.filter((stage) => stageIds.has(stage.id))
  }, [stages, performances, favorites, showOnlyFavorites])

  const firstSlotTime = timeSlots.length > 0 ? timeSlots[0].timestamp : 0;
  // const lastSlotTime = timeSlots.length > 0 ? timeSlots[timeSlots.length - 1].timestamp : 0; // Not needed for adjusted calculation
  const intervalMinutes = 10; // The interval used in generateTimeSlots
  const intervalMilliseconds = intervalMinutes * 60000;
  const rowHeight = 30 // Match the h-[30px] used for time slots
  const totalHeight = timeSlots.length * rowHeight;
  // Adjusted total time range to match the total height duration
  const adjustedTotalTimeRange = timeSlots.length > 0 ? timeSlots.length * intervalMilliseconds : 0;
  // Adjust the reference start time back by one interval to align calculations with grid lines
  const adjustedFirstSlotTime = firstSlotTime - intervalMilliseconds;

  const isToday = useMemo(() => {
    const today = new Date();
    const selected = new Date(selectedDate);
    return today.toDateString() === selected.toDateString();
  }, [selectedDate]);

  const nowIndicatorTop = useMemo(() => {
    // Use adjustedFirstSlotTime for range checks and calculations
    if (adjustedTotalTimeRange <= 0 || !firstSlotTime) return null; // Keep original firstSlotTime check for validity

    const currentTimestamp = currentTime.getTime();
    // Effective end time relative to the original firstSlotTime
    const effectiveEndTime = firstSlotTime + adjustedTotalTimeRange;

    // Check if current time is within the visual range [firstSlotTime, effectiveEndTime)
    if (currentTimestamp < firstSlotTime || currentTimestamp >= effectiveEndTime) {
       // Also check debug mode specifically, as its fixed time might be outside the range
       if (DEBUG_MODE && (currentTimestamp < firstSlotTime || currentTimestamp >= effectiveEndTime)) {
         console.warn("Debug time is outside the timetable range.");
       }
      return null;
    }

    // Calculate position using the adjusted start time and original range
    const position = ((currentTimestamp - adjustedFirstSlotTime) / adjustedTotalTimeRange) * totalHeight;

    // In debug mode, always return the calculated position if within range
    if (DEBUG_MODE) {
      return position;
    }

    // Original logic: only return position if it's today
    if (!isToday) return null;

    return position;

  }, [currentTime, firstSlotTime, adjustedFirstSlotTime, adjustedTotalTimeRange, totalHeight, isToday, DEBUG_MODE]); // Add adjustedFirstSlotTime dependency

  return (
    // Apply mobile styles directly
    <div className={cn(
      "grid grid-rows-[auto_1fr] overflow-auto h-[calc(100vh-200px)] relative border border-border scrollbar",
      "grid-cols-[50px_1fr]" // Use mobile grid columns directly
    )}>
      <div className="bg-background border-r border-b border-border sticky top-0 left-0 z-30" />

      <div className="grid auto-cols-[minmax(120px,1fr)] grid-flow-col sticky top-0 z-20 bg-background">
        {stagesToDisplay.map((stage) => (
          <div key={stage.id} className={cn("p-2 font-bold text-center border-l border-b border-border", stage.color)}>
            {stage.name}
          </div>
        ))}
      </div>

      {/* Time Column */}
      <div className="flex flex-col sticky left-0 z-10 bg-background border-r border-border">
        {/* Current Time Label Indicator */}
        {nowIndicatorTop !== null && (
          <div
            className="absolute left-0 w-full z-20 flex items-center justify-center"
            style={{ top: `${nowIndicatorTop}px`, transform: 'translateY(-50%)' }} // Center vertically
          >
            <span className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded leading-none">
              {currentTime.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </span>
          </div>
        )}
        {timeSlots.map((slot) => {
          const date = new Date(slot.timestamp);
          const isHourMark = date.getMinutes() === 0
          const isHalfHourMark = date.getMinutes() === 30
          const showLabel = isHourMark || isHalfHourMark
          return (
            <div
              key={`time-${slot.timestamp}`}
              className={cn(
                "h-[30px] flex items-center justify-center border-b border-border",
                "text-xs px-0.5", // Use mobile text size directly
                isHourMark ? "font-bold border-b-2 border-foreground/70" : 
                isHalfHourMark ? "border-b border-foreground/50" : ""
              )}
            >
              {showLabel && slot.time}
            </div>
          )
        })}
      </div>

      {/* Grid Area */}
      <div
        className="grid grid-flow-col relative"
        style={{
          gridTemplateColumns: `repeat(${stagesToDisplay.length}, minmax(120px, 1fr))`,
        }}
      >
        {/* Current Time Horizontal Line */}
        {nowIndicatorTop !== null && (
          <div
            className="absolute top-0 left-0 w-full h-0.5 bg-red-500 z-20"
            style={{ top: `${nowIndicatorTop}px` }}
          />
        )}
        {stagesToDisplay.map((stage) => (
          <div key={stage.id} className="relative border-l border-border min-h-full">
            {timeSlots.map((slot) => {
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

            {performances
              .filter((p) => p.stageId === stage.id)
              .map((performance) => {
                const startTime = performance.startTimestamp || 0
                const endTime = performance.endTimestamp || 0
                // Use adjustedFirstSlotTime for performance positioning
                const startPosition = adjustedTotalTimeRange > 0 ? ((startTime - adjustedFirstSlotTime) / adjustedTotalTimeRange) * totalHeight : 0;
                const endPosition = adjustedTotalTimeRange > 0 ? ((endTime - adjustedFirstSlotTime) / adjustedTotalTimeRange) * totalHeight : 0;
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
                      height: `${Math.max(height, 50)}px`, // Use mobile height directly
                      minHeight: "50px" // Use mobile min-height directly
                    }}
                    onClick={() => toggleFavorite(performance.id)}
                  >
                    <div className="flex-1 min-w-0 pr-6 text-black">
                      <div className={cn("font-bold line-clamp-5", "text-xs")}> {/* Use mobile text size */}
                        {performance.name}
                      </div>
                      <div className={cn("text-[10px]")}> {/* Use mobile text size */}
                        {performance.startTime} - {performance.endTime}
                      </div>
                    </div>
                    <div className="absolute top-1 right-1">
                      <Heart
                        className={cn(
                          "h-3 w-3", // Use mobile icon size
                          isFavorite ? "fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400" : ""
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
