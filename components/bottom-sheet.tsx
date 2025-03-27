"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Minus } from "lucide-react" // Added Minus
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
  const [lastNonCollapsedState, setLastNonCollapsedState] = useState<"compact" | "expanded">("compact") // Remember last state
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMobile()

  // Filter features
  const areaFeatures = features.filter((feature) => feature.width && feature.height) // Used in expanded view
  const stageFeatures = features.filter((feature) => feature.isStage) // Used in compact view

  // Get the height based on the current state
  const getHeight = () => {
    switch (sheetState) {
      case "collapsed":
        return "60px"
      case "compact":
        return "120px" // Increased height again
      case "expanded":
        return "80vh"
      default:
        return "60px"
    }
  }

  // Toggle between compact and expanded, remembering the new state
  const toggleExpand = () => {
    const newState = sheetState === "expanded" ? "compact" : "expanded"
    setSheetState(newState)
    setLastNonCollapsedState(newState)
  }

  // Toggle between collapsed and the last non-collapsed state
  const toggleCollapse = () => {
    setSheetState((currentState) => {
      if (currentState === "collapsed") {
        return lastNonCollapsedState // Return to the last remembered state
      } else {
        setLastNonCollapsedState(currentState as "compact" | "expanded") // Remember the current state before collapsing
        return "collapsed"
      }
    })
  }


  // Handle feature selection
  const handleSelectFeature = (feature: any) => {
    // Always center and select the feature
    onSelectFeature(feature)

    // If in expanded mode, collapse the sheet (and remember it was expanded)
    if (sheetState === "expanded") {
      setLastNonCollapsedState("expanded")
      setSheetState("collapsed")
    }
  }

  // Handle navigation in compact mode (using stageFeatures)
  const handlePrevious = () => {
    if (sheetState !== "compact" || stageFeatures.length <= 1) return
    setActiveIndex((prev) => (prev - 1 + stageFeatures.length) % stageFeatures.length)
  }

  const handleNext = () => {
    if (sheetState !== "compact" || stageFeatures.length <= 1) return
    setActiveIndex((prev) => (prev + 1) % stageFeatures.length)
  }

  // Update selected feature when active index changes in compact mode (using stageFeatures)
  useEffect(() => {
    if (sheetState === "compact" && stageFeatures.length > 0) {
      // Only select the feature if it's different from the currently selected one
      const feature = stageFeatures[activeIndex]
      if (!selectedFeature || feature.id !== selectedFeature.id) {
        onSelectFeature(feature) // Select the stage feature
      }
    }
    // Reset index if switching to compact and index is out of bounds for stages
    else if (sheetState === "compact" && activeIndex >= stageFeatures.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, sheetState, stageFeatures, selectedFeature, onSelectFeature]) // Added onSelectFeature dependency

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
          <div className="h-full flex flex-col" style={{ height: `calc(${getHeight()} - 48px)` }}> {/* Adjusted height to account for the handle bar h-12 */}
            <div className="flex-1 flex items-center justify-between px-4 overflow-hidden">
              <button onClick={handlePrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 z-10">
                <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>

              {/* Display current stage */}
              {stageFeatures.length > 0 ? (
                <div className="flex items-center gap-2"> {/* Reduced gap */}
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                    {stageFeatures[activeIndex]?.icon}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{stageFeatures[activeIndex]?.name}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No stages available</div>
              )}

              <button onClick={handleNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 z-10">
                <ChevronRight className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>
            </div>

            {/* Pagination dots for stages */}
            <div className="flex justify-center pb-1"> {/* Reduced bottom padding */}
              <div className="flex gap-1">
                {stageFeatures.map((_, index) => (
                  <div
                    key={`dot-${index}`} // Use a more specific key
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
          {/* Left: Expand/Compact Toggle */}
          <button
            onClick={toggleExpand}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={sheetState === "expanded" ? "Compact sheet" : "Expand sheet"}
          >
            {sheetState === "expanded" ? (
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
                className="h-5 w-6 text-gray-500 dark:text-gray-400"
              >
                <path d="m6 9 6 3 6-3"></path>
              </svg>
            ) : ( // sheetState === "compact"
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
                className="h-5 w-6 text-gray-500 dark:text-gray-400"
              >
                <path d="m18 15-6-3-6 3"></path>
              </svg>
            )}
          </button>

          {/* Center: Collapse Toggle */}
          <button
            onClick={toggleCollapse} // Toggles between current state and collapsed
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Collapse sheet"
          >
            <Minus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Right: Close button (Always collapses) */}
          <button
            onClick={() => setSheetState("collapsed")}
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
