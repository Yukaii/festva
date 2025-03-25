import { FestivalTimetable } from "@/components/festival-timetable-absolute"
import { StageProvider } from "@/components/stage-provider"
import { FestivalDataProvider } from "@/components/festival-data-provider"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <StageProvider>
        <FestivalDataProvider>
          <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">MegaPortFest 2025</h1>
            <FestivalTimetable />
          </div>
        </FestivalDataProvider>
      </StageProvider>
    </main>
  )
}

