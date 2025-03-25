import { Music, Mic, Users, Star, Coffee, Film, Disc } from "lucide-react"

export function getEventTypeById(id: string | undefined) {
  if (!id) return undefined

  const eventTypes = [
    { id: "music", name: "Music", color: "bg-blue-500", icon: "Music" },
    { id: "dj", name: "DJ Set", color: "bg-purple-500", icon: "Disc" },
    { id: "talk", name: "Talk", color: "bg-green-500", icon: "Mic" },
    { id: "workshop", name: "Workshop", color: "bg-yellow-500", icon: "Users" },
    { id: "special", name: "Special Event", color: "bg-red-500", icon: "Star" },
    { id: "break", name: "Break", color: "bg-gray-300", icon: "Coffee" },
  ]

  return eventTypes.find((type) => type.id === id)
}

export function getEventTypeIcon(iconName: string | undefined) {
  switch (iconName) {
    case "Music":
      return <Music className="h-3 w-3" />
    case "Mic":
      return <Mic className="h-3 w-3" />
    case "Users":
      return <Users className="h-3 w-3" />
    case "Star":
      return <Star className="h-3 w-3" />
    case "Coffee":
      return <Coffee className="h-3 w-3" />
    case "Film":
      return <Film className="h-3 w-3" />
    case "Disc":
      return <Disc className="h-3 w-3" />
    default:
      return <Music className="h-3 w-3" />
  }
}

