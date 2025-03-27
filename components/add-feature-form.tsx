"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AddFeatureFormProps {
  onAdd: (feature: any) => void
}

export function AddFeatureForm({ onAdd }: AddFeatureFormProps) {
  const [featureData, setFeatureData] = useState({
    id: "",
    name: "",
    description: "",
    iconType: "info",
    x: 500,
    y: 500,
    width: 30,
    height: 30,
    isArea: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFeatureData((prev) => ({
      ...prev,
      [name]:
        name === "x" || name === "y" || name === "width" || name === "height" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFeatureData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFeatureData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Generate icon based on type
    let icon
    switch (featureData.iconType) {
      case "info":
        icon = "Info"
        break
      case "food":
        icon = "Utensils"
        break
      case "music":
        icon = "Music"
        break
      case "restroom":
        icon = "Bath"
        break
      default:
        icon = "MapPin"
    }

    // If it's an area, set width and height
    const feature = {
      ...featureData,
      icon,
      color: featureData.isArea ? "rgba(100, 100, 100, 0.3)" : undefined,
      width: featureData.isArea ? featureData.width : undefined,
      height: featureData.isArea ? featureData.height : undefined,
    }

    onAdd(feature)

    // Reset form
    setFeatureData({
      id: "",
      name: "",
      description: "",
      iconType: "info",
      x: 500,
      y: 500,
      width: 30,
      height: 30,
      isArea: false,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Add New Feature</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">Feature ID</Label>
            <Input
              id="id"
              name="id"
              value={featureData.id}
              onChange={handleChange}
              placeholder="e.g., main-stage"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              name="name"
              value={featureData.name}
              onChange={handleChange}
              placeholder="e.g., Main Stage"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={featureData.description}
              onChange={handleChange}
              placeholder="Describe this feature"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconType">Icon Type</Label>
            <Select value={featureData.iconType} onValueChange={(value) => handleSelectChange("iconType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select icon type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="restroom">Restroom</SelectItem>
                <SelectItem value="pin">Map Pin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isArea"
              name="isArea"
              type="checkbox"
              checked={featureData.isArea}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <Label htmlFor="isArea">This is an area (not a point)</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x">X Position</Label>
              <Input id="x" name="x" type="number" value={featureData.x} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y">Y Position</Label>
              <Input id="y" name="y" type="number" value={featureData.y} onChange={handleChange} />
            </div>
          </div>

          {featureData.isArea && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" name="width" type="number" value={featureData.width} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" name="height" type="number" value={featureData.height} onChange={handleChange} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Add Feature
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

