"use client"

import Link from "next/link"
import { Phone, ShoppingCart, Eye, CreditCard, Wine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Company } from "@/components/companies/companies-content"

export function CompanyCard({
  company,
  onAddPurchase,
}: {
  company: Company
  onAddPurchase: () => void
}) {
  return (
    <Link href={`/companies/${company.id}`} className="flex-1">
      <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <h3 className="font-semibold text-lg text-foreground leading-tight pr-2">
            {company.name}
          </h3>
          <Badge
            variant="secondary"
            className={
              company.status === "active"
                ? "bg-success/10 text-success border-0 shrink-0"
                : "bg-muted text-muted-foreground border-0 shrink-0"
            }
          >
            {company.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Body */}
        <div className="flex flex-col divide-y divide-border px-5 py-4 flex-1">
          {/* Contact Info */}
          <div className="flex items-center gap-3 pb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{company.contactPerson}</p>
              <p className="text-xs text-muted-foreground">{company.phone}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="py-3 flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Outstanding</span>
              <span
                className={`text-xl font-bold ${company.outstanding > 0 ? "text-destructive" : "text-success"
                  }`}
              >
                {"\u20B9"}{company.outstanding.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Payment Terms: {company.paymentTerms} days</span>
              <span>Last: {company.lastPurchase}</span>
            </div>
          </div>

          {/* Returnable Bottles */}
          {company.emptiesOwed > 0 && (
            <div className="pt-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Wine className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning-foreground">
                  Empties Owed: {company.emptiesOwed} bottles
                </span>
              </div>
              <ul className="pl-6 flex flex-col gap-0.5">
                {company.emptiesBreakdown.map((item) => (
                  <li key={item.productId} className="text-xs text-muted-foreground">
                    {item.productName}: {item.empties} empties
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 pb-5 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onAddPurchase}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add Purchase
          </Button>
          {company.outstanding > 0 && (
            <Link href={`/companies/${company.id}?pay=true`}>
              <Button
                size="sm"
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Pay
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Link>
  )
}
