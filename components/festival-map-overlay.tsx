"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Info, Utensils, Music, Cigarette, Bath, X, Move, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

// Add imports for the new components
import { ContextMenu } from "@/components/context-menu"
import { FeatureCreationGuide } from "@/components/feature-creation-guide"
import { FeatureForm } from "@/components/feature-form"
import { BottomSheet } from "@/components/bottom-sheet"
import { useMobile } from "@/hooks/use-mobile"
import { JSX } from "react/jsx-runtime"

// Define the types for our map features
interface MapFeature {
  id: string
  name: string
  description: string
  icon: JSX.Element
  x: number
  y: number
  width?: number
  height?: number
  color?: string
}

// Define resize handle positions
type ResizeHandle = "top" | "right" | "bottom" | "left" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | null

export default function FestivalMapOverlay() {
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [draggingFeature, setDraggingFeature] = useState<string | null>(null)
  const [resizingFeature, setResizingFeature] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
  const [features, setFeatures] = useState<MapFeature[]>([])
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  const [fixedScale, setFixedScale] = useState(true) // New state for fixed scaling
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [newFeatureStartPos, setNewFeatureStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isCreatingFeature, setIsCreatingFeature] = useState(false)
  const [newFeatureSize, setNewFeatureSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [showFeatureForm, setShowFeatureForm] = useState(false)
  const [editingFeature, setEditingFeature] = useState<MapFeature | null>(null)
  const isMobile = useMobile()

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const originalImageWidth = 1000 // Original image width
  const originalImageHeight = 1500 // Original image height
  const minFeatureSize = 20 // Minimum size for resizable features

  // Initial features data
  useEffect(() => {
    setFeatures([
      {
        id: "food-market",
        name: "美食市集",
        description: "Food market with various local and international cuisine options",
        icon: <Utensils className="h-5 w-5" />,
        x: 181,
        y: 264,
        width: 90,
        height: 181,
        color: "rgba(144, 190, 109, 0.3)",
      },
      {
        id: "south-stage",
        name: "南霸天",
        description: "South stage featuring alternative and indie performances",
        icon: <Music className="h-5 w-5" />,
        x: 20,
        y: 451,
        width: 114,
        height: 559,
        color: "rgba(67, 170, 139, 0.3)",
      },
      {
        id: "goddess-stage",
        name: "女神龍",
        description: "Goddess Dragon stage for electronic and dance music",
        icon: <Music className="h-5 w-5" />,
        x: 468,
        y: 1125,
        width: 119,
        height: 147,
        color: "rgba(249, 65, 68, 0.3)",
      },
      {
        id: "restrooms-1",
        name: "廁所",
        description: "Restroom facilities",
        icon: <Bath className="h-5 w-5" />,
        x: 212,
        y: 482,
        width: 30,
        height: 30,
      },
      {
        id: "restrooms-2",
        name: "廁所",
        description: "Restroom facilities",
        icon: <Bath className="h-5 w-5" />,
        x: 404,
        y: 111,
        width: 51,
        height: 61,
      },
      {
        id: "food-area",
        name: "飲食區",
        description: "Designated eating areas with seating",
        icon: <Utensils className="h-5 w-5" />,
        x: 408,
        y: 302,
        width: 47,
        height: 148,
      },
      {
        id: "smoking",
        name: "吸菸區",
        description: "Designated smoking areas",
        icon: <Cigarette className="h-5 w-5" />,
        x: 35,
        y: 208,
        width: 44,
        height: 54,
      },
      {
        id: "info",
        name: "服務台",
        description: "Information booths for festival inquiries",
        icon: <Info className="h-5 w-5" />,
        x: 411,
        y: 185,
        width: 39,
        height: 34,
      },
      {
        id: "area-1743037007471",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 422,
        y: 828,
        width: 47,
        height: 53,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037046891",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 735,
        y: 1159,
        width: 105,
        height: 111,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037065404",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 740,
        y: 855,
        width: 66,
        height: 77,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037087455",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 529,
        y: 757,
        width: 57,
        height: 50,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037098604",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 588,
        y: 755,
        width: 104,
        height: 44,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037118723",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 550,
        y: 570,
        width: 84,
        height: 42,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037179506",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 212,
        y: 191,
        width: 70,
        height: 63,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037195555",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 79,
        y: 275,
        width: 39,
        height: 159,
        color: "rgba(100, 100, 100, 0.3)",
      },
      {
        id: "area-1743037218856",
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x: 409,
        y: 461,
        width: 48,
        height: 56,
        color: "rgba(100, 100, 100, 0.3)",
      },
    ])
  }, [])

  // Center map on selected feature
  const centerMapOnFeature = (feature: MapFeature) => {
    if (!mapContainerRef.current || !feature) return

    const containerRect = mapContainerRef.current.getBoundingClientRect()
    const featureX = feature.x * scale
    const featureY = feature.y * scale
    const featureWidth = (feature.width || 30) * scale
    const featureHeight = (feature.height || 30) * scale

    // Calculate center position
    const centerX = featureX - containerRect.width / 2 + featureWidth / 2
    const centerY = featureY - containerRect.height / 2 + featureHeight / 2

    // Scroll to the position
    mapContainerRef.current.scrollTo({
      left: Math.max(0, centerX),
      top: Math.max(0, centerY),
      behavior: "smooth",
    })

    // Set as selected feature for tooltip
    setSelectedFeature(feature)

    // Update tooltip position to be at the feature's center
    setTooltipPosition({
      x: featureX + featureWidth / 2,
      y: featureY - 10, // Position slightly above the feature
    })
  }

  // Handle feature selection from bottom sheet
  const handleSelectFeatureFromSheet = (feature: MapFeature) => {
    centerMapOnFeature(feature)
  }

  // Update map dimensions when the window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current) {
        const { width, height } = imageRef.current.getBoundingClientRect()
        setMapDimensions({ width, height })

        // Calculate scale based on original image dimensions
        if (fixedScale) {
          // Use a fixed scale based on a reference width (e.g., 1000px)
          const referenceWidth = 1000
          const newScale = referenceWidth / originalImageWidth
          setScale(newScale)

          // Apply the scale to the container
          if (mapContainerRef.current) {
            mapContainerRef.current.style.width = `${originalImageWidth * newScale}px`
            mapContainerRef.current.style.height = `${originalImageHeight * newScale}px`
            mapContainerRef.current.style.overflow = "auto"
          }
        } else {
          // Use responsive scaling based on container width
          const newScale = width / originalImageWidth
          setScale(newScale)
        }
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [fixedScale, originalImageWidth, originalImageHeight])

  // Handle feature click
  const handleFeatureClick = (feature: MapFeature, e: React.MouseEvent) => {
    if (debugMode) return

    setSelectedFeature(feature)

    // Calculate tooltip position
    const rect = mapContainerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setTooltipPosition({ x, y })
    }
  }

  // Handle mouse down for dragging in debug mode
  const handleMouseDown = (featureId: string, e: React.MouseEvent) => {
    if (!debugMode) return

    e.preventDefault()
    e.stopPropagation()
    setDraggingFeature(featureId)
  }

  // Handle mouse down on resize handle
  const handleResizeStart = (featureId: string, handle: ResizeHandle, e: React.MouseEvent) => {
    if (!debugMode) return

    e.preventDefault()
    e.stopPropagation()
    setResizingFeature(featureId)
    setResizeHandle(handle)
  }

  // Handle right click for context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()

    const rect = mapContainerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setContextMenu({
        x,
        y,
        visible: true,
      })
    }
  }

  // Handle creating a new feature
  const handleCreateFeature = (type: "point" | "area") => {
    setContextMenu({ x: 0, y: 0, visible: false })

    if (type === "area") {
      setIsCreatingFeature(true)

      const rect = mapContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = contextMenu.x
        const y = contextMenu.y

        setNewFeatureStartPos({
          x: Math.round(x / scale),
          y: Math.round(y / scale),
        })
      }
    } else {
      // For point features, show the form
      setEditingFeature({
        id: `point-${Date.now()}`,
        name: "New Point",
        description: "New point feature",
        icon: <Info className="h-5 w-5" />,
        x: Math.round(contextMenu.x / scale),
        y: Math.round(contextMenu.y / scale),
      })
      setShowFeatureForm(true)
    }
  }

  // Handle saving a new feature
  const handleSaveFeature = (feature: MapFeature) => {
    // Check if we're editing an existing feature
    if (editingFeature && features.some((f) => f.id === editingFeature.id)) {
      setFeatures((prev) => prev.map((f) => (f.id === editingFeature.id ? feature : f)))
    } else {
      // Add new feature
      setFeatures((prev) => [...prev, feature])
    }

    setShowFeatureForm(false)
    setEditingFeature(null)
  }

  // Handle editing a feature
  const handleEditFeature = (featureId: string) => {
    const feature = features.find((f) => f.id === featureId)
    if (feature) {
      // Create a proper initialData object with all necessary properties
      setEditingFeature({
        ...feature,
        // Ensure we're passing a copy to avoid reference issues
        x: feature.x,
        y: feature.y,
        width: feature.width,
        height: feature.height,
      })
      setShowFeatureForm(true)
    }
  }

  // Handle mouse move while creating a feature
  const handleMouseMoveCreating = (e: React.MouseEvent) => {
    if (!isCreatingFeature || !newFeatureStartPos) return

    const rect = mapContainerRef.current?.getBoundingClientRect()
    if (rect) {
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top

      const width = Math.abs(currentX - newFeatureStartPos.x * scale)
      const height = Math.abs(currentY - newFeatureStartPos.y * scale)

      setNewFeatureSize({ width, height })
    }
  }

  // Handle mouse up to finish creating a feature
  const handleMouseUpCreating = () => {
    if (!isCreatingFeature || !newFeatureStartPos) return

    // Only create if the size is meaningful
    if (newFeatureSize.width > 10 && newFeatureSize.height > 10) {
      // Calculate the actual position and size in unscaled coordinates
      const x = newFeatureStartPos.x
      const y = newFeatureStartPos.y
      const width = Math.round(newFeatureSize.width / scale)
      const height = Math.round(newFeatureSize.height / scale)

      setEditingFeature({
        id: `area-${Date.now()}`,
        name: "New Area",
        description: "New area feature",
        icon: <MapPin className="h-5 w-5" />,
        x,
        y,
        width,
        height,
        color: "rgba(100, 100, 100, 0.3)",
      })
      setShowFeatureForm(true)
    }

    // Reset creation state
    setIsCreatingFeature(false)
    setNewFeatureStartPos(null)
    setNewFeatureSize({ width: 0, height: 0 })
  }

  // Handle deleting a feature
  const handleDeleteFeature = (featureId: string) => {
    setContextMenu({ x: 0, y: 0, visible: false })
    setFeatures((prev) => prev.filter((feature) => feature.id !== featureId))
  }

  // Close context menu when clicking elsewhere
  const handleCloseContextMenu = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false })
    }
  }

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e: React.MouseEvent) => {
    // Handle dragging
    if (debugMode && draggingFeature) {
      const rect = mapContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setFeatures((prev) =>
          prev.map((feature) =>
            feature.id === draggingFeature
              ? { ...feature, x: Math.round(x / scale), y: Math.round(y / scale) }
              : feature,
          ),
        )
      }
    }

    // Handle resizing
    if (debugMode && resizingFeature && resizeHandle) {
      const rect = mapContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        setFeatures((prev) =>
          prev.map((feature) => {
            if (feature.id !== resizingFeature || !feature.width || !feature.height) {
              return feature
            }

            const featureX = feature.x * scale
            const featureY = feature.y * scale
            const featureWidth = feature.width * scale
            const featureHeight = feature.height * scale

            let newX = feature.x
            let newY = feature.y
            let newWidth = feature.width
            let newHeight = feature.height

            // Handle different resize handles
            switch (resizeHandle) {
              case "top":
                {
                  const dy = mouseY - featureY
                  newY = Math.round((featureY + dy) / scale)
                  newHeight = Math.max(minFeatureSize, Math.round((featureHeight - dy) / scale))
                }
                break
              case "right":
                {
                  const dx = mouseX - (featureX + featureWidth)
                  newWidth = Math.max(minFeatureSize, Math.round((featureWidth + dx) / scale))
                }
                break
              case "bottom":
                {
                  const dy = mouseY - (featureY + featureHeight)
                  newHeight = Math.max(minFeatureSize, Math.round((featureHeight + dy) / scale))
                }
                break
              case "left":
                {
                  const dx = mouseX - featureX
                  newX = Math.round((featureX + dx) / scale)
                  newWidth = Math.max(minFeatureSize, Math.round((featureWidth - dx) / scale))
                }
                break
              case "topLeft":
                {
                  const dx = mouseX - featureX
                  const dy = mouseY - featureY
                  newX = Math.round((featureX + dx) / scale)
                  newY = Math.round((featureY + dy) / scale)
                  newWidth = Math.max(minFeatureSize, Math.round((featureWidth - dx) / scale))
                  newHeight = Math.max(minFeatureSize, Math.round((featureHeight - dy) / scale))
                }
                break
              case "topRight":
                {
                  const dx = mouseX - (featureX + featureWidth)
                  const dy = mouseY - featureY
                  newY = Math.round((featureY + dy) / scale)
                  newWidth = Math.max(minFeatureSize, Math.round((featureWidth + dx) / scale))
                  newHeight = Math.max(minFeatureSize, Math.round((featureHeight - dy) / scale))
                }
                break
              case "bottomLeft":
                {
                  const dx = mouseX - featureX
                  const dy = mouseY - (featureY + featureHeight)
                  newX = Math.round((featureX + dx) / scale)
                  newWidth = Math.max(minFeatureSize, Math.round((featureWidth - dx) / scale))
                  newHeight = Math.max(minFeatureSize, Math.round((featureHeight + dy) / scale))
                }
                break
              case "bottomRight":
                {
                  const dx = mouseX - (featureX + featureWidth)
                  const dy = mouseY - (featureY + featureHeight)
                  newWidth = Math.max(minFeatureSize, Math.round((featureWidth + dx) / scale))
                  newHeight = Math.max(minFeatureSize, Math.round((featureHeight + dy) / scale))
                }
                break
            }

            return { ...feature, x: newX, y: newY, width: newWidth, height: newHeight }
          }),
        )
      }
    }

    // Handle feature creation
    if (isCreatingFeature) {
      handleMouseMoveCreating(e)
    }
  }

  // Handle mouse up to stop dragging and resizing
  const handleMouseUp = () => {
    if (draggingFeature) {
      setDraggingFeature(null)
    }

    if (resizingFeature) {
      setResizingFeature(null)
      setResizeHandle(null)
    }

    if (isCreatingFeature) {
      handleMouseUpCreating()
    }
  }

  // Export feature positions as JSON
  const exportPositions = () => {
    const positionsData = features.map(({ id, x, y, width, height, name, description }) => ({
      id,
      x,
      y,
      width,
      height,
      name,
      description,
    }))
    const jsonData = JSON.stringify(positionsData, null, 2)

    // Create a blob and download link
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "festival-map-positions.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Toggle fixed scale mode
  const toggleFixedScale = () => {
    setFixedScale(!fixedScale)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">MEGAPORT FEST. 2025</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} />
            <Label htmlFor="debug-mode">Debug Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="fixed-scale" checked={fixedScale} onCheckedChange={toggleFixedScale} />
            <Label htmlFor="fixed-scale">Fixed Scale</Label>
          </div>
          {debugMode && <Button onClick={exportPositions}>Export Positions</Button>}
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="relative overflow-auto rounded-lg shadow-lg"
        style={{ height: isMobile ? "calc(100vh - 180px)" : "auto" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onClick={handleCloseContextMenu}
      >
        <div className="relative">
          {/* Original map image */}
          <Image
            ref={imageRef}
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/25map_FIIIINAL-BSaUprHsOIgoBKmdVDzpeyCQbZlbl9.png"
            alt="MEGAPORT FEST. 2025 Map"
            width={originalImageWidth}
            height={originalImageHeight}
            className="w-full h-auto"
            priority
          />

          {/* Clickable overlays */}
          <div className="absolute top-0 left-0 w-full h-full">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`absolute ${debugMode ? "border-2 border-red-500 cursor-move" : "cursor-pointer hover:bg-opacity-50"}`}
                style={{
                  left: `${feature.x * scale}px`,
                  top: `${feature.y * scale}px`,
                  width: feature.width ? `${feature.width * scale}px` : "30px",
                  height: feature.height ? `${feature.height * scale}px` : "30px",
                  backgroundColor: debugMode ? "rgba(255, 0, 0, 0.2)" : feature.color || "transparent",
                  transform: feature.width ? "none" : "translate(-50%, -50%)",
                  borderRadius: feature.width ? "0" : "50%",
                  zIndex: draggingFeature === feature.id || resizingFeature === feature.id ? 100 : 10,
                }}
                onClick={(e) => handleFeatureClick(feature, e)}
                onMouseDown={(e) => handleMouseDown(feature.id, e)}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  handleEditFeature(feature.id)
                }}
              >
                {!feature.width && !debugMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-full">
                    {feature.icon}
                  </div>
                )}

                {debugMode && (
                  <div className="absolute -top-6 left-0 bg-black text-white text-xs px-1 whitespace-nowrap">
                    {feature.id}
                  </div>
                )}

                {debugMode && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <Move className="h-4 w-4 text-red-500" />
                  </div>
                )}

                {/* Resize handles for areas in debug mode */}
                {debugMode && feature.width && feature.height && (
                  <>
                    {/* Top handle */}
                    <div
                      className="absolute top-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "top", e)}
                    />

                    {/* Right handle */}
                    <div
                      className="absolute top-1/2 right-0 w-4 h-4 bg-blue-500 rounded-full transform translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "right", e)}
                    />

                    {/* Bottom handle */}
                    <div
                      className="absolute bottom-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 cursor-ns-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "bottom", e)}
                    />

                    {/* Left handle */}
                    <div
                      className="absolute top-1/2 left-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "left", e)}
                    />

                    {/* Corner handles */}
                    <div
                      className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "topLeft", e)}
                    />

                    <div
                      className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full transform translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "topRight", e)}
                    />

                    <div
                      className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "bottomLeft", e)}
                    />

                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full transform translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeStart(feature.id, "bottomRight", e)}
                    />

                    {/* Size indicator */}
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5">
                      {feature.width} x {feature.height}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Information tooltip */}
          {selectedFeature && !debugMode && (
            <div
              className="absolute bg-white p-4 rounded-lg shadow-lg z-20 max-w-xs"
              style={{
                left: `${Math.min(tooltipPosition.x, mapDimensions.width - 250)}px`,
                top: `${Math.min(tooltipPosition.y, mapDimensions.height - 150)}px`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {selectedFeature.icon}
                <h3 className="font-bold text-lg">{selectedFeature.name}</h3>
              </div>
              <p>{selectedFeature.description}</p>
              <button
                className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedFeature(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Context Menu */}
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            visible={contextMenu.visible}
            onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            onCreatePoint={() => handleCreateFeature("point")}
            onCreateArea={() => handleCreateFeature("area")}
            onDelete={handleDeleteFeature}
            featuresToDelete={features.filter((f) => {
              const featureX = f.x * scale
              const featureY = f.y * scale
              const featureWidth = (f.width || 30) * scale
              const featureHeight = (f.height || 30) * scale

              // Check if context menu is within feature bounds
              return (
                contextMenu.x >= featureX - (f.width ? 0 : 15) &&
                contextMenu.x <= featureX + (f.width ? featureWidth : 15) &&
                contextMenu.y >= featureY - (f.height ? 0 : 15) &&
                contextMenu.y <= featureY + (f.height ? featureHeight : 15)
              )
            })}
          />

          {/* Feature creation overlay */}
          {isCreatingFeature && newFeatureStartPos && (
            <FeatureCreationGuide
              startX={newFeatureStartPos.x * scale}
              startY={newFeatureStartPos.y * scale}
              width={newFeatureSize.width}
              height={newFeatureSize.height}
            />
          )}
        </div>
      </div>

      {/* Feature form dialog */}
      <FeatureForm
        open={showFeatureForm}
        onClose={() => {
          setShowFeatureForm(false)
          setEditingFeature(null)
        }}
        onSave={handleSaveFeature}
        initialData={editingFeature || undefined}
        isEdit={!!editingFeature}
      />

      {/* Mobile Bottom Sheet Navigation */}
      {isMobile && !debugMode && (
        <BottomSheet
          features={features}
          onSelectFeature={handleSelectFeatureFromSheet}
          selectedFeature={selectedFeature}
        />
      )}

      {/* Debug console */}
      {debugMode && (
        <Card className="mt-4 p-4 bg-gray-100">
          <h2 className="text-lg font-bold mb-2">Debug Console</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Feature Positions</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded">
                  {JSON.stringify(
                    features.map(({ id, x, y, width, height, name, description }) => ({
                      id,
                      x,
                      y,
                      width,
                      height,
                      name,
                      description,
                    })),
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="text-sm space-y-1">
                <li>• Drag the red boxes to position features</li>
                <li>• Use blue resize handles to adjust area sizes</li>
                <li>• Double-click any feature to edit its properties</li>
                <li>• Right-click to add new features or delete existing ones</li>
                <li>• Toggle "Fixed Scale" to maintain consistent positioning</li>
              </ul>
              <div className="mt-4">
                <h4 className="font-semibold">Map Scale: {scale.toFixed(3)}</h4>
                <p className="text-sm text-gray-600">Original dimensions scaled to fit container</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

