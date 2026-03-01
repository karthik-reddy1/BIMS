"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompanyCard } from "@/components/companies/company-card"
import { AddCompanyDialog } from "@/components/companies/add-company-dialog"
import { AddPurchaseDialog } from "@/components/companies/add-purchase-dialog"
import api from "@/lib/api"
import type { ApiCompany } from "@/lib/types"

// Shared UI-facing Company type used by CompanyCard, company-details, dialogs
export type Company = {
  id: string
  name: string
  contactPerson: string
  phone: string
  address: string
  paymentTerms: number
  status: "active" | "inactive"
  outstanding: number
  lastPurchase: string
  emptiesOwed: number
  emptiesBreakdown: { productId: string; productName: string; empties: number }[]
  purchases: { id: string; date: string; amount: number; status: "paid" | "pending" | "partial" }[]
}

export function mapApiCompany(c: ApiCompany): Company {
  const totalEmpties = c.returnableProducts.reduce((s, r) => s + r.emptiesOwed, 0)
  return {
    id: c.companyId,
    name: c.companyName,
    contactPerson: c.contactPerson ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    paymentTerms: c.paymentTerms,
    status: "active",
    outstanding: c.outstandingAmount,
    lastPurchase: c.updatedAt
      ? new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    emptiesOwed: totalEmpties,
    emptiesBreakdown: c.returnableProducts.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      empties: r.emptiesOwed,
    })),
    purchases: [], // loaded separately in company-details
  }
}

export function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [purchaseCompanyId, setPurchaseCompanyId] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<ApiCompany[]>("/companies")
      setCompanies(res.data.map(mapApiCompany))
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load companies")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const purchaseCompany = companies.find((c) => c.id === purchaseCompanyId) ?? null

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Supplier Companies</h1>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border h-56 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-center py-12 text-destructive">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onAddPurchase={() => setPurchaseCompanyId(company.id)}
            />
          ))}
        </div>
      )}

      {!loading && !error && companies.length === 0 && (
        <p className="text-center py-12 text-muted-foreground">No companies found. Add one to get started.</p>
      )}

      <AddCompanyDialog open={addOpen} onOpenChange={setAddOpen} onSaved={fetchCompanies} />
      <AddPurchaseDialog
        company={purchaseCompany}
        open={purchaseCompanyId !== null}
        onOpenChange={(open) => {
          if (!open) setPurchaseCompanyId(null)
        }}
        onSaved={fetchCompanies}
      />
    </>
  )
}
