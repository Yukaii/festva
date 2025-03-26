"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { Stage } from "@/types/festival"

interface StageContextType {
  stages: Stage[]
  visibleStages: string[]
  toggleStageVisibility: (stageId: string) => void
  resetStageVisibility: () => void
}

const StageContext = createContext<StageContextType | undefined>(undefined)

export function StageProvider({ children }: { children: React.ReactNode }) {
  const stages: Stage[] = [
    { id: "南霸天", name: "南霸天", color: "bg-lime-400" },
    { id: "海龍王", name: "海龍王", color: "bg-purple-300" },
    { id: "女神龍", name: "女神龍", color: "bg-pink-500" },
    { id: "海波浪", name: "海波浪", color: "bg-sky-400" },
    { id: "卡魔麥", name: "卡魔麥", color: "bg-orange-300" },
    { id: "出頭天", name: "出頭天", color: "bg-yellow-400" },
    { id: "大雄丸", name: "大雄丸", color: "bg-red-500" },
    { id: "藍寶石", name: "藍寶石", color: "bg-blue-700" },
    { id: "青春夢", name: "青春夢", color: "bg-orange-200" },
    { id: "小港祭", name: "小港祭", color: "bg-amber-700" },
  ]

  const [visibleStages, setVisibleStages] = useState<string[]>(stages.map((stage) => stage.id))

  const toggleStageVisibility = (stageId: string) => {
    setVisibleStages((prev) => (prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]))
  }

  const resetStageVisibility = () => {
    setVisibleStages(stages.map((stage) => stage.id))
  }

  return (
    <StageContext.Provider
      value={{
        stages,
        visibleStages,
        toggleStageVisibility,
        resetStageVisibility,
      }}
    >
      {children}
    </StageContext.Provider>
  )
}

export function useStages() {
  const context = useContext(StageContext)
  if (!context) {
    throw new Error("useStages must be used within a StageProvider")
  }
  return context
}
