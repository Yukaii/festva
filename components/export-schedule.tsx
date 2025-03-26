"use client"

import { useRef, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"
import type { Performance, Stage } from "@/types/festival"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ExportScheduleProps {
  performances: Performance[]
  favorites: string[]
  stages: Stage[]
  selectedDate: string
  theme: string
}

export function ExportSchedule({
  performances,
  favorites,
  stages,
  selectedDate,
  theme,
}: ExportScheduleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  const generateImage = async () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Helper function to get card dimensions and wrapped text
      const getCardInfo = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split("")
        let line = ""
        const lines: string[] = []
        
        for (const char of words) {
          const testLine = line + char
          const testWidth = ctx.measureText(testLine).width
          
          if (testWidth > maxWidth) {
            lines.push(line)
            line = char
          } else {
            line = testLine
          }
        }
        lines.push(line)
        
        const cardHeight = lines.length > 1 ? 120 : 100 // Increased height for wrapped text
        return { lines, cardHeight }
      }

      // Pre-calculate all card dimensions
      const width = 500
      const maxWidth = width - 150 // Consistent padding
      let totalHeight = 150 // Header space

      ctx.font = "bold 24px Arial"
      const cardInfos = favoritePerformances.map(performance => 
        getCardInfo(ctx, performance.name, maxWidth)
      )
      
      // Calculate total height including spacing
      totalHeight += cardInfos.reduce((sum, info) => sum + info.cardHeight + 20, 0)
      
      // Set canvas dimensions with extra padding
      const height = Math.max(300, totalHeight + 30)
      canvas.width = width
      canvas.height = height
      
      // Fill background based on theme
      ctx.fillStyle = theme === "dark" ? "#1f2937" : "#ffffff"
      ctx.fillRect(0, 0, width, height)

      // Draw header
      ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
      ctx.font = "bold 32px Arial"
      ctx.fillText("我的大港聽團行程", 50, 60)
      
      // Handle dates
      if (isMobile) {
        ctx.font = "24px Arial"
        ctx.fillText("3/29 (六) - 3/30 (日)", 50, 100)
      } else {
        const dateObj = new Date(selectedDate)
        const formattedDate = dateObj.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })
        ctx.font = "24px Arial"
        ctx.fillText(formattedDate, 50, 100)
      }

      // Draw performances
      let yPos = 150
      favoritePerformances.forEach((performance, index) => {
        const stage = stages.find((s) => s.id === performance.stageId)
        if (!stage) return

        // Get pre-calculated card info
        const { lines, cardHeight } = cardInfos[index]

        // Extract and map stage color
        const colorClass = stage.color
        const colorMatch = colorClass.match(/bg-([a-z]+)-(\d+)/)
        let fillColor = "#cccccc" // Default gray
        
        if (colorMatch) {
          const color = colorMatch[1]
          const intensity = Number.parseInt(colorMatch[2])
          const colorMap: Record<string, Record<number, string>> = {
            red: { 500: "#ef4444", 700: "#b91c1c" },
            blue: { 700: "#1d4ed8" },
            green: { 500: "#22c55e" },
            yellow: { 400: "#facc15" },
            purple: { 300: "#d8b4fe" },
            pink: { 500: "#ec4899" },
            orange: { 200: "#fed7aa", 300: "#fdba74" },
            sky: { 400: "#38bdf8" },
            lime: { 400: "#a3e635" },
            amber: { 700: "#b45309" }
          }
          fillColor = colorMap[color]?.[intensity] || fillColor
        }
        
        // Draw stage indicator with dynamic height
        ctx.fillStyle = fillColor
        ctx.fillRect(50, yPos, 15, cardHeight)
        
        // Draw performance card background
        ctx.fillStyle = theme === "dark" ? "#374151" : "#f3f4f6"
        ctx.fillRect(75, yPos, width - 125, cardHeight)
        
        // Draw performance name with wrapping
        ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
        ctx.font = "bold 24px Arial"
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, 90, yPos + 30 + (lineIndex * 25))
        })
        
        // Draw time and stage info
        ctx.fillStyle = theme === "dark" ? "#d1d5db" : "#4b5563"
        ctx.font = "18px Arial"
        const dateStr = isMobile ? `${performance.date.slice(5)} | ` : ""
        ctx.fillText(
          `${dateStr}${performance.startTime} - ${performance.endTime} | ${stage.name}`,
          90,
          yPos + cardHeight - 20
        )
        
        yPos += cardHeight + 20
      })

      // Draw watermark
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
      ctx.font = "16px Arial"
      ctx.fillText("Festva 用心製作", width - 170, height - 20)

      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL("image/png")
      setExportedImageUrl(imageUrl)
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareImage = async () => {
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
    } catch (error) {
      console.error("Error sharing image:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">匯出我的行程表</h3>
        <div className="flex space-x-2">
          <Button
            id="export-schedule-button"
            variant="outline"
            size="sm"
            onClick={generateImage}
            disabled={isGenerating || favoritePerformances.length === 0}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isGenerating ? "生成中..." : "生成圖片"}
          </Button>
          
          {exportedImageUrl && (
            <Button variant="default" size="sm" onClick={shareImage}>
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

      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
        
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
    </div>
  )
}
