"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Info, MapPin, Music, Utensils, Bath, Beer, Cigarette } from "lucide-react"

interface FeatureFormProps {
  open: boolean
  onClose: () => void
  onSave: (feature: any) => void
  initialData?: {
    id: string
    name: string
    description: string
    x: number
    y: number
    width?: number
    height?: number
  }
  isEdit?: boolean
}

export function FeatureForm({ open, onClose, onSave, initialData, isEdit = false }: FeatureFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || `feature-${Date.now()}`,
    name: initialData?.name || "",
    description: initialData?.description || "",
    iconType: "info",
    x: initialData?.x || 0,
    y: initialData?.y || 0,
    width: initialData?.width,
    height: initialData?.height,
    color: initialData?.width ? "rgba(100, 100, 100, 0.3)" : undefined,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description,
        iconType: "info", // We could determine this from the icon if needed
        x: initialData.x,
        y: initialData.y,
        width: initialData.width,
        height: initialData.height,
        color: initialData.width ? "rgba(100, 100, 100, 0.3)" : undefined,
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "x" || name === "y" || name === "width" || name === "height" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Generate icon based on type
    let icon
    switch (formData.iconType) {
      case "info":
        icon = <Info className="h-5 w-5" />
        break
      case "food":
        icon = <Utensils className="h-5 w-5" />
        break
      case "music":
        icon = <Music className="h-5 w-5" />
        break
      case "restroom":
        icon = <Bath className="h-5 w-5" />
        break
      case "drink":
        icon = <Beer className="h-5 w-5" />
        break
      case "smoking":
        icon = <Cigarette className="h-5 w-5" />
        break
      default:
        icon = <MapPin className="h-5 w-5" />
    }

    onSave({
      ...formData,
      icon,
    })

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Feature" : "Add New Feature"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="id">Feature ID</Label>
            <Input id="id" name="id" value={formData.id} readOnly className="bg-gray-100" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Feature name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Feature description"
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="iconType">Icon Type</Label>
              <Select value={formData.iconType} onValueChange={(value) => handleSelectChange("iconType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="restroom">Restroom</SelectItem>
                  <SelectItem value="drink">Drinks</SelectItem>
                  <SelectItem value="smoking">Smoking</SelectItem>
                  <SelectItem value="pin">Map Pin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x">X Position</Label>
              <Input id="x" name="x" type="number" value={formData.x} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="y">Y Position</Label>
              <Input id="y" name="y" type="number" value={formData.y} onChange={handleChange} required />
            </div>
          </div>

          {formData.width !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" name="width" type="number" value={formData.width} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Add"} Feature</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

