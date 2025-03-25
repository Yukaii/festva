"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Performance } from "@/types/festival"
import { AlertCircle, Check } from "lucide-react"

interface DataImportProps {
  onImport: (performances: Performance[]) => void
}

export function DataImport({ onImport }: DataImportProps) {
  const [jsonData, setJsonData] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleImport = () => {
    try {
      setError(null)
      setSuccess(false)

      if (!jsonData.trim()) {
        setError("Please enter JSON data")
        return
      }

      const data = JSON.parse(jsonData)

      if (!Array.isArray(data)) {
        setError("Data must be an array of performances")
        return
      }

      // Validate each performance
      const performances = data.map((item, index) => {
        if (!item.id) {
          throw new Error(`Item at index ${index} is missing an id`)
        }
        if (!item.name) {
          throw new Error(`Item at index ${index} is missing a name`)
        }
        if (!item.stageId) {
          throw new Error(`Item at index ${index} is missing a stageId`)
        }
        if (!item.startTime) {
          throw new Error(`Item at index ${index} is missing a startTime`)
        }
        if (!item.endTime) {
          throw new Error(`Item at index ${index} is missing an endTime`)
        }

        return item as Performance
      })

      onImport(performances)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON data")
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Import Festival Data</h3>
      <Textarea
        placeholder="Paste your JSON data here..."
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        className="min-h-[200px] font-mono text-sm"
      />

      {error && (
        <div className="flex items-center text-red-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center text-green-500 text-sm">
          <Check className="h-4 w-4 mr-1" />
          Data imported successfully!
        </div>
      )}

      <Button onClick={handleImport}>Import Data</Button>
    </div>
  )
}

