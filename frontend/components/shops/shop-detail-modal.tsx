"use client"

import { useState, useEffect } from "react"
import { Building2, X, MapPin, Phone, Route, Receipt, TextSelect, IndianRupee, HandCoins } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BillDetailModal } from "@/components/billing/bill-detail-modal"
import api from "@/lib/api"
import type { ApiShop, ApiShopBill, ApiProduct } from "@/lib/types"

interface ShopDetailModalProps {
    shop: ApiShop | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onPaymentComplete?: () => void
}

export function ShopDetailModal({ shop, open, onOpenChange, onPaymentComplete }: ShopDetailModalProps) {
    const [bills, setBills] = useState<ApiShopBill[]>([])
    const [loading, setLoading] = useState(true)
    const [productsMap, setProductsMap] = useState<Record<string, ApiProduct>>({})
    const [viewBill, setViewBill] = useState<ApiShopBill | null>(null)

    // Manual payment state
    const [isPaying, setIsPaying] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [submittingPayment, setSubmittingPayment] = useState(false)

    useEffect(() => {
        if (open && shop) {
            setLoading(true)
            Promise.all([
                api.get<ApiShopBill[]>(`/bills/shop/${shop.shopId}`),
                api.get<ApiProduct[]>("/products")
            ])
                .then(([billsRes, productsRes]) => {
                    setBills(billsRes.data)
                    const pMap: Record<string, ApiProduct> = {}
                    productsRes.data.forEach(p => pMap[p.productId] = p)
                    setProductsMap(pMap)
                })
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setBills([])
            setProductsMap({})
            setViewBill(null)
        }
    }, [open, shop])

    if (!shop) return null

    const owedEmpties = shop.returnableProducts?.filter(r => r.emptiesOwed > 0) || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border overflow-hidden">
                <DialogHeader className="p-6 pb-0 flex-shrink-0 relative">
                    <div className="flex items-start gap-4 pr-8">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">{shop.shopName}</DialogTitle>
                            <p className="text-muted-foreground">{shop.shopId}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-6">
                        {shop.phone && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-white/50 border-border">
                                <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> {shop.phone}
                            </Badge>
                        )}
                        {shop.routeName && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-white/50 border-border">
                                <Route className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> {shop.routeName}
                            </Badge>
                        )}
                        {shop.address && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-white/50 border-border">
                                <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> {shop.address}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-8 overflow-y-auto flex-1">
                    {/* Top Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${shop.outstandingAmount > 0 ? "bg-destructive/10 border-destructive/20" : "bg-success/10 border-success/20"}`}>
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Outstanding</h3>
                                <div className={`text-4xl font-bold ${shop.outstandingAmount > 0 ? "text-destructive" : "text-success"}`}>
                                    ₹{shop.outstandingAmount?.toLocaleString("en-IN") || 0}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">To be collected via route bills</p>
                            </div>

                            {shop.outstandingAmount > 0 && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    {!isPaying ? (
                                        <Button
                                            variant="outline"
                                            className="w-full bg-white/50 hover:bg-white"
                                            onClick={() => setIsPaying(true)}
                                        >
                                            <HandCoins className="h-4 w-4 mr-2" />
                                            Record Manual Payment
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={paymentAmount}
                                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                                        className="pl-9 bg-white"
                                                    />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setIsPaying(false)
                                                        setPaymentAmount("")
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Button
                                                className="w-full"
                                                disabled={submittingPayment || !paymentAmount}
                                                onClick={async () => {
                                                    try {
                                                        setSubmittingPayment(true)
                                                        await api.post(`/shops/${shop.shopId}/payment`, { amount: parseFloat(paymentAmount) })
                                                        setPaymentAmount("")
                                                        setIsPaying(false)
                                                        if (onPaymentComplete) onPaymentComplete()
                                                    } catch (err) {
                                                        console.error(err)
                                                    } finally {
                                                        setSubmittingPayment(false)
                                                    }
                                                }}
                                            >
                                                {submittingPayment ? "Saving..." : "Confirm Payment"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-5 rounded-2xl border bg-muted/30 border-border">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Variant Debts (Empties)
                            </h3>
                            <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-2">
                                {owedEmpties.length > 0 ? (
                                    owedEmpties.map(ret => (
                                        <div key={ret.productId} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                            <span className="font-medium">{ret.productName}</span>
                                            <span className="font-bold bg-secondary/30 px-2 py-0.5 rounded-md">{ret.emptiesOwed}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No empties owed.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bill History */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Receipt className="h-5 w-5" /> Recent Bill History
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : bills.length === 0 ? (
                            <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-xl">
                                <TextSelect className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-3" />
                                <p className="text-muted-foreground">No bills recorded for this shop yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {bills.map(bill => (
                                    <div key={bill.billId} className="flex flex-col sm:flex-row gap-4 justify-between bg-muted/30 p-4 rounded-xl border border-border">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground">{bill.billId}</span>
                                                <Badge variant="outline" className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                    {new Date(bill.billDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-primary ml-2"
                                                    onClick={() => setViewBill(bill)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                                                </Button>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {bill.items.map(item => {
                                                    const product = productsMap[item.productId]
                                                    const bpc = product?.bottlesPerCase || 1
                                                    const cases = Math.floor(item.quantity / bpc)
                                                    const loose = item.quantity % bpc
                                                    const qtyText = cases > 0 && loose > 0 ? `${cases} cs, ${loose} btls` : cases > 0 ? `${cases} cs` : `${loose} btls`
                                                    return `${qtyText} ${item.productName}`
                                                }).join(", ")}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-1">
                                            <div className="text-lg font-bold text-foreground">
                                                ₹{bill.grandTotal?.toLocaleString("en-IN")}
                                            </div>
                                            <div className="text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded">
                                                {bill.paymentMode}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>

            {/* Bill Detail Modal */}
            {viewBill && (
                <BillDetailModal
                    bill={viewBill}
                    open={!!viewBill}
                    onOpenChange={(o) => { if (!o) setViewBill(null) }}
                    onBillUpdate={() => {
                        fetchShopDetails(shop.shopId)
                        setViewBill(null)
                    }}
                />
            )}
        </Dialog>
    )
}
