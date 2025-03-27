"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react" // Removed ChevronUp, ChevronDown
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

interface BottomSheetProps {
  features: any[]
  onSelectFeature: (feature: any) => void
  selectedFeature: any | null
}

type SheetState = "collapsed" | "compact" | "expanded"

export function BottomSheet({ features, onSelectFeature, selectedFeature }: BottomSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>("collapsed")
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMobile()

  // Filter only area features (stages and zones)
  const areaFeatures = features.filter((feature) => feature.width && feature.height)

  // Get the height based on the current state
  const getHeight = () => {
    switch (sheetState) {
      case "collapsed":
        return "60px"
      case "compact":
        return "150px"
      case "expanded":
        return "80vh"
      default:
        return "60px"
    }
  }

  // Toggle between compact and expanded
  const toggleExpand = () => {
    setSheetState(sheetState === "expanded" ? "compact" : "expanded")
  }

  // Toggle between collapsed and compact
  const toggleCollapse = () => {
    setSheetState(sheetState === "collapsed" ? "compact" : "collapsed")
  }

  // Handle feature selection
  const handleSelectFeature = (feature: any) => {
    // Always center and select the feature
    onSelectFeature(feature)

    // If in expanded mode, collapse the sheet
    if (sheetState === "expanded") {
      setSheetState("collapsed")
    }
  }

  // Handle navigation in compact mode
  const handlePrevious = () => {
    if (sheetState !== "compact" || areaFeatures.length <= 1) return
    setActiveIndex((prev) => (prev - 1 + areaFeatures.length) % areaFeatures.length)
  }

  const handleNext = () => {
    if (sheetState !== "compact" || areaFeatures.length <= 1) return
    setActiveIndex((prev) => (prev + 1) % areaFeatures.length)
  }

  // Update selected feature when active index changes in compact mode
  useEffect(() => {
    if (sheetState === "compact" && areaFeatures.length > 0) {
      // Only select the feature if it's different from the currently selected one
      const feature = areaFeatures[activeIndex]
      if (!selectedFeature || feature.id !== selectedFeature.id) {
        onSelectFeature(feature)
      }
    }
  }, [activeIndex, sheetState, areaFeatures, selectedFeature])

  // Render the appropriate content based on the current state
  const renderContent = () => {
    switch (sheetState) {
      case "collapsed":
        return (
          <div className="flex justify-center items-center h-full">
            <button onClick={toggleCollapse} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
              {/* Custom Up Angle (wider, smoother) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-6 text-gray-800 dark:text-gray-200" // Adjusted width class
              >
                <path d="m18 15-6-3-6 3"></path> {/* Shallower angle */}
              </svg>
            </button>
          </div>
        )
      case "compact":
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-between px-4 overflow-hidden">
              <button onClick={handlePrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 z-10">
                <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                  {areaFeatures[activeIndex]?.icon}
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{areaFeatures[activeIndex]?.name}</div>
              </div>

              <button onClick={handleNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 z-10">
                <ChevronRight className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>
            </div>

            <div className="flex justify-center pb-2">
              <div className="flex gap-1">
                {areaFeatures.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === activeIndex ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      case "expanded":
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Festival Areas</h3>
              <div className="grid grid-cols-1 gap-3">
                {areaFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedFeature?.id === feature.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => handleSelectFeature(feature)}
                  >
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{feature.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-lg z-50"
      initial={{ height: "60px" }}
      animate={{ height: getHeight() }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Handle bar - Only shown when not collapsed */}
      {sheetState !== "collapsed" && (
        <div className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {/* Spacer to center the handle */}
          <div className="w-8"></div> {/* Adjust width to match close button */}

          {/* Central handle and expand/collapse toggle */}
          <div
            className="flex items-center justify-center cursor-pointer flex-grow" // Added flex-grow to center
            onClick={toggleExpand} // Toggles between compact and expanded
          >
            {/* Custom Angle Icons */}
            {sheetState === "expanded" ? (
              // Custom Down Angle (wider, smoother)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24" // Increased width for wider angle
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-6 text-gray-500 dark:text-gray-400" // Adjusted width class
              >
                <path d="m6 9 6 3 6-3"></path> {/* Shallower angle */}
              </svg>
            ) : sheetState === "compact" ? (
              // Custom Up Angle (wider, smoother)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24" // Increased width for wider angle
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-6 text-gray-500 dark:text-gray-400" // Adjusted width class
              >
                <path d="m18 15-6-3-6 3"></path> {/* Shallower angle */}
              </svg>
            ) : null}
          </div>

          {/* Close button */}
          <button
            onClick={() => setSheetState("collapsed")} // Always collapses the sheet
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close bottom sheet"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </motion.div>
  )
}
