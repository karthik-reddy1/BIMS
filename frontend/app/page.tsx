import { StatsCards } from "@/components/dashboard/stats-cards"
import { TodaysBills } from "@/components/dashboard/todays-bills"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <StatsCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodaysBills />
        <LowStockAlerts />
      </div>
      <QuickActions />
    </div>
  )
}
