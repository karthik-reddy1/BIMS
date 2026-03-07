"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ShoppingCart, Phone, MapPin, Clock, Eye, CreditCard, Wine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MakePaymentDialog } from "@/components/companies/make-payment-dialog"
import { AddPurchaseDialog } from "@/components/companies/add-purchase-dialog"
import { PurchaseDetailModal } from "@/components/companies/purchase-detail-modal"
import type { ApiCompany, ApiPurchase } from "@/lib/types"
import { mapApiCompany, type Company } from "@/components/companies/companies-content"
import api from "@/lib/api"

function statusBadge(status: string) {
  const s = status?.toLowerCase()
  switch (s) {
    case "paid":
      return <Badge className="bg-success/10 text-success border-0">Paid</Badge>
    case "pending":
      return <Badge className="bg-destructive/10 text-destructive border-0">Pending</Badge>
    case "partial":
      return <Badge className="bg-warning/10 text-warning-foreground border-0">Partial</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function CompanyDetailsContent({ companyId }: { companyId: string }) {
  const searchParams = useSearchParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [purchases, setPurchases] = useState<ApiPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [payOpen, setPayOpen] = useState(searchParams.get("pay") === "true")
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [viewPurchase, setViewPurchase] = useState<ApiPurchase | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [compRes, purRes] = await Promise.all([
        api.get<ApiCompany>(`/companies/${companyId}`),
        api.get<ApiPurchase[]>(`/purchases?companyId=${companyId}`),
      ])
      setCompany(mapApiCompany(compRes.data))
      setPurchases(purRes.data)
    } catch {
      // company not found — will show loading state
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const pendingPurchases = purchases.filter(
    (p) => p.paymentStatus?.toLowerCase() === "pending" || p.paymentStatus?.toLowerCase() === "partial"
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-white/60 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-white/60 rounded-xl" />)}
        </div>
        <div className="h-64 bg-white/60 rounded-xl" />
      </div>
    )
  }

  if (!company) {
    return <p className="text-center py-20 text-muted-foreground">Company not found.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/companies">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
          onClick={() => setPurchaseOpen(true)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add Purchase
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-foreground">Contact Info</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{company.contactPerson || "—"}</p>
                <p className="text-xs text-muted-foreground">{company.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{company.address || "—"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Payment Terms: {company.paymentTerms} days</p>
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className={`backdrop-blur-md bg-white/80 rounded-xl shadow-lg border p-5 flex flex-col gap-4 ${company.outstanding > 0 ? "border-destructive/30" : "border-border"}`}>
          <h3 className="font-semibold text-foreground">Outstanding</h3>
          <span className={`text-3xl font-bold ${company.outstanding > 0 ? "text-destructive" : "text-success"}`}>
            ₹{company.outstanding.toLocaleString("en-IN")}
          </span>
          {company.outstanding > 0 && (
            <Button className="bg-success text-success-foreground hover:bg-success/90 mt-auto" onClick={() => setPayOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          )}
          {company.outstanding === 0 && (
            <p className="text-sm text-success mt-auto">All dues cleared</p>
          )}
        </div>

        {/* Returnables */}
        <div className={`backdrop-blur-md bg-white/80 rounded-xl shadow-lg border p-5 flex flex-col gap-4 ${company.emptiesOwed > 0 ? "border-warning/30" : "border-border"}`}>
          <div className="flex items-center gap-2">
            <Wine className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">Returnables</h3>
          </div>
          <span className="text-3xl font-bold text-warning-foreground">{company.emptiesOwed} bottles</span>
          {company.emptiesBreakdown.length > 0 ? (
            <ul className="flex flex-col gap-1 mt-auto">
              {company.emptiesBreakdown.map((item) => (
                <li key={item.productId} className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{item.productName.replace(/ RGB.*/, "")}</span>
                  <span className="font-medium text-foreground">{item.empties}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground mt-auto">No returnable products</p>
          )}
        </div>
      </div>

      {/* Purchase History Table */}
      <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="font-semibold text-lg text-foreground">Purchase History</h3>
        </div>
        <div className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Purchase ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No purchases yet
                  </TableCell>
                </TableRow>
              )}
              {purchases.map((purchase) => (
                <TableRow key={purchase.purchaseId} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="pl-4 font-medium text-foreground">{purchase.purchaseId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(purchase.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">₹{purchase.grandTotal?.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="font-medium text-foreground">₹{(purchase as unknown as { amountDue: number }).amountDue?.toLocaleString("en-IN") ?? "—"}</TableCell>
                  <TableCell>{statusBadge(purchase.paymentStatus)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setViewPurchase(purchase)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <MakePaymentDialog
        company={company}
        pendingPurchases={pendingPurchases}
        open={payOpen}
        onOpenChange={setPayOpen}
        onSaved={fetchData}
      />
      <AddPurchaseDialog
        company={company}
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        onSaved={fetchData}
      />
      <PurchaseDetailModal
        purchase={viewPurchase}
        open={!!viewPurchase}
        onOpenChange={(o) => { if (!o) setViewPurchase(null) }}
      />
    </div>
  )
}
