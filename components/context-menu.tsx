"use client"

import { useRef, useEffect } from "react"
import { MapPin, Square, Trash2 } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  visible: boolean
  onClose: () => void
  onCreatePoint: () => void
  onCreateArea: () => void
  onDelete?: (id: string) => void
  featuresToDelete?: Array<{ id: string; name: string }>
}

export function ContextMenu({
  x,
  y,
  visible,
  onClose,
  onCreatePoint,
  onCreateArea,
  onDelete,
  featuresToDelete = [],
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      ref={menuRef}
      className="absolute bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow-lg z-30 py-1 min-w-[180px] overflow-hidden"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="px-3 py-2 text-sm font-semibold border-b bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Map Actions</div>

      <button
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
        onClick={onCreatePoint}
      >
        <MapPin className="h-4 w-4" />
        Add Point Here
      </button>

      <button
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
        onClick={onCreateArea}
      >
        <Square className="h-4 w-4" />
        Create Area (Drag)
      </button>

      {featuresToDelete.length > 0 && (
        <>
          <div className="border-t my-1 dark:border-gray-600"></div>
          <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">Delete Features:</div>

          {featuresToDelete.map((feature) => (
            <button
              key={feature.id}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-2"
              onClick={() => onDelete?.(feature.id)}
            >
              <Trash2 className="h-4 w-4" />
              {feature.name}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
