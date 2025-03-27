"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Info, X, Move, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Add imports for the new components
import { ContextMenu } from "@/components/context-menu"
import { FeatureCreationGuide } from "@/components/feature-creation-guide"
import { FeatureForm } from "@/components/feature-form"
import { BottomSheet } from "@/components/bottom-sheet"
import { useMobile } from "@/hooks/use-mobile";
import { JSX } from "react/jsx-runtime";
import { mapFeatures } from "@/data/mapFeatures";

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

// Define types
type ResizeHandle = "top" | "right" | "bottom" | "left" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | null
type SheetState = "collapsed" | "compact" | "expanded"

export default function FestivalMapOverlay() {
  const [sheetState, setSheetState] = useState<SheetState>("collapsed")
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [draggingFeature, setDraggingFeature] = useState<string | null>(null)
  const [resizingFeature, setResizingFeature] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [features, setFeatures] = useState<MapFeature[]>([]);
  // const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); // Removed, Popover handles position
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [fixedScale, setFixedScale] = useState(true); // New state for fixed scaling
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
  const [activeIndex, setActiveIndex] = useState(0) // Add state for active index

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const originalImageWidth = 1000 // Original image width
  const originalImageHeight = 1500 // Original image height
  const minFeatureSize = 20 // Minimum size for resizable features

  // Initial features data
  useEffect(() => {
    setFeatures(mapFeatures)
   }, [])

   // Scrolls the map to center the given feature using scrollIntoView
   const scrollToFeature = (feature: MapFeature) => { // Removed currentScale param
     if (!mapContainerRef.current || !feature) return;

     const featureElementId = `feature-${feature.id}`;
     const featureElement = document.getElementById(featureElementId);

     if (featureElement) {
       console.log(`Scrolling feature ${feature.id} into view.`);
       featureElement.scrollIntoView({
         behavior: 'smooth',
         block: 'center', // Vertical alignment
         inline: 'center' // Horizontal alignment
       });
     } else {
       console.warn(`Could not find element with ID: ${featureElementId}`);
     }

     // Note: State setting is removed, handled by handleSelectFeature
    // No need to set tooltip position manually with Popover
    // setTooltipPosition({
    //   x: featureX + featureWidth / 2,
    //   y: featureY - 10, // Position slightly above the feature
    // });
  };

  // Handles updating the selected feature state
  const handleSelectFeature = (feature: MapFeature | null) => {
    setSelectedFeature(feature);
  };

  // Handle feature selection from bottom sheet
  const handleSelectFeatureFromSheet = (feature: MapFeature) => {
    if (sheetState === "expanded") {
      // When selecting from expanded view, collapse to compact mode
      setSheetState("compact");
    }
    if (sheetState === "compact") {
      setPopoverOpen(true);
    } else if (sheetState === "collapsed") {
      // When collapsed, switch to compact mode
      setSheetState("compact");
    }
    handleSelectFeature(feature);
    // Scrolling is handled by the useEffect watching selectedFeature
  }

  // Effect to handle sheet state changes
  useEffect(() => {
    // Close popover when leaving compact mode
    if (sheetState !== "compact") {
      setPopoverOpen(false);
    }
  }, [sheetState]);

  // Effect to scroll map when selectedFeature changes
  useEffect(() => {
    if (selectedFeature && mapContainerRef.current) {
     // Increase delay slightly and use requestAnimationFrame for better timing before repaint
     const timer = setTimeout(() => {
       requestAnimationFrame(() => {
         // scrollToFeature should handle the null check for selectedFeature internally now
         // Call scrollToFeature using the selectedFeature from the closure
         if (selectedFeature) { // Still need to ensure feature exists before calling
            scrollToFeature(selectedFeature);
         }
       });
     }, 150); // 150ms delay

     return () => clearTimeout(timer); // Cleanup timeout
    }
  // Only trigger scroll effect when selectedFeature changes
  }, [selectedFeature]);

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

           // Apply the scale to the container - REMOVED direct style setting
           // if (mapContainerRef.current) {
           //   mapContainerRef.current.style.width = `${originalImageWidth * newScale}px`
           //   mapContainerRef.current.style.height = `${originalImageHeight * newScale}px`
           //   mapContainerRef.current.style.overflow = "auto"
           // }
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

  // Handle feature click on the map
  const handleFeatureClick = (feature: MapFeature, e: React.MouseEvent) => {
    if (debugMode) return;

    e.stopPropagation();
    
    // Find the index of the clicked feature in the areaFeatures list
    const areaFeatures = features.filter((f) => f.width && f.height);
    const clickedIndex = areaFeatures.findIndex(f => f.id === feature.id);

    if (sheetState === "compact") {
      // If clicking the same feature, toggle its state
      if (selectedFeature?.id === feature.id) {
        setPopoverOpen(!popoverOpen);
      } else {
        // If clicking a different feature, select it, show popover, and update index
        setPopoverOpen(true);
        handleSelectFeature(feature);
        if (clickedIndex !== -1) {
          setActiveIndex(clickedIndex);
        }
      }
    } else {
      // Normal behavior for other modes
      handleSelectFeature(selectedFeature?.id === feature.id ? null : feature);
      // Also update index if clicking a valid area feature
      if (clickedIndex !== -1) {
        setActiveIndex(clickedIndex);
      }
    }
  };

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

    const container = mapContainerRef.current
    const rect = container?.getBoundingClientRect()
    if (container && rect) {
      // Adjust position by adding scroll offset
      const x = e.clientX - rect.left + container.scrollLeft
      const y = e.clientY - rect.top + container.scrollTop

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

  // Close context menu and popover when clicking elsewhere
  const handleCloseContextMenu = (e: React.MouseEvent) => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false })
    }

    if (sheetState === "compact" && e.target === e.currentTarget) {
      setPopoverOpen(false);
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
    <div className="w-full max-w-6xl mx-auto bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">MEGAPORT FEST. 2025</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} />
            <Label htmlFor="debug-mode" className="dark:text-gray-300">Debug Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="fixed-scale" checked={fixedScale} onCheckedChange={toggleFixedScale} />
            <Label htmlFor="fixed-scale" className="dark:text-gray-300">Fixed Scale</Label>
          </div>
          {debugMode && <Button onClick={exportPositions}>Export Positions</Button>}
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="relative overflow-auto rounded-lg shadow-lg dark:border dark:border-gray-700"
        style={{
          height: "calc(100vh - 180px)",
          overscrollBehaviorX: 'contain' // Prevent horizontal swipe navigation
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onClick={handleCloseContextMenu}
      >
        {/* Inner container explicitly sized to scaled image dimensions */}
        <div
          className="relative"
          style={{
            width: `${originalImageWidth * scale}px`,
            height: `${originalImageHeight * scale}px`,
          }}
        >
          {/* Original map image - remove w-full/h-auto, use display:block */}
          <Image
            ref={imageRef}
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/25map_FIIIINAL-BSaUprHsOIgoBKmdVDzpeyCQbZlbl9.png"
            alt="MEGAPORT FEST. 2025 Map"
            width={originalImageWidth}
            height={originalImageHeight}
            // className="w-full h-auto" // Removed
            style={{ display: 'block' }} // Added
            priority
          />

          {/* Clickable overlays with Popovers */}
          <div className="absolute top-0 left-0 w-full h-full">
            {features.map((feature) => (
              <Popover
                key={feature.id}
                open={(sheetState === "compact" ? (selectedFeature?.id === feature.id && popoverOpen) : selectedFeature?.id === feature.id) && !debugMode}
                onOpenChange={(open) => {
                  if (!open) {
                    if (sheetState !== "compact") {
                      setSelectedFeature(null);
                    } else {
                      setPopoverOpen(false);
                    }
                  }
                }}
               >
                 {/* Outer div for visual representation, size, position, and click handling */}
                 <div
                   id={`feature-${feature.id}`} // Add unique ID for targeting
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
                      e.stopPropagation();
                      handleEditFeature(feature.id);
                    }}
                  >
                    {/* Inner, centered, invisible div to act as the PopoverTrigger anchor */}
                    <PopoverTrigger asChild>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '1px', // Small, invisible anchor
                          height: '1px',
                        }}
                      />
                    </PopoverTrigger>

                    {/* Visual content of the feature */}
                    {!feature.width && !debugMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-full dark:bg-gray-800 dark:bg-opacity-80">
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
                  </div> {/* End of outer visual div */}

                {/* Popover content remains the same, aligned to the centered trigger */}
                <PopoverContent className="w-64 z-30" align="center">
                  {/* Content for the popover */}
                  <div className="flex items-center gap-2 mb-2">
                    {feature.icon}
                    <h3 className="font-bold text-lg dark:text-white">{feature.name}</h3>
                  </div>
                  <p>{feature.description}</p>
                  {/* Close button is implicitly handled by Popover's onOpenChange */}
                </PopoverContent>
              </Popover>
            ))}
          </div>

          {/* Information tooltip - REMOVED, handled by Popover */}

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
      {!debugMode && (
        <BottomSheet
          features={features}
          onSelectFeature={handleSelectFeatureFromSheet}
          selectedFeature={selectedFeature}
          sheetState={sheetState}
          onSheetStateChange={setSheetState}
          activeIndex={activeIndex} // Pass activeIndex
          onActiveIndexChange={setActiveIndex} // Pass handler
        />
      )}

      {/* Debug console */}
      {debugMode && (
        <Card className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-2 dark:text-white">Debug Console</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 dark:text-gray-200">Feature Positions</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-xs bg-gray-800 text-green-400 dark:bg-black dark:text-green-300 p-2 rounded">
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
              <h3 className="font-semibold mb-2 dark:text-gray-200">Instructions</h3>
              <ul className="text-sm space-y-1 dark:text-gray-300">
                <li>• Drag the red boxes to position features</li>
                <li>• Use blue resize handles to adjust area sizes</li>
                <li>• Double-click any feature to edit its properties</li>
                <li>• Right-click to add new features or delete existing ones</li>
                <li>• Toggle "Fixed Scale" to maintain consistent positioning</li>
              </ul>
              <div className="mt-4">
                <h4 className="font-semibold dark:text-gray-200">Map Scale: {scale.toFixed(3)}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Original dimensions scaled to fit container</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
