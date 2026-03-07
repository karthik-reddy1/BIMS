"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { ApiPurchase } from "@/lib/types"

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

export function PurchaseDetailModal({
    purchase,
    open,
    onOpenChange,
}: {
    purchase: ApiPurchase | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    if (!purchase) return null

    const emptiesReturned = (purchase as unknown as {
        emptiesReturned?: {
            productId: string
            productName: string
            goodBottles: number
            brokenBottles: number
            totalReturned: number
        }[]
    }).emptiesReturned ?? []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl w-[95vw] backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border overflow-hidden max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 pb-0 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {purchase.purchaseId}
                        </DialogTitle>
                        {statusBadge(purchase.paymentStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {new Date(purchase.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        {" · "}
                        {purchase.companyName}
                    </p>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">

                    {/* Items purchased */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items Purchased</p>
                        <div className="flex flex-col gap-2">
                            {purchase.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2.5 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{item.productName}</span>
                                        <span className="text-xs text-muted-foreground">{item.packType} · {item.cases} cases × {item.bottlesPerCase} btl = {item.totalBottles} bottles</span>
                                    </div>
                                    <span className="font-semibold text-foreground">₹{item.itemTotal?.toLocaleString("en-IN")}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Empties returned */}
                    {emptiesReturned.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Empties Returned to Company</p>
                            <div className="flex flex-col gap-2">
                                {emptiesReturned.map((e, i) => (
                                    <div key={i} className="flex items-center justify-between bg-success/5 border border-success/20 rounded-lg px-4 py-2.5 text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{e.productName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {e.goodBottles} good + {e.brokenBottles} broken = {e.totalReturned} total
                                            </span>
                                        </div>
                                        {e.brokenBottles > 0 && (
                                            <span className="text-xs font-medium text-destructive">
                                                +₹{(e.brokenBottles * 3).toLocaleString("en-IN")} penalty
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Bill summary */}
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Product Total</span>
                            <span>₹{purchase.productTotal?.toLocaleString("en-IN")}</span>
                        </div>
                        {(purchase.transportBill ?? 0) > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>Transport</span>
                                <span>₹{purchase.transportBill?.toLocaleString("en-IN")}</span>
                            </div>
                        )}
                        {(purchase as unknown as { brokenBottlePenalty?: number }).brokenBottlePenalty ? (
                            <div className="flex justify-between text-destructive">
                                <span>Broken Bottle Penalty</span>
                                <span>₹{(purchase as unknown as { brokenBottlePenalty: number }).brokenBottlePenalty?.toLocaleString("en-IN")}</span>
                            </div>
                        ) : null}
                        <Separator />
                        <div className="flex justify-between font-bold text-base text-foreground">
                            <span>Grand Total</span>
                            <span>₹{purchase.grandTotal?.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Amount Paid</span>
                            <span className="text-success font-medium">₹{(purchase as unknown as { amountPaid: number }).amountPaid?.toLocaleString("en-IN") ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Amount Due</span>
                            <span className="text-destructive font-medium">₹{(purchase as unknown as { amountDue: number }).amountDue?.toLocaleString("en-IN") ?? 0}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
