import type { Performance, Stage } from "@/types/festival"

interface ImageGeneratorProps {
  performances: Performance[]
  stages: Stage[]
  theme: string
  isMobile: boolean
  selectedDate: string
}

/**
 * Generates a PNG image of the festival schedule
 */
export async function generateScheduleImage({
  performances,
  stages,
  theme,
  isMobile,
  selectedDate
}: ImageGeneratorProps): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  try {
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

    // Pre-calculate dimensions
    const width = 500
    const maxWidth = width - 150 // Consistent padding
    let totalHeight = 150 // Header space

    ctx.font = "bold 24px Arial"
    const cardInfos = performances.map(performance => 
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
    performances.forEach((performance, index) => {
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

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Error generating image:", error)
    return null
  }
}
