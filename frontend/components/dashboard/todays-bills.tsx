"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import api from "@/lib/api"
import type { ApiShopBill } from "@/lib/types"

export function TodaysBills() {
  const [bills, setBills] = useState<ApiShopBill[]>([])
  const [totalSales, setTotalSales] = useState(0)

  useEffect(() => {
    // Fetch all bills and filter down to exactly today's date
    const today = new Date().setHours(0, 0, 0, 0)

    api.get<ApiShopBill[]>("/bills").then((res) => {
      const todaysBills = res.data.filter(bill => {
        const billDate = new Date(bill.billDate).setHours(0, 0, 0, 0)
        return billDate === today
      })

      setBills(todaysBills)
      setTotalSales(todaysBills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0))
    }).catch(() => { })
  }, [])

  // Reusable function to render the table content
  const renderTableContent = (displayBills: ApiShopBill[], isModal = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-6">Bill ID</TableHead>
          <TableHead>Shop</TableHead>
          <TableHead className="text-right pr-6">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayBills.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
              No bills generated today
            </TableCell>
          </TableRow>
        )}
        {displayBills.map((bill) => (
          <TableRow key={bill.billId} className="hover:bg-muted/50 transition-colors">
            <TableCell className="pl-6 font-medium text-foreground">{bill.billId}</TableCell>
            <TableCell className="text-foreground">{bill.shopName}</TableCell>
            <TableCell className="text-right text-foreground font-medium pr-6">
              ₹{bill.grandTotal?.toLocaleString("en-IN")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {displayBills.length > 0 && (
        <TableFooter className="bg-primary/5 font-semibold">
          <TableRow>
            <TableCell colSpan={2} className="pl-6">Total Sales Today</TableCell>
            <TableCell className="text-right text-primary pr-6">
              ₹{totalSales.toLocaleString("en-IN")}
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )

  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Today's Bills</h2>

        <Dialog>
          <DialogTrigger className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View All ({bills.length})
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="pt-6 px-6 pb-4 border-b border-border">
              <DialogTitle className="text-xl">All Bills for Today</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 p-2">
              {renderTableContent(bills, true)}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Show max 4 bills on the dashboard widget so it doesn't get too tall */}
        {renderTableContent(bills.slice(0, 4))}
      </div>
    </div>
  )
}
