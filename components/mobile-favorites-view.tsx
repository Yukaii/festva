"use client"
import { useState } from "react"
import { useStages } from "./stage-provider"
import type { Performance } from "@/types/festival"
import { Heart, Share2, Download } from "lucide-react"
import { generateScheduleImage } from "@/lib/export-image"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MobileFavoritesViewProps {
  performances: Performance[]
  favorites: string[]
  toggleFavorite: (id: string) => void
  selectedDate: string; // Keep selectedDate to initialize local state
  theme: string | undefined; // Accept string | undefined from useTheme
  // Removed onDateChange prop type
}

export function MobileFavoritesView({
  performances,
  favorites,
  toggleFavorite,
  selectedDate, // Keep selectedDate prop for initialization
  theme,
  // Removed onDateChange prop
}: MobileFavoritesViewProps) {
  const { stages } = useStages();
  // Add local state for the date selected within the favorites view
  const [favoritesSelectedDate, setFavoritesSelectedDate] = useState<string>(selectedDate);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    setImageUrl(null) // Clear previous image
    try {
      const generatedImageUrl = await generateScheduleImage({
        performances,
        stages,
        theme: theme === "dark" ? "dark" : "light",
        isMobile: true,
        selectedDate: favoritesSelectedDate // Use local state for image generation
      });
      setImageUrl(generatedImageUrl);
      setIsDialogOpen(true) // Open dialog once image is ready
    } catch (error) {
      console.error("Error generating image:", error)
      // Handle error (e.g., show a toast message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `my-schedule-${favoritesSelectedDate}.png`; // Use local state for download name
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
    }
  }

  // Filter performances based on the locally selected date FIRST
  const filteredPerformancesForDate = performances.filter(p => p.date === favoritesSelectedDate);

  // Group performances by time
  const performancesByTime = filteredPerformancesForDate.reduce(
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
    // Use local state for sorting
    return new Date(`${favoritesSelectedDate}T${a}:00`).getTime() - new Date(`${favoritesSelectedDate}T${b}:00`).getTime();
  })

  // Check if there are any favorites across all dates
  const hasAnyFavorites = performances.some(p => favorites.includes(p.id));

  // Check filtered performances for the selected date
  // NOTE: Early return removed to always show date tabs

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-4 pb-16">
        {/* Date Tabs - Always visible */}
        <Tabs value={favoritesSelectedDate} onValueChange={setFavoritesSelectedDate} className="w-full sticky top-10 z-10 bg-background py-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="2025-03-29">Day 1 (3/29)</TabsTrigger>
            <TabsTrigger value="2025-03-30">Day 2 (3/30)</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Share Button - Always visible if any favorites exist */}
        {hasAnyFavorites && (
          <div className="sticky top-[calc(theme(spacing.10)+50px)] z-10 bg-background py-2"> {/* Adjust top based on Tabs height */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <title>Loading</title> {/* Added title */}
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> {/* Self-closing */}
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> {/* Self-closing */}
                  </svg>
                  產生中...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  分享我的行程
                </>
              )}
            </Button>
          </div>
        )}

        {/* Conditional Content based on filtered performances for the selected date */}
        {filteredPerformancesForDate.length > 0 ? (
          <>
            {/* Performance List */}
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
          </>
        ) : (
          // Message when no favorites for the selected date
          <div className="text-center py-8 border rounded-lg dark:border-gray-800 mt-4">
            <p className="text-gray-500 dark:text-gray-400">此日期沒有收藏的表演。</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">點擊表演上的愛心圖標來添加收藏。</p>
          </div>
        )}
      </div>
      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          {/* Use local state in Dialog Title */}
          <DialogTitle>我的行程 ({favoritesSelectedDate})</DialogTitle>
          <DialogDescription>
            預覽您個人化的音樂節行程。點擊下載按鈕儲存圖片。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[70vh] overflow-y-auto">
          {imageUrl ? (
            <img src={imageUrl} alt="Generated Schedule" className="w-full h-auto" />
          ) : (
            <div className="flex justify-center items-center h-40">
              <p>圖片載入中...</p> {/* Or a spinner */}
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>關閉</Button>
          <Button onClick={handleDownload} disabled={!imageUrl}>
            <Download className="h-4 w-4 mr-2" />
            下載圖片
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
