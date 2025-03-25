"use client"

import { useEventTypes, getEventTypeIcon } from "./event-type-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EventTypeFilter() {
  const { eventTypes, visibleEventTypes, toggleEventTypeVisibility, resetEventTypeVisibility } = useEventTypes()

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Event Types</h3>
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((eventType) => (
          <button
            key={eventType.id}
            onClick={() => toggleEventTypeVisibility(eventType.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center",
              visibleEventTypes.includes(eventType.id)
                ? cn("bg-white", "border-gray-300")
                : "bg-gray-100 text-gray-500 border-gray-200",
            )}
          >
            {eventType.icon && <span className="mr-1">{getEventTypeIcon(eventType.icon)}</span>}
            {eventType.name}
          </button>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={resetEventTypeVisibility} className="text-xs">
        Show All Event Types
      </Button>
    </div>
  )
}

