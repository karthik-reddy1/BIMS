import { TrendingUp, ShoppingCart, Package, AlertTriangle } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    label: "Today's Sales",
    value: "\u20B912,500",
    subtext: "+12% from yesterday",
    subtextColor: "text-success",
  },
  {
    icon: ShoppingCart,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    label: "Today's Purchases",
    value: "\u20B98,000",
    subtext: "3 suppliers",
    subtextColor: "text-muted-foreground",
  },
  {
    icon: Package,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    label: "Empty Bottles",
    value: "250",
    subtext: "200 good, 50 broken",
    subtextColor: "text-muted-foreground",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    label: "Shortage Alert",
    value: "450",
    subtext: "empties in circulation",
    subtextColor: "text-destructive",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="backdrop-blur-md bg-white/80 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.subtextColor}`}>{stat.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
