import { FestivalTimetable } from "@/components/festival-timetable-absolute"
import { StageProvider } from "@/components/stage-provider"
import { FestivalDataProvider } from "@/components/festival-data-provider"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <StageProvider>
        <FestivalDataProvider>
          {/* Banner Title */}
          <h1 className="sticky top-0 z-10 h-10 bg-background text-lg font-bold text-center py-2 mb-3 w-full border-b border-border shadow-sm">大港開唱 2025</h1>
          <div className="container mx-auto py-2 px-2 h-full max-h-full">
            <FestivalTimetable />
          </div>
        </FestivalDataProvider>
      </StageProvider>
    </main>
  )
}
