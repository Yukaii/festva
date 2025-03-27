"use client"

import { Utensils, Music, ShoppingBag } from "lucide-react"

interface AreaDetailsProps {
  areaId: string
  onClose: () => void
}

export function AreaDetails({ areaId, onClose }: AreaDetailsProps) {
  const areaData = {
    "main-stage": {
      name: "大港開唱 2025",
      description: "Main stage area featuring headline performances",
      icon: <Music className="h-5 w-5" />,
      schedule: [
        { time: "14:00-15:00", act: "Opening Act" },
        { time: "15:30-16:30", act: "Local Band Showcase" },
        { time: "17:00-18:30", act: "International Guest" },
        { time: "19:00-21:00", act: "Headliner Performance" },
      ],
    },
    "food-market": {
      name: "美食市集",
      description: "Food market with various local and international cuisine options",
      icon: <Utensils className="h-5 w-5" />,
      vendors: ["Street Food Stall", "International Cuisine", "Local Delicacies", "Dessert Corner", "Beverage Station"],
    },
    "creative-market": {
      name: "文創市集",
      description: "Creative market featuring local artists and crafts",
      icon: <ShoppingBag className="h-5 w-5" />,
      vendors: ["Handmade Crafts", "Art Prints", "Festival Merchandise", "Local Designers", "Vintage Collectibles"],
    },
    "south-stage": {
      name: "南霸天",
      description: "South stage featuring alternative and indie performances",
      icon: <Music className="h-5 w-5" />,
      schedule: [
        { time: "13:00-14:00", act: "Indie Opener" },
        { time: "14:30-15:30", act: "Alternative Rock Band" },
        { time: "16:00-17:00", act: "Electronic Set" },
        { time: "17:30-19:00", act: "Closing Performance" },
      ],
    },
  }

  const data = areaData[areaId as keyof typeof areaData]

  if (!data) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {data.icon}
          <h3 className="text-xl font-bold">{data.name}</h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <p className="mb-4 text-gray-700">{data.description}</p>

      {data.schedule && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Schedule</h4>
          <ul className="space-y-1">
            {data.schedule.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span className="text-gray-600">{item.time}</span>
                <span>{item.act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.vendors && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Vendors</h4>
          <ul className="space-y-1">
            {data.vendors.map((vendor, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>• {vendor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add to My Schedule</button>
      </div>
    </div>
  )
}

