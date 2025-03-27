"use client"

import type React from "react"

interface ResizeHandleProps {
  position: "top" | "right" | "bottom" | "left" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  onMouseDown: (position: string, e: React.MouseEvent) => void
}

export function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
  // Determine cursor style based on position
  const getCursorStyle = () => {
    switch (position) {
      case "top":
      case "bottom":
        return "cursor-ns-resize"
      case "left":
      case "right":
        return "cursor-ew-resize"
      case "topLeft":
      case "bottomRight":
        return "cursor-nwse-resize"
      case "topRight":
      case "bottomLeft":
        return "cursor-nesw-resize"
      default:
        return "cursor-move"
    }
  }

  // Determine position styles
  const getPositionStyle = () => {
    switch (position) {
      case "top":
        return "top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      case "right":
        return "top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2"
      case "bottom":
        return "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"
      case "left":
        return "top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2"
      case "topLeft":
        return "top-0 left-0 transform -translate-x-1/2 -translate-y-1/2"
      case "topRight":
        return "top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
      case "bottomLeft":
        return "bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2"
      case "bottomRight":
        return "bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"
      default:
        return ""
    }
  }

  return (
    <div
      className={`absolute w-4 h-4 bg-blue-500 rounded-full ${getPositionStyle()} ${getCursorStyle()}`}
      onMouseDown={(e) => onMouseDown(position, e)}
    />
  )
}

