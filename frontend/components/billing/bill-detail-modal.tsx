"use client"

import { useRef } from "react"
import { Printer, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { ApiShopBill } from "@/lib/types"

function PaymentBadge({ mode }: { mode: string }) {
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

export function BillDetailModal({
    bill,
    open,
    onOpenChange,
}: {
    bill: ApiShopBill | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const printRef = useRef<HTMLDivElement>(null)

    if (!bill) return null

    const balance = bill.grandTotal - bill.paymentReceived

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML
        if (!printContent) return
        const win = window.open("", "_blank", "width=700,height=900")
        if (!win) return
        win.document.write(`
      <html>
        <head>
          <title>Bill ${bill.billId}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; padding: 8px 12px; background: #f4f4f4; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .right { text-align: right; }
            .total-row { font-weight: 700; font-size: 16px; }
            .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
            .badge-cash { background: #dcfce7; color: #166534; }
            .badge-upi { background: #eff6ff; color: #1e40af; }
            .badge-credit { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
        win.document.close()
        win.focus()
        setTimeout(() => { win.print(); win.close() }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
                <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {bill.billId}
                            </DialogTitle>
                            <p className="text-muted-foreground text-sm mt-1">
                                {bill.shopName}
                                {bill.routeName && <span className="ml-2">· {bill.routeName}</span>}
                                <span className="ml-2">·</span>
                                <span className="ml-2">
                                    {new Date(bill.billDate).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric"
                                    })}
                                </span>
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 gap-1.5"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </DialogHeader>

                {/* Printable content */}
                <div ref={printRef} className="px-6 pb-6 flex flex-col gap-4 overflow-y-auto flex-1 mt-4">
                    {/* Print-only header */}
                    <div className="hidden print:block mb-4">
                        <h1>Beverage Inventory System</h1>
                        <p className="meta">
                            Bill: {bill.billId} &nbsp;|&nbsp; Shop: {bill.shopName}
                            {bill.routeName && <> &nbsp;|&nbsp; Route: {bill.routeName}</>}
                            &nbsp;|&nbsp; Date: {new Date(bill.billDate).toLocaleDateString("en-IN")}
                        </p>
                    </div>

                    {/* Items table */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="pl-4">Product</TableHead>
                                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                                    <TableHead className="text-right">MRP</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right pr-4">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bill.items.map((item, i) => (
                                    <TableRow key={i} className="hover:bg-muted/30">
                                        <TableCell className="pl-4">
                                            <p className="font-medium text-foreground">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">{item.size}</p>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    item.packType === "RGB" ? "bg-success/10 text-success border-0" :
                                                        item.packType === "PET" ? "bg-primary/10 text-primary border-0" :
                                                            "bg-muted text-muted-foreground border-0"
                                                }
                                            >
                                                {item.packType}
                                                {item.isReturnable && " · R"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            ₹{item.mrp}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right pr-4 font-semibold text-foreground">
                                            ₹{(item.mrp * item.quantity).toLocaleString("en-IN")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Totals */}
                    <div className="bg-muted/30 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Items Total</span>
                            <span>₹{bill.itemsTotal?.toLocaleString("en-IN") ?? bill.grandTotal.toLocaleString("en-IN")}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold text-foreground">
                            <span>Grand Total</span>
                            <span>₹{bill.grandTotal.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    {/* Payment info */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Mode</p>
                            <PaymentBadge mode={bill.paymentMode} />
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Received</p>
                            <p className="text-base font-bold text-success">₹{bill.paymentReceived.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Balance</p>
                            <p className={`text-base font-bold ${balance > 0 ? "text-destructive" : "text-success"}`}>
                                ₹{Math.abs(balance).toLocaleString("en-IN")}
                                {balance > 0 ? " due" : balance < 0 ? " extra" : " settled"}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
