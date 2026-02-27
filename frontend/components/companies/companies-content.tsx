"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { companies } from "@/lib/company-data"
import { CompanyCard } from "@/components/companies/company-card"
import { AddCompanyDialog } from "@/components/companies/add-company-dialog"
import { AddPurchaseDialog } from "@/components/companies/add-purchase-dialog"

export function CompaniesContent() {
  const [addOpen, setAddOpen] = useState(false)
  const [purchaseCompanyId, setPurchaseCompanyId] = useState<string | null>(null)

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onAddPurchase={() => setPurchaseCompanyId(company.id)}
          />
        ))}
      </div>

      <AddCompanyDialog open={addOpen} onOpenChange={setAddOpen} />
      <AddPurchaseDialog
        company={purchaseCompany}
        open={purchaseCompanyId !== null}
        onOpenChange={(open) => {
          if (!open) setPurchaseCompanyId(null)
        }}
      />
    </>
  )
}
