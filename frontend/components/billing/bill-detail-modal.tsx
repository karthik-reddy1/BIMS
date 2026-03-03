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
        const win = window.open("", "_blank", "width=400,height=600")
        if (!win) return

        // Build the item rows dynamically
        const itemsList = bill.items.map(item => `
            <tr class="item-row">
                <td class="name">
                    ${item.productName} ${item.size}<br/>
                    <small>${item.quantity} x ₹${item.mrp}</small>
                </td>
                <td class="right">₹${item.mrp * item.quantity}</td>
            </tr>
        `).join('')

        win.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.billId}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px; 
              color: #000; 
              margin: 0; 
              padding: 10px; 
              width: 80mm;
              line-height: 1.4;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .strong { font-weight: bold; }
            h1 { font-size: 18px; margin: 0 0 5px 0; }
            h2 { font-size: 14px; margin: 0 0 10px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { text-align: left; font-weight: normal; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            th.right { text-align: right; }
            td { vertical-align: top; padding: 5px 0; border-bottom: 1px dotted #ccc; }
            .name { padding-right: 10px; }
            .name small { color: #333; font-size: 10px; }
            .totals { width: 100%; margin-top: 10px; }
            .totals td { border: none; padding: 3px 0; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 1px dashed #000 !important; border-bottom: 1px dashed #000 !important; padding: 8px 0 !important; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>Beverage Distributor</h1>
            <p>Receipt: ${bill.billId}</p>
          </div>
          <div class="divider"></div>
          <p>
            <span class="strong">Shop:</span> ${bill.shopName}<br/>
            ${bill.routeName ? `<span class="strong">Route:</span> ${bill.routeName}<br/>` : ''}
            <span class="strong">Date:</span> ${new Date(bill.billDate).toLocaleString("en-IN", {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}<br/>
            <span class="strong">Payment:</span> ${bill.paymentMode.toUpperCase()}
          </p>
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th>Items</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td>Items Total:</td>
              <td class="right">₹${bill.itemsTotal || bill.grandTotal}</td>
            </tr>
            <tr>
              <td class="grand-total">Grand Total:</td>
              <td class="grand-total right">₹${bill.grandTotal}</td>
            </tr>
            <tr>
              <td>Paid Amount:</td>
              <td class="right">₹${bill.paymentReceived}</td>
            </tr>
            <tr>
              <td class="strong">Balance Due:</td>
              <td class="strong right">₹${balance > 0 ? balance : 0}</td>
            </tr>
          </table>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>***</p>
          </div>
        </body>
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
