import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const lowStockItems = [
  { name: "Thumbsup RGB 300ml", stock: 35, severity: "warning" as const },
  { name: "Fanta PET 500ml", stock: 15, severity: "critical" as const },
  { name: "Coke RGB 300ml", stock: 30, severity: "warning" as const },
]

export function LowStockAlerts() {
  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Low Stock</h2>
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">
          {lowStockItems.length}
        </Badge>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-3">
        {lowStockItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3.5 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-4 w-4 ${item.severity === "critical" ? "text-destructive" : "text-warning"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.stock} bottles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  item.severity === "critical"
                    ? "bg-destructive/10 text-destructive border-0"
                    : "bg-warning/10 text-warning-foreground border-0"
                }
              >
                {item.stock}
              </Badge>
              <Button size="sm" variant="outline" className="text-xs h-7">
                Reorder
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
