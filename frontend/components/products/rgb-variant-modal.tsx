"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { EditProductDialog } from "@/components/products/edit-product-dialog"
import type { ApiProduct } from "@/lib/types"

export function RgbVariantModal({
    product,
    open,
    onOpenChange,
    onRefresh,
}: {
    product: ApiProduct
    open: boolean
    onOpenChange: (o: boolean) => void
    onRefresh?: () => void
}) {
    const [editOpen, setEditOpen] = useState(false)

    const { filledStock, emptyStock, returnableAccounts } = product
    const shortage = returnableAccounts.companyOwed - (emptyStock.good + returnableAccounts.shopsOwed)

    const StatRow = ({ label, value, color }: { label: string; value: number | string; color?: string }) => (
        <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-semibold ${color ?? "text-foreground"}`}>{value}</span>
        </div>
    )

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md w-[95vw] backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border flex flex-col max-h-[90vh]">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-success/10 text-success border-0">RGB</Badge>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {product.productName} — {product.size}
                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="px-6 pb-6 flex flex-col gap-4 overflow-y-auto">

                        {/* Filled stock */}
                        <div className="bg-muted/40 rounded-xl p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Filled Stock</p>
                            <StatRow label="Cases" value={filledStock.cases} />
                            <StatRow label="Loose Bottles" value={filledStock.looseBottles} />
                            <StatRow
                                label="Total Bottles"
                                value={filledStock.totalBottles}
                                color={filledStock.totalBottles > 100 ? "text-success" : filledStock.totalBottles > 40 ? "text-warning" : "text-destructive"}
                            />
                        </div>

                        {/* Empties in warehouse */}
                        <div className="bg-muted/40 rounded-xl p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Empties in Warehouse</p>
                            <StatRow label="Good Empties" value={emptyStock.good} color="text-success" />
                            <StatRow label="Broken Empties" value={emptyStock.broken} color="text-destructive" />
                            <StatRow label="Total Empties" value={emptyStock.total} />
                        </div>

                        {/* Returnable accounts */}
                        <div className="bg-muted/40 rounded-xl p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Returnable Accounts</p>
                            <StatRow label="Owe to Company" value={`${returnableAccounts.companyOwed} bottles`} color="text-warning-foreground" />
                            <StatRow label="Shops Owe Us" value={`${returnableAccounts.shopsOwed} bottles`} color="text-primary" />
                        </div>

                        {/* Net shortage/surplus */}
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">
                                {shortage > 0 ? "Shortage" : shortage < 0 ? "Surplus" : "Balanced"}
                            </span>
                            <span className={`text-lg font-bold ${shortage > 0 ? "text-destructive" : shortage < 0 ? "text-success" : "text-foreground"}`}>
                                {Math.abs(shortage)} bottles
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-3">
                            = Owe to Company − (Good Empties + Shops Owe Us)
                        </p>

                        {/* Pricing */}
                        <div className="bg-muted/40 rounded-xl p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pricing</p>
                            <StatRow label="MRP" value={`₹${product.mrp}`} />
                            <StatRow label="Case Price" value={`₹${product.casePrice}`} />
                            <StatRow label="Per Bottle" value={`₹${product.perBottlePrice.toFixed(2)}`} />
                            <StatRow label="Bottles/Case" value={product.bottlesPerCase} />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setEditOpen(true)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Edit This Variant
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <EditProductDialog
                product={product}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSaved={() => { setEditOpen(false); onRefresh?.() }}
            />
        </>
    )
}
