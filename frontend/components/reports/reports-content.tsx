"use client"

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

const summaryCards = [
  {
    icon: TrendingUp,
    label: "Total Revenue",
    value: "\u20B91,25,500",
    change: "+12.5%",
    changeColor: "text-success",
    iconColor: "text-success",
    iconBg: "bg-success/10",
    accent: "border-l-4 border-l-success",
  },
  {
    icon: TrendingDown,
    label: "Total Expenses",
    value: "\u20B997,300",
    change: "+8.3%",
    changeColor: "text-destructive",
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    accent: "border-l-4 border-l-destructive",
  },
  {
    icon: Wallet,
    label: "Net Profit",
    value: "\u20B928,200",
    change: "+18.2%",
    changeColor: "text-primary",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    accent: "border-l-4 border-l-primary",
  },
]

const revenueBreakdown = [
  { label: "Shop Sales", value: "\u20B91,25,000", pct: "99%" },
  { label: "Broken Collections", value: "\u20B9500", pct: "1%" },
]

const expenseBreakdown = [
  { label: "Purchases", value: "\u20B980,000", pct: "82%" },
  { label: "Route Expenses", value: "\u20B912,000", pct: "12%" },
  { label: "Transport", value: "\u20B95,000", pct: "5%" },
  { label: "Broken Payments", value: "\u20B9300", pct: "1%" },
]

export function ReportsContent() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Profit & Loss Report</h1>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-44 bg-white/80 backdrop-blur-md border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card) => {
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
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Revenue Breakdown</h2>
          <div className="flex flex-col gap-3">
            {revenueBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">({item.pct})</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between py-1">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-foreground">{"\u20B9"}1,25,500</span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Expense Breakdown</h2>
          <div className="flex flex-col gap-3">
            {expenseBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">({item.pct})</span>
                </div>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between py-1">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-foreground">{"\u20B9"}97,300</span>
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-8 border-l-4 border-l-success">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xl text-foreground">Cash Profit</span>
            <span className="text-2xl font-bold text-foreground">{"\u20B9"}28,200</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">+ Inventory Value</span>
            <span className="text-lg text-muted-foreground">{"\u20B9"}2,50,000</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground">Total Business Value</span>
            <span className="text-4xl font-bold text-success">{"\u20B9"}2,78,200</span>
          </div>
        </div>
      </div>
    </>
  )
}
