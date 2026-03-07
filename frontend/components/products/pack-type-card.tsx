"use client"

import { useState } from "react"
import { Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditProductDialog } from "@/components/products/edit-product-dialog"
import { RgbVariantModal } from "@/components/products/rgb-variant-modal"
import type { ApiProduct } from "@/lib/types"
import api from "@/lib/api"

const PACK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    RGB: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
    PET: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
    CAN: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    TTP: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    MTP: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
}

function stockColor(bottles: number) {
    if (bottles > 100) return "bg-success"
    if (bottles >= 40) return "bg-warning"
    return "bg-destructive"
}
function stockTextColor(bottles: number) {
    if (bottles > 100) return "text-success"
    if (bottles >= 40) return "text-warning"
    return "text-destructive"
}

export function PackTypeCard({
    packType,
    products,
    onRefresh,
}: {
    packType: string
    products: ApiProduct[]
    onRefresh: () => void
}) {
    const [editProduct, setEditProduct] = useState<ApiProduct | null>(null)
    const [rgbProduct, setRgbProduct] = useState<ApiProduct | null>(null)
    const [deleteProduct, setDeleteProduct] = useState<ApiProduct | null>(null)
    const [deleting, setDeleting] = useState(false)
    const isRgb = packType === "RGB"
    const colors = PACK_COLORS[packType] ?? { bg: "bg-muted", text: "text-foreground", border: "border-border" }

    const handleDelete = async () => {
        if (!deleteProduct) return
        try {
            setDeleting(true)
            await api.delete(`/products/${deleteProduct.productId}`)
            setDeleteProduct(null)
            onRefresh()
        } catch {
            // keep dialog open on error
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5 flex flex-col gap-3`}>
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${colors.bg} ${colors.text} border-0 font-bold text-sm px-3 py-1`}>
                        {packType}
                    </Badge>
                    {isRgb && (
                        <Badge variant="secondary" className="bg-success/10 text-success border-0 text-xs">
                            Returnable
                        </Badge>
                    )}
                </div>

                {/* Variant rows */}
                <div className="flex flex-col gap-2">
                    {products.map((p) => {
                        const pct = Math.min((p.filledStock.totalBottles / (p.bottlesPerCase * 100)) * 100, 100)
                        return (
                            <div
                                key={p.productId}
                                className="bg-white/70 rounded-lg px-3 py-2.5 flex flex-col gap-1.5 border border-border/50"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-foreground">{p.size}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-xs font-medium ${stockTextColor(p.filledStock.totalBottles)}`}>
                                            {p.filledStock.cases > 0 && p.filledStock.looseBottles > 0
                                                ? `${p.filledStock.cases}C + ${p.filledStock.looseBottles}B`
                                                : p.filledStock.cases > 0 ? `${p.filledStock.cases}C`
                                                    : `${p.filledStock.looseBottles}B`}
                                        </span>

                                        {/* RGB: "Details" button */}
                                        {isRgb && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs px-2 border-success/40 text-success hover:bg-success/10"
                                                onClick={() => setRgbProduct(p)}
                                            >
                                                Details
                                            </Button>
                                        )}

                                        {/* Edit */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditProduct(p)}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>

                                        {/* Delete */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeleteProduct(p)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Stock bar */}
                                <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full ${stockColor(p.filledStock.totalBottles)} transition-all`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Edit dialog */}
            {editProduct && (
                <EditProductDialog
                    product={editProduct}
                    open={!!editProduct}
                    onOpenChange={(o: boolean) => { if (!o) setEditProduct(null) }}
                    onSaved={() => { setEditProduct(null); onRefresh() }}
                />
            )}

            {/* RGB detail modal */}
            {isRgb && rgbProduct && (
                <RgbVariantModal
                    product={rgbProduct}
                    open={!!rgbProduct}
                    onOpenChange={(o: boolean) => { if (!o) setRgbProduct(null) }}
                    onRefresh={() => { setRgbProduct(null); onRefresh() }}
                />
            )}

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteProduct} onOpenChange={(o) => { if (!o) setDeleteProduct(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteProduct?.productName} {deleteProduct?.size}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this product variant. Any past bills or purchases that reference it
                            will still exist but may show missing product names. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
