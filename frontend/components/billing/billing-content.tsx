"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Eye, Printer } from "lucide-react"
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
import { CreateBillDialog } from "@/components/billing/create-bill-dialog"
import api from "@/lib/api"
import type { ApiShopBill } from "@/lib/types"

function paymentBadge(mode: string) {
  switch (mode?.toLowerCase()) {
    case "cash":
      return <Badge className="bg-success/10 text-success border-0">Cash</Badge>
    case "credit":
      return <Badge className="bg-destructive/10 text-destructive border-0">Credit</Badge>
    case "upi":
      return <Badge className="bg-primary/10 text-primary border-0">UPI</Badge>
    default:
      return <Badge variant="secondary">{mode}</Badge>
  }
}

export function BillingContent() {
  const [bills, setBills] = useState<ApiShopBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<ApiShopBill[]>("/bills")
      setBills(res.data)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bills")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBills() }, [fetchBills])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Shop Bills</h1>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Bill
        </Button>
      </div>

      <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Bill ID</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead className="hidden sm:table-cell">Route</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Loading bills…
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-destructive">{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No bills yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && bills.map((bill) => (
              <TableRow key={bill.billId} className="hover:bg-muted/50 transition-colors">
                <TableCell className="pl-6 font-medium text-foreground">{bill.billId}</TableCell>
                <TableCell className="text-foreground">{bill.shopName}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {bill.routeName || "Walk-in"}
                </TableCell>
                <TableCell className="text-foreground font-medium">
                  ₹{bill.grandTotal?.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {new Date(bill.billDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {paymentBadge(bill.paymentMode)}
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                      <Printer className="h-4 w-4" />
                      <span className="sr-only">Print</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateBillDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={fetchBills} />
    </>
  )
}
