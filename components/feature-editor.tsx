"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface FeatureEditorProps {
  featureId: string
  x: number
  y: number
  width?: number
  height?: number
  name: string
  description: string
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
}

export function FeatureEditor({
  featureId,
  x,
  y,
  width,
  height,
  name,
  description,
  onUpdate,
  onDelete,
}: FeatureEditorProps) {
  const [featureData, setFeatureData] = useState({
    x,
    y,
    width: width || 30,
    height: height || 30,
    name,
    description,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFeatureData((prev) => ({
      ...prev,
      [name]:
        name === "x" || name === "y" || name === "width" || name === "height" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(featureId, featureData)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          Edit Feature: {featureId}
          <Button variant="ghost" size="sm" onClick={() => onDelete(featureId)} className="h-8 w-8 p-0 text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${featureId}-x`}>X Position</Label>
              <Input id={`${featureId}-x`} name="x" type="number" value={featureData.x} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${featureId}-y`}>Y Position</Label>
              <Input id={`${featureId}-y`} name="y" type="number" value={featureData.y} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${featureId}-width`}>Width</Label>
              <Input
                id={`${featureId}-width`}
                name="width"
                type="number"
                value={featureData.width}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${featureId}-height`}>Height</Label>
              <Input
                id={`${featureId}-height`}
                name="height"
                type="number"
                value={featureData.height}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${featureId}-name`}>Name</Label>
            <Input id={`${featureId}-name`} name="name" value={featureData.name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${featureId}-description`}>Description</Label>
            <Input
              id={`${featureId}-description`}
              name="description"
              value={featureData.description}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full">
            Update Feature
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

