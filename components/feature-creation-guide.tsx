"use client"

interface FeatureCreationGuideProps {
  startX: number
  startY: number
  width: number
  height: number
}

export function FeatureCreationGuide({ startX, startY, width, height }: FeatureCreationGuideProps) {
  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 z-20"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5">
        {Math.round(width)} x {Math.round(height)}
      </div>
    </div>
  )
}

