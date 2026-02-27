"use client"

import { useState } from "react"
import { Plus, Eye, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateBillDialog } from "@/components/billing/create-bill-dialog"

const bills = [
  { id: "BILL-001", shop: "Sai Traders", route: "Route A", amount: "\u20B9960", date: "26 Feb 2026", status: "paid" },
  { id: "BILL-002", shop: "Kumar Stores", route: "Route A", amount: "\u20B9480", date: "26 Feb 2026", status: "paid" },
  { id: "BILL-003", shop: "Ravi Shop", route: "Route B", amount: "\u20B91,200", date: "25 Feb 2026", status: "credit" },
  { id: "BILL-004", shop: "Lakshmi Mart", route: "Route B", amount: "\u20B9720", date: "25 Feb 2026", status: "paid" },
  { id: "BILL-005", shop: "Ganesh Store", route: "Route C", amount: "\u20B9360", date: "25 Feb 2026", status: "paid" },
  { id: "BILL-006", shop: "Sai Traders", route: "Route A", amount: "\u20B91,440", date: "24 Feb 2026", status: "paid" },
  { id: "BILL-007", shop: "Priya Store", route: "Walk-in", amount: "\u20B9240", date: "24 Feb 2026", status: "credit" },
  { id: "BILL-008", shop: "Kumar Stores", route: "Route A", amount: "\u20B9600", date: "23 Feb 2026", status: "paid" },
  { id: "BILL-009", shop: "Ravi Shop", route: "Route B", amount: "\u20B9840", date: "23 Feb 2026", status: "paid" },
  { id: "BILL-010", shop: "Lakshmi Mart", route: "Route B", amount: "\u20B9480", date: "22 Feb 2026", status: "paid" },
]

export function BillingContent() {
  const [dialogOpen, setDialogOpen] = useState(false)

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
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="pl-6 font-medium text-foreground">{bill.id}</TableCell>
                <TableCell className="text-foreground">{bill.shop}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{bill.route}</TableCell>
                <TableCell className="text-foreground font-medium">{bill.amount}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{bill.date}</TableCell>
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

      <CreateBillDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
