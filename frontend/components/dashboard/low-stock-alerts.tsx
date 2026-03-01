"use client"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type LowStockItem = {
  productId: string
  productName: string
  cases: number
  bottles: number
}

type StockSummary = {
  totalProducts: number
  lowStock: LowStockItem[]
  returnables: {
    totalEmptiesInStock: number
    totalOwedToCompanies: number
    totalOwedByShops: number
    shortage: number
  }
}

export function LowStockAlerts() {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])

  useEffect(() => {
    api.get<StockSummary>("/products/summary/stock").then((res) => {
      setLowStock(res.data.lowStock ?? [])
    }).catch(() => { })
  }, [])

  if (lowStock.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Low Stock</h2>
          <Badge variant="secondary" className="bg-success/10 text-success border-0">All Good</Badge>
        </div>
        <p className="text-sm text-muted-foreground px-6 pb-6">All products have sufficient stock.</p>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Low Stock</h2>
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">
          {lowStock.length}
        </Badge>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-3">
        {lowStock.map((item) => {
          const severity = item.cases === 0 ? "critical" : "warning"
          return (
            <div
              key={item.productId}
              className="flex items-center justify-between p-3.5 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-4 w-4 ${severity === "critical" ? "text-destructive" : "text-warning"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.cases} cases + {item.bottles} loose bottles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={severity === "critical" ? "bg-destructive/10 text-destructive border-0" : "bg-warning/10 text-warning-foreground border-0"}
                >
                  {item.cases === 0 ? "Out" : "Low"}
                </Badge>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Reorder
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
