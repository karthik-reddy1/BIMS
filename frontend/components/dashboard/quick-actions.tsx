"use client"

import { useState } from "react"
import Link from "next/link"
import { Receipt, ShoppingCart, Truck, BarChart } from "lucide-react"
import { CreateBillDialog } from "@/components/billing/create-bill-dialog"

const actions = [
  { icon: Receipt, label: "New Bill", href: "/billing", color: "text-primary", bg: "bg-primary/10" },
  { icon: ShoppingCart, label: "Add Purchase", href: "/companies", color: "text-success", bg: "bg-success/10" },
  { icon: Truck, label: "Route Bills", href: "/routes", color: "text-chart-5", bg: "bg-chart-5/10" },
  { icon: BarChart, label: "Reports", href: "/reports", color: "text-warning", bg: "bg-warning/10" },
]

export function QuickActions() {
  const [billDialogOpen, setBillDialogOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          const content = (
            <>
              <div className={`p-3 rounded-lg ${action.bg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </>
          )

          if (action.label === "New Bill") {
            return (
              <button
                key={action.label}
                onClick={() => setBillDialogOpen(true)}
                className="flex flex-col items-center gap-3 backdrop-blur-md bg-white/80 rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border group w-full"
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-3 backdrop-blur-md bg-white/80 rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border group"
            >
              {content}
            </Link>
          )
        })}
      </div>
      <CreateBillDialog
        open={billDialogOpen}
        onOpenChange={setBillDialogOpen}
      />
    </>
  )
}
