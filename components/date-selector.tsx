"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import type { FestivalDay } from "@/types/festival"

interface DateSelectorProps {
  days: FestivalDay[]
  selectedDate: string
  onChange: (date: string) => void
}

export function DateSelector({ days, selectedDate, onChange }: DateSelectorProps) {
  return (
    <div className="flex items-center">
      <Select value={selectedDate} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] md:w-[220px]">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select date" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {days.map((day) => (
            <SelectItem key={day.id} value={day.date}>
              {day.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

