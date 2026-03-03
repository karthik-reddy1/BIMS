"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, Wallet, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { ItemSalesReport } from "./item-sales-report"

// Helper type for mapping UI
type PLReport = {
  revenue: { shopSales: number; brokenCollected: number; total: number }
  expenses: { purchases: number; transport: number; brokenPenalty: number; routeExpenses: number; total: number }
  profit: { cashProfit: number; inventoryValue: number; totalProfit: number }
}

export function ReportsContent() {
  const [data, setData] = useState<PLReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState("30")

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - parseInt(days))
      const res = await api.get<PLReport>(
        `/reports/profit-loss?from=${from.toISOString()}&to=${to.toISOString()}`
      )
      setData(res.data)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report")
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const fmt = (val: number | undefined) => `₹${(val || 0).toLocaleString("en-IN")}`

  const summaryCards = [
    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: fmt(data?.revenue.total),
      change: data?.revenue.total ? "Active" : "Stable",
      changeColor: "text-success",
      iconColor: "text-success",
      iconBg: "bg-success/10",
      accent: "border-l-4 border-l-success",
    },
    {
      icon: TrendingDown,
      label: "Total Expenses",
      value: fmt(data?.expenses.total),
      change: data?.expenses.total ? "Active" : "Stable",
      changeColor: "text-destructive",
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      accent: "border-l-4 border-l-destructive",
    },
    {
      icon: Wallet,
      label: "Net Profit",
      value: fmt(data?.profit.cashProfit),
      change: (data?.profit?.cashProfit ?? 0) >= 0 ? "Profit" : "Loss",
      changeColor: (data?.profit?.cashProfit ?? 0) >= 0 ? "text-primary" : "text-destructive",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      accent: "border-l-4 border-l-primary",
    },
  ]

  const revenueBreakdown = [
    { label: "Shop Sales", value: fmt(data?.revenue.shopSales) },
    { label: "Broken Collections", value: fmt(data?.revenue.brokenCollected) },
  ]

  const expenseBreakdown = [
    { label: "Purchases", value: fmt(data?.expenses.purchases) },
    { label: "Transport", value: fmt(data?.expenses.transport) },
    { label: "Route Expenses", value: fmt(data?.expenses.routeExpenses) },
    { label: "Broken Penalty", value: fmt(data?.expenses.brokenPenalty) },
  ]

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Profit & Loss Report</h1>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-44 bg-white/80 backdrop-blur-md border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-border"
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).triggerExcelExport) {
                (window as any).triggerExcelExport()
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export .xlsx
          </Button>
        </div>
      </div>

      <ItemSalesReport days={days} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-muted-foreground">Loading report data...</div>
        ) : error ? (
          <div className="col-span-3 py-12 text-center text-destructive">{error}</div>
        ) : (
          summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className={`backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border p-6 ${card.accent}`}
              >
                <div className={`p-3 rounded-lg ${card.iconBg} w-fit mb-4`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-4xl font-bold text-foreground mt-1">{card.value}</p>
                <p className={`text-sm mt-2 ${card.changeColor} font-medium`}>{card.change}</p>
              </div>
            )
          })
        )}
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Revenue Breakdown</h2>
            <div className="flex flex-col gap-3">
              {revenueBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-foreground">{fmt(data?.revenue.total)}</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Expense Breakdown</h2>
            <div className="flex flex-col gap-3">
              {expenseBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-foreground">{fmt(data?.expenses.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-8 border-l-4 border-l-success">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xl text-foreground">Cash Profit</span>
              <span className="text-2xl font-bold text-foreground">{fmt(data?.profit.cashProfit)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Inventory Value</span>
              <span className="text-lg text-muted-foreground">{fmt(data?.profit.inventoryValue)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-foreground">Total Business Value</span>
              <span className="text-4xl font-bold text-success">{fmt(data?.profit.totalProfit)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
