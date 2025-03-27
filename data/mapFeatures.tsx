import {
  Info,
  Utensils,
  Music,
  Cigarette,
  Bath,
  X,
  Move,
  MapPin,
} from "lucide-react";

export const mapFeatures = [
  // Stages
  {
    id: "south-stage",
    name: "南霸天",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 17,
    y: 458,
    width: 114,
    height: 559,
    color: "rgba(67, 170, 139, 0.3)",
    isStage: true
  },
  {
    id: "goddess-stage",
    name: "女神龍",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 468,
    y: 1125,
    width: 119,
    height: 147,
    color: "rgba(249, 65, 68, 0.3)",
    isStage: true
  },
  {
    id: "stage-da-xiong-wan", // Renamed from area-1743037007471
    name: "大雄丸",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 422,
    y: 828,
    width: 47,
    height: 53,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true,
  },
  {
    id: "stage-hai-long-wang", // Renamed from area-1743037046891
    name: "海龍王",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 735,
    y: 1159,
    width: 105,
    height: 111,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-qing-chun-meng", // Renamed from area-1743037065404
    name: "青春夢",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 740,
    y: 855,
    width: 66,
    height: 77,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-lan-bao-shi", // Renamed from area-1743037087455
    name: "藍寶石",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 529,
    y: 757,
    width: 57,
    height: 50,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-hai-bo-lang", // Renamed from area-1743037098604
    name: "海波浪",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 588,
    y: 755,
    width: 104,
    height: 44,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-chu-tou-tian", // Renamed from area-1743037118723
    name: "出頭天",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 550,
    y: 570,
    width: 84,
    height: 42,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-xiao-gang-ji", // Renamed from area-1743037179506
    name: "小港祭",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 212,
    y: 191,
    width: 70,
    height: 63,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-ka-mo-mai", // Renamed from area-1743037195555
    name: "卡魔麥",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 79,
    y: 275,
    width: 39,
    height: 159,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  {
    id: "stage-da-shu-xia", // Renamed from area-1743037218856
    name: "大樹下",
    description: "",
    icon: <Music className="h-5 w-5" />,
    x: 408,
    y: 453,
    width: 48,
    height: 56,
    color: "rgba(100, 100, 100, 0.3)",
    isStage: true
  },
  // Other Features
  {
    id: "food-market",
    name: "美食市集",
    description: "Food market with various local and international cuisine options",
    icon: <Utensils className="h-5 w-5" />,
    x: 181,
    y: 264,
    width: 90,
    height: 181,
    color: "rgba(144, 190, 109, 0.3)"
  },
  {
    id: "restrooms-1",
    name: "廁所",
    description: "Restroom facilities",
    icon: <Bath className="h-5 w-5" />,
    x: 212,
    y: 482,
    width: 30,
    height: 30
  },
  {
    id: "restrooms-2",
    name: "廁所",
    description: "",
    icon: <Bath className="h-5 w-5" />,
    x: 417,
    y: 124,
    width: 43,
    height: 36
  },
  {
    id: "food-area",
    name: "飲食區",
    description: "",
    icon: <Utensils className="h-5 w-5" />,
    x: 408,
    y: 302,
    width: 47,
    height: 148
  },
  {
    id: "smoking",
    name: "吸菸區",
    description: "Designated smoking areas",
    icon: <Cigarette className="h-5 w-5" />,
    x: 35,
    y: 208,
    width: 44,
    height: 54
  },
  {
    id: "info",
    name: "服務台",
    description: "Information booths for festival inquiries",
    icon: <Info className="h-5 w-5" />,
    x: 411,
    y: 185,
    width: 39,
    height: 34
  },
];
