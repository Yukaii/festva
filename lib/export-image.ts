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
  // Create temporary canvas for text measurements
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')
  if (!measureCtx) return null

  const scaleFactor = 2 // Increase resolution

  try {
    // Helper function to get card dimensions and wrapped text
    const getCardInfo = (text: string, maxWidth: number) => {
      // Split text into array of characters for CJK support
      const chars = Array.from(text);
      let line = "";
      const lines: string[] = [];

      measureCtx.font = "bold 24px Arial"
      for (let n = 0; n < chars.length; n++) {
        const testLine = line + chars[n];
        const testWidth = measureCtx.measureText(testLine).width;

        if (testWidth > maxWidth && line) {
          lines.push(line);
          line = chars[n];
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }
      
      const cardHeight = lines.length > 1 ? 120 : 100
      return { lines, cardHeight }
    }

    // Pre-calculate base dimensions
    const baseWidth = 500
    const maxWidth = baseWidth - 150 // Consistent padding for text wrapping
    let totalHeight = 150 // Header space

    // Sort performances by date and start time
    const sortedPerformances = [...performances].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Get card dimensions using unscaled measurements
    const cardInfos = sortedPerformances.map(performance => 
      getCardInfo(performance.name, maxWidth)
    );

    // Calculate total height including spacing and markers
    let previousDate = "";
    const dayMarkerHeight = 25;
    const markerDividerPadding = 15;
    const dividerBottomPadding = 20;
    const dayHeaderTotalPadding = dayMarkerHeight + markerDividerPadding + dividerBottomPadding;

    totalHeight += cardInfos.reduce((sum, info, index) => {
      let spacing = info.cardHeight + 20;
      const currentDate = sortedPerformances[index].date;
      if (index === 0 || currentDate !== previousDate) {
        spacing += dayHeaderTotalPadding;
      }
      previousDate = currentDate;
      return sum + spacing;
    }, 0);

    // Set up the canvas with proper dimensions
    const baseHeight = Math.max(300, totalHeight + 30)
    canvas.width = baseWidth * scaleFactor
    canvas.height = baseHeight * scaleFactor

    // Get drawing context and apply scaling
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    // Enable high quality image scaling
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    
    // Apply scaling to the drawing context
    ctx.scale(scaleFactor, scaleFactor)
    
    // Fill background based on theme
    ctx.fillStyle = theme === "dark" ? "#1f2937" : "#ffffff"
    ctx.fillRect(0, 0, baseWidth, baseHeight)

    // Draw header (using base dimensions)
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
    let yPos = 150;
    let currentDrawingDate = "";
    let dayCounter = 0;
    const dayMarkerFont = "bold 20px Arial";
    // Using constants defined in height calculation
    // const dayMarkerHeight = 25; 
    // const markerDividerPadding = 15;
    // const dividerBottomPadding = 20;

    sortedPerformances.forEach((performance, index) => {
      const stage = stages.find((s) => s.id === performance.stageId);
      if (!stage) return;

      // Check if date changed - Draw Day Header (Marker + Divider)
      if (index === 0 || performance.date !== currentDrawingDate) {
        dayCounter++;
        currentDrawingDate = performance.date;
        
        // Draw Day marker text
        ctx.font = dayMarkerFont;
        ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000";
        ctx.textAlign = "center";
        // Draw text slightly higher to account for baseline (using base dimensions)
        ctx.fillText(`Day ${dayCounter}`, baseWidth / 2, yPos + dayMarkerHeight - 5); 
        ctx.textAlign = "left"; // Reset alignment
        yPos += dayMarkerHeight + markerDividerPadding; // Move yPos down past text and padding

        // Draw divider line below marker (using base dimensions)
        ctx.fillStyle = theme === "dark" ? "#4b5563" : "#d1d5db"; // Divider color
        ctx.fillRect(50, yPos, baseWidth - 100, 2); // Draw line
        yPos += dividerBottomPadding; // Add space after divider
      }

      // Get pre-calculated card info
      const { lines, cardHeight } = cardInfos[index];

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
      
      // Draw performance card background (using base dimensions)
      ctx.fillStyle = theme === "dark" ? "#374151" : "#f3f4f6"
      ctx.fillRect(75, yPos, baseWidth - 125, cardHeight)
      
      // Draw performance name with wrapping (using base dimensions)
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

    // Draw watermark (using base dimensions)
    ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
    ctx.font = "16px Arial"
    ctx.fillText("Festva 用心製作", baseWidth - 170, baseHeight - 20)

    // Export the scaled image
    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Error generating image:", error)
    return null
  }
}
