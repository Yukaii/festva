"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"
import type { Performance, Stage } from "@/types/festival"
import { cn } from "@/lib/utils"

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

  // Filter performances to only include favorites for the selected date
  const favoritePerformances = performances.filter(
    (p) => favorites.includes(p.id) && p.date === selectedDate
  )

  const generateImage = async () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      const width = 1200
      const height = 800
      canvas.width = width
      canvas.height = height

      // Fill background based on theme
      ctx.fillStyle = theme === "dark" ? "#1f2937" : "#ffffff"
      ctx.fillRect(0, 0, width, height)

      // Draw header
      ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
      ctx.font = "bold 32px Arial"
      ctx.fillText("我的音樂節行程表", 50, 60)
      
      // Draw date
      const dateObj = new Date(selectedDate)
      const formattedDate = dateObj.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
      ctx.font = "24px Arial"
      ctx.fillText(formattedDate, 50, 100)

      // Sort performances by start time
      const sortedPerformances = [...favoritePerformances].sort((a, b) => {
        return new Date(`${a.date}T${a.startTime}:00`).getTime() - new Date(`${b.date}T${b.startTime}:00`).getTime()
      })

      // Draw performances
      let yPos = 150
      for (const performance of sortedPerformances) {
        const stage = stages.find((s) => s.id === performance.stageId)
        if (!stage) return

        // Extract color from stage.color (format: "bg-color-intensity")
        const colorClass = stage.color
        const colorMatch = colorClass.match(/bg-([a-z]+)-(\d+)/)
        let fillColor = "#cccccc" // Default gray
        
        // Map Tailwind color classes to hex colors
        if (colorMatch) {
          const color = colorMatch[1]
          const intensity = Number.parseInt(colorMatch[2])
          
          // This is a simplified mapping - you might want to expand this
          const colorMap: Record<string, Record<number, string>> = {
            red: {
              500: "#ef4444",
              700: "#b91c1c"
            },
            blue: {
              700: "#1d4ed8"
            },
            green: {
              500: "#22c55e"
            },
            yellow: {
              400: "#facc15"
            },
            purple: {
              300: "#d8b4fe"
            },
            pink: {
              500: "#ec4899"
            },
            orange: {
              200: "#fed7aa",
              300: "#fdba74"
            },
            sky: {
              400: "#38bdf8"
            },
            lime: {
              400: "#a3e635"
            },
            amber: {
              700: "#b45309"
            }
          }
          
          fillColor = colorMap[color]?.[intensity] || fillColor
        }

        // Draw stage indicator
        ctx.fillStyle = fillColor
        ctx.fillRect(50, yPos, 15, 80)
        
        // Draw performance card
        ctx.fillStyle = theme === "dark" ? "#374151" : "#f3f4f6"
        ctx.fillRect(75, yPos, width - 125, 80)
        
        // Draw performance name
        ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000"
        ctx.font = "bold 24px Arial"
        ctx.fillText(performance.name, 90, yPos + 30)
        
        // Draw time and stage
        ctx.fillStyle = theme === "dark" ? "#d1d5db" : "#4b5563"
        ctx.font = "18px Arial"
        ctx.fillText(
          `${performance.startTime} - ${performance.endTime} | ${stage.name}`,
          90,
          yPos + 60
        )
        
        yPos += 100
      }

      // Draw watermark
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      ctx.font = "16px Arial"
      ctx.fillText("Festival Timetable App", width - 200, height - 20)

      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL("image/png")
      setExportedImageUrl(imageUrl)
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    if (!exportedImageUrl) return
    
    const link = document.createElement("a")
    link.href = exportedImageUrl
    link.download = `festival-schedule-${selectedDate}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <Button variant="default" size="sm" onClick={downloadImage}>
              <Download className="h-4 w-4 mr-2" />
              下載
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
          <div className="mt-4 border rounded-lg overflow-hidden">
            <img 
              src={exportedImageUrl} 
              alt="匯出的行程表" 
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  )
}
