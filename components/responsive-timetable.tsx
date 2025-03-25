"use client"

import { useState } from "react"
import { FestivalTimetable } from "./festival-timetable"
import { MobileView } from "./mobile-view"
import type { Performance } from "@/types/festival"
import { useMobile } from "@/hooks/use-mobile"

// Sample festival data
const festivalData: Performance[] = [
  { id: "p1", name: "嘻哈派對", artist: "嘻哈派對", stageId: "stage1", startTime: "11:00", endTime: "12:00" },
  { id: "p2", name: "南西音樂", artist: "南西音樂", stageId: "stage3", startTime: "11:00", endTime: "12:00" },
  { id: "p3", name: "真愛第一站", artist: "真愛第一站", stageId: "stage2", startTime: "13:30", endTime: "14:30" },
  { id: "p4", name: "Mario Zwinkle", artist: "Mario Zwinkle", stageId: "stage4", startTime: "13:30", endTime: "14:30" },
  {
    id: "p5",
    name: "DJ Yellow Yellow",
    artist: "DJ Yellow Yellow",
    stageId: "stage5",
    startTime: "13:30",
    endTime: "14:30",
  },
  { id: "p6", name: "公路青少年", artist: "公路青少年", stageId: "stage9", startTime: "13:30", endTime: "14:30" },
  { id: "p7", name: "Megaport", artist: "Megaport", stageId: "stage1", startTime: "17:30", endTime: "18:30" },
  { id: "p8", name: "VH", artist: "VH", stageId: "stage2", startTime: "19:00", endTime: "20:00" },
  { id: "p9", name: "Anus", artist: "Anus", stageId: "stage4", startTime: "19:00", endTime: "20:00" },
  { id: "p10", name: "一起走", artist: "一起走", stageId: "stage5", startTime: "19:00", endTime: "20:00" },
  { id: "p11", name: "孫子王", artist: "孫子王", stageId: "stage9", startTime: "19:00", endTime: "20:00" },
  { id: "p12", name: "BATTLES", artist: "BATTLES", stageId: "stage1", startTime: "20:30", endTime: "21:30" },
  { id: "p13", name: "EmptyOtto", artist: "EmptyOtto", stageId: "stage2", startTime: "20:30", endTime: "21:30" },
  { id: "p14", name: "三寶表演", artist: "三寶表演", stageId: "stage3", startTime: "20:30", endTime: "21:30" },
  { id: "p15", name: "KoTK", artist: "KoTK", stageId: "stage5", startTime: "20:30", endTime: "21:30" },
  { id: "p16", name: "SHOOTUP", artist: "SHOOTUP", stageId: "stage9", startTime: "20:30", endTime: "21:30" },
  { id: "p17", name: "Creepy Nuts", artist: "Creepy Nuts", stageId: "stage1", startTime: "22:00", endTime: "23:00" },
  { id: "p18", name: "I Mean Us", artist: "I Mean Us", stageId: "stage3", startTime: "22:00", endTime: "23:00" },
  { id: "p19", name: "Goose", artist: "Goose", stageId: "stage5", startTime: "22:00", endTime: "23:00" },
]

export function ResponsiveTimetable() {
  const [favorites, setFavorites] = useState<string[]>([])
  const isMobile = useMobile()

  const toggleFavorite = (performanceId: string) => {
    setFavorites((prev) =>
      prev.includes(performanceId) ? prev.filter((id) => id !== performanceId) : [...prev, performanceId],
    )
  }

  return (
    <div>
      {isMobile ? (
        <MobileView performances={festivalData} favorites={favorites} toggleFavorite={toggleFavorite} />
      ) : (
        <FestivalTimetable />
      )}
    </div>
  )
}

