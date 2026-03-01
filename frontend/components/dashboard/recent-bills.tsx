"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"
import type { ApiShopBill } from "@/lib/types"

export function RecentBills() {
  const [bills, setBills] = useState<ApiShopBill[]>([])

  useEffect(() => {
    api.get<ApiShopBill[]>("/bills").then((res) => {
      setBills(res.data.slice(0, 5))
    }).catch(() => { })
  }, [])

  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Bills</h2>
        <Link href="/billing" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View All
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Bill ID</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="pr-6">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                No bills yet
              </TableCell>
            </TableRow>
          )}
          {bills.map((bill) => (
            <TableRow key={bill.billId} className="hover:bg-muted/50 transition-colors">
              <TableCell className="pl-6 font-medium text-foreground">{bill.billId}</TableCell>
              <TableCell className="text-foreground">{bill.shopName}</TableCell>
              <TableCell className="text-foreground font-medium">
                ₹{bill.grandTotal?.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="pr-6 text-muted-foreground">
                {new Date(bill.billDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
