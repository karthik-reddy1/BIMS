"use client"

import { format } from "date-fns"
import { useRef, useState, useEffect } from "react"
import { Printer, X, CheckCircle2, Wallet, User, Calendar, Receipt, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { ApiShopBill, ApiRoute } from "@/lib/types"

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

export function printBill(bill: ApiShopBill) {
    const balance = bill.grandTotal - bill.paymentReceived

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
              font-size: 13px; 
              color: #000; 
              margin: 0; 
              padding: 20px; 
              width: 80mm;
              line-height: 1.6;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .strong { font-weight: bold; }
            h1 { font-size: 20px; margin: 0 0 10px 0; }
            h2 { font-size: 16px; margin: 0 0 15px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { text-align: left; font-weight: normal; border-bottom: 1px dashed #000; padding-bottom: 8px; font-size: 14px;}
            th.right { text-align: right; }
            td { vertical-align: top; padding: 10px 0; border-bottom: 1px dotted #ccc; }
            .name { padding-right: 15px; }
            .name small { color: #333; font-size: 11px; }
            .totals { width: 100%; margin-top: 20px; }
            .totals td { border: none; padding: 6px 0; font-size: 14px;}
            .grand-total { font-size: 18px; font-weight: bold; border-top: 1px dashed #000 !important; border-bottom: 1px dashed #000 !important; padding: 12px 0 !important; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>VS enterprises</h1>
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
    setTimeout(() => { win.print() }, 300)
}

export function BillDetailModal({
    bill: initialBill,
    open,
    onOpenChange,
    onBillUpdate
}: {
    bill: ApiShopBill | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onBillUpdate?: () => void
}) {
    const printRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()
    const [localBill, setLocalBill] = useState<ApiShopBill | null>(initialBill)
    const [isEditingRoute, setIsEditingRoute] = useState(false)
    const [routes, setRoutes] = useState<ApiRoute[]>([])
    const [updatingRoute, setUpdatingRoute] = useState(false)

    useEffect(() => {
        setLocalBill(initialBill)
    }, [initialBill])

    useEffect(() => {
        if (open && isEditingRoute && routes.length === 0) {
            api.get<ApiRoute[]>("/routes").then(res => setRoutes(res.data)).catch(console.error)
        }
    }, [open, isEditingRoute, routes.length])

    if (!localBill) return null

    const handleRouteUpdate = async (routeId: string) => {
        try {
            setUpdatingRoute(true)
            const res = await api.patch<{ data: ApiShopBill }>(`/bills/${localBill.billId}/route`, { routeId })
            setLocalBill(res.data.data) // Assuming sendSuccess structure { success: true, data: ... }
            setIsEditingRoute(false)
            if (onBillUpdate) onBillUpdate()
        } catch (err: any) {
            console.error(err)
            toast({
                title: "Failed to update route",
                description: err.response?.data?.message || err.message || "An unknown error occurred",
                variant: "destructive"
            })
        } finally {
            setUpdatingRoute(false)
        }
    }

    const balance = localBill.grandTotal - localBill.paymentReceived

    const handlePrint = () => printBill(localBill)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
                <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {localBill.billId}
                            </DialogTitle>
                            <div className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                                <span>{localBill.shopName}</span>

                                <span className="text-muted-foreground/50">·</span>

                                {isEditingRoute ? (
                                    <div className="flex items-center gap-2">
                                        <Select onValueChange={handleRouteUpdate} disabled={updatingRoute}>
                                            <SelectTrigger className="h-7 text-xs w-[140px] bg-white">
                                                <SelectValue placeholder="Select Route" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {routes.map(r => (
                                                    <SelectItem key={r.routeId} value={r.routeId}>
                                                        {r.routeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingRoute(false)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : localBill.isLocked ? (
                                    <div className="flex items-center gap-1 text-muted-foreground" title="Cannot change route. This bill has already been processed in a Route Bill.">
                                        <span>{localBill.routeName || "No Route"}</span>
                                        <Lock className="h-3 w-3" />
                                    </div>
                                ) : (
                                    <span
                                        className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1"
                                        onClick={() => setIsEditingRoute(true)}
                                    >
                                        {localBill.routeName || "No Route"}
                                    </span>
                                )}

                                <span className="text-muted-foreground/50">·</span>

                                <span>{format(new Date(localBill.billDate), "d MMMM yyyy")}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
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
                    </div>
                </DialogHeader>

                {/* Printable content */}
                <div ref={printRef} className="px-6 pb-6 flex flex-col gap-4 overflow-y-auto flex-1 mt-4">
                    {/* Print-only header */}
                    <div className="hidden print:block mb-4">
                        <h1>Beverage Inventory System</h1>
                        <p className="meta">
                            Bill: {localBill.billId} &nbsp;|&nbsp; Shop: {localBill.shopName}
                            {localBill.routeName && <> &nbsp;|&nbsp; Route: {localBill.routeName}</>}
                            &nbsp;|&nbsp; Date: {new Date(localBill.billDate).toLocaleDateString("en-IN")}
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
                                {localBill.items.map((item, i) => (
                                    <TableRow key={i} className="hover:bg-muted/30">
                                        <TableCell className="pl-4">
                                            <p className="font-medium text-foreground">{item.productName}</p>
                                            {item.size && <p className="text-xs text-muted-foreground">{item.size}</p>}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge
                                                variant="secondary"
                                                className={`bg-${item.packType?.toLowerCase()}/10 text-${item.packType?.toLowerCase()} border-${item.packType?.toLowerCase()}/20 text-[10px]`}
                                            >
                                                {item.packType} {item.isReturnable && "- R"}
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
                            <span className="text-muted-foreground">Items Total</span>
                            <span className="font-semibold text-muted-foreground">₹{localBill.items.reduce((s, i) => s + (i.mrp * i.quantity), 0).toLocaleString("en-IN")}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-foreground">Grand Total</span>
                            <span className="font-bold text-foreground">₹{localBill.grandTotal?.toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    {/* Payment info */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="p-4 bg-muted/30 border-none">
                            <div className="text-xs font-semibold text-muted-foreground tracking-wider mb-2 uppercase">Payment Mode</div>
                            <PaymentBadge mode={localBill.paymentMode} />
                        </Card>
                        <Card className="p-4 bg-success/5 border-none">
                            <div className="text-xs font-semibold text-muted-foreground tracking-wider mb-2 uppercase">Received</div>
                            <div className="text-xl font-bold text-success">₹{localBill.paymentReceived?.toLocaleString("en-IN")}</div>
                        </Card>
                        <Card className="p-4 bg-muted/30 border-none">
                            <div className="text-xs font-semibold text-muted-foreground tracking-wider mb-2 uppercase">Balance</div>
                            <div className={`text-xl font-bold ${balance > 0 ? "text-destructive" : "text-foreground"}`}>
                                {balance > 0 ? `₹${balance.toLocaleString("en-IN")} due` : "Settled"}
                            </div>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
