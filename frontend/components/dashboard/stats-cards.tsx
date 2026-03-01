"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import api from "@/lib/api"
import type { ApiShopBill } from "@/lib/types"

export function SalesTrendChart() {
  const [chartData, setChartData] = useState<{ day: string; sales: number }[]>([])

  useEffect(() => {
    api.get<ApiShopBill[]>("/bills").then((res) => {
      // Aggregate bills by day (last 7 days)
      const dayMap: Record<string, number> = {}
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString("en-IN", { weekday: "short" })
        dayMap[key] = 0
      }
      res.data.forEach((bill) => {
        const d = new Date(bill.billDate)
        const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (diff <= 6) {
          const key = d.toLocaleDateString("en-IN", { weekday: "short" })
          dayMap[key] = (dayMap[key] ?? 0) + (bill.grandTotal ?? 0)
        }
      })
      setChartData(Object.entries(dayMap).map(([day, sales]) => ({ day, sales })))
    }).catch(() => { })
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Sales Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#1a1a1a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#1a1a1a" }}
                activeDot={{ r: 6 }}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Alias so the dashboard page can import `StatsCards`
export { SalesTrendChart as StatsCards }
