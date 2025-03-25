"use client"

import { useStages } from "./stage-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StageFilter() {
  const { stages, visibleStages, toggleStageVisibility, resetStageVisibility } = useStages()

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => toggleStageVisibility(stage.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md border transition-colors",
              visibleStages.includes(stage.id)
                ? cn(stage.color, "border-gray-300")
                : "bg-gray-100 text-gray-500 border-gray-200",
            )}
          >
            {stage.name}
          </button>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={resetStageVisibility} className="text-xs">
        Show All Stages
      </Button>
    </div>
  )
}

