"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"
import type { Performance, Stage } from "@/types/festival"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateScheduleImage } from "@/lib/export-image"

interface ExportScheduleProps {
  performances: Performance[]
  favorites: string[]
  stages: Stage[]
  selectedDate: string
  theme: string
  onShare?: () => void
}

export function ExportSchedule({
  performances,
  favorites,
  stages,
  selectedDate,
  theme,
  onShare,
}: ExportScheduleProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null)

  const isMobile = useMobile()

  // Get all favorites for mobile view, or just selected date for desktop
  const favoritePerformances = useMemo(() => {
    const allFavorites = performances.filter(p => favorites.includes(p.id))
    if (isMobile) {
      return allFavorites.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return new Date(`${a.date}T${a.startTime}:00`).getTime() - new Date(`${b.date}T${b.startTime}:00`).getTime()
      })
    }
    return allFavorites.filter(p => p.date === selectedDate)
  }, [performances, favorites, selectedDate, isMobile])

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    try {
      const imageUrl = await generateScheduleImage({
        performances: favoritePerformances,
        stages,
        theme,
        isMobile,
        selectedDate
      })
      if (imageUrl) {
        setExportedImageUrl(imageUrl)
      }
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (!exportedImageUrl) return

    try {
      // Convert base64 to blob
      const response = await fetch(exportedImageUrl)
      const blob = await response.blob()
      
      if (navigator.share) {
        await navigator.share({
          title: '我的大港聽團行程',
          files: [new File([blob], 'festival-schedule.png', { type: 'image/png' })]
        })
      } else {
        // Fallback to download if Web Share API is not available
        const link = document.createElement("a")
        link.href = exportedImageUrl
        link.download = `festival-schedule-${selectedDate}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      if (onShare) {
        onShare()
      }
    } catch (error) {
      console.error("Error sharing image:", error)
    }
  }

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">匯出我的行程表</h3>
        <div className="flex space-x-2">
          <Button
            id="export-schedule-button"
            variant="outline"
            size="sm"
            onClick={handleGenerateImage}
            disabled={isGenerating || favoritePerformances.length === 0}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isGenerating ? "生成中..." : "生成圖片"}
          </Button>
          
          {exportedImageUrl && (
            <Button variant="default" size="sm" onClick={handleShare}>
              <Download className="h-4 w-4 mr-2" />
              分享
            </Button>
          )}
        </div>
      </div>

      {favoritePerformances.length === 0 && (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-500">沒有收藏的表演可以匯出。</p>
          <p className="text-sm text-gray-400 mt-2">請先收藏表演以便匯出。</p>
        </div>
      )}

      {exportedImageUrl && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="mt-4 border rounded-lg overflow-hidden cursor-pointer">
              <img 
                src={exportedImageUrl} 
                alt="匯出的行程表" 
                className="w-full h-auto"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <img 
              src={exportedImageUrl} 
              alt="匯出的行程表" 
              className="w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )

  // Different UI for production/mobile vs development
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return content
  }

  // Production or mobile - just show button
  return favoritePerformances.length > 0 ? (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await handleGenerateImage()
        if (exportedImageUrl) {
          await handleShare()
        }
      }}
      disabled={isGenerating}
      className="w-full"
    >
      <Share2 className="h-4 w-4 mr-2" />
      {isGenerating ? "生成中..." : "分享我的行程"}
    </Button>
  ) : null
}
