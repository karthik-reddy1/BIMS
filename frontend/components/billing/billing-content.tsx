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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateBillDialog } from "@/components/billing/create-bill-dialog"
import { BillDetailModal, printBill } from "@/components/billing/bill-detail-modal"
import api from "@/lib/api"
import type { ApiShopBill, ApiRoute } from "@/lib/types"

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
  const [routes, setRoutes] = useState<ApiRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewBill, setViewBill] = useState<ApiShopBill | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [routeId, setRouteId] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (routeId !== "all") params.append("route", routeId)
      if (dateFrom) params.append("from", dateFrom)
      if (dateTo) params.append("to", dateTo)

      const [billsRes, routesRes] = await Promise.all([
        api.get<ApiShopBill[]>(`/bills?${params.toString()}`),
        api.get<ApiRoute[]>("/routes")
      ])

      setBills(billsRes.data)
      setRoutes(routesRes.data)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [routeId, dateFrom, dateTo])

  useEffect(() => { fetchBills() }, [fetchBills])

  const filteredBills = bills.filter(b =>
    b.billId.toLowerCase().includes(search.toLowerCase()) ||
    b.shopName.toLowerCase().includes(search.toLowerCase()) ||
    (b.routeName && b.routeName.toLowerCase().includes(search.toLowerCase()))
  )

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

      <div className="flex flex-col sm:flex-row gap-4 bg-white/80 p-4 rounded-xl border border-border mt-2 shadow-sm">
        <Input
          placeholder="Search by Bill ID, Shop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-white"
        />
        <Select value={routeId} onValueChange={setRouteId}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="All Routes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            {routes.map(r => (
              <SelectItem key={r.routeId} value={r.routeId}>{r.routeName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px] bg-white text-sm"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px] bg-white text-sm"
          />
          {(dateFrom || dateTo || routeId !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => {
              setDateFrom(""); setDateTo(""); setRouteId("all"); setSearch("");
            }}>Clear</Button>
          )}
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border overflow-hidden mt-6">
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
                  No bills yet matching filters.
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && filteredBills.map((bill) => (
              <TableRow
                key={bill._id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setViewBill(bill)}
              >
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
                    {/* Eye — opens bill detail modal */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setViewBill(bill)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    {/* Print — triggers print directly */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => printBill(bill)}
                    >
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

      <BillDetailModal
        bill={viewBill}
        open={!!viewBill}
        onOpenChange={(o) => { if (!o) setViewBill(null) }}
        onBillUpdate={() => {
          fetchBills();
          setViewBill(null); // Close modal down so they see the table updated
        }}
      />
    </>
  )
}
