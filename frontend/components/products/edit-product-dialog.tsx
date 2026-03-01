"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import api from "@/lib/api"
import type { Product } from "@/components/products/products-grid"

export function EditProductDialog({
    product,
    open,
    onOpenChange,
    onSaved,
}: {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved?: () => void
}) {
    const [mrp, setMrp] = useState("")
    const [casePrice, setCasePrice] = useState("")
    const [bottlesPerCase, setBottlesPerCase] = useState("")
    const [filledCases, setFilledCases] = useState("")
    const [filledLoose, setFilledLoose] = useState("")
    const [emptyGood, setEmptyGood] = useState("")
    const [emptyBroken, setEmptyBroken] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Prefill when product changes
    useEffect(() => {
        if (!product) return
        setMrp(String(product.mrp))
        setCasePrice(String(product.perCase))
        setBottlesPerCase(String(product.bottlesPerCase))
        setFilledCases(String(product.filledCases ?? ""))
        setFilledLoose(String(product.filledLoose ?? ""))
        setEmptyGood(String(product.empties?.good ?? ""))
        setEmptyBroken(String(product.empties?.broken ?? ""))
        setError(null)
    }, [product])

    const handleSave = async () => {
        if (!product) return
        try {
            setSaving(true)
            setError(null)

            const body: Record<string, unknown> = {
                mrp: Number(mrp),
                casePrice: Number(casePrice),
                bottlesPerCase: Number(bottlesPerCase),
                perBottlePrice: Number(casePrice) / Number(bottlesPerCase),
            }

            // Only send stock update if user entered values
            if (filledCases !== "" || filledLoose !== "") {
                body.filledStock = {
                    cases: Number(filledCases) || 0,
                    looseBottles: Number(filledLoose) || 0,
                }
            }
            if (emptyGood !== "" || emptyBroken !== "") {
                body.emptyStock = {
                    good: Number(emptyGood) || 0,
                    broken: Number(emptyBroken) || 0,
                }
            }

            // productId comes from the product name mapped in products-grid
            // We need the raw API productId — it's embedded in the product name via mapApiProduct
            // The products-grid maps: name = productName, and the card doesn't have productId directly.
            // We store productId via a workaround: pass it through the product type extension below.
            await api.put(`/products/${product.productId}`, body)
            onSaved?.()
            onOpenChange(false)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">
                        Edit {product?.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-6 flex flex-col gap-4">
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
                    )}

                    {/* Pricing */}
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pricing</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">MRP</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                    <Input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} className="pl-7 bg-white/80 border-border" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Case Price</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                    <Input type="number" value={casePrice} onChange={(e) => setCasePrice(e.target.value)} className="pl-7 bg-white/80 border-border" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Btl/Case</Label>
                                <Input type="number" value={bottlesPerCase} onChange={(e) => setBottlesPerCase(e.target.value)} className="bg-white/80 border-border" />
                            </div>
                        </div>
                    </div>

                    {/* Filled Stock Override */}
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Set Filled Stock</p>
                        <p className="text-xs text-muted-foreground mb-3">Leave blank to keep current stock unchanged</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Cases</Label>
                                <Input type="number" value={filledCases} onChange={(e) => setFilledCases(e.target.value)} placeholder={`current: ${Math.floor(product?.stock ?? 0 / (product?.bottlesPerCase ?? 24))} cases`} className="bg-white/80 border-border" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Loose Bottles</Label>
                                <Input type="number" value={filledLoose} onChange={(e) => setFilledLoose(e.target.value)} placeholder="0" className="bg-white/80 border-border" />
                            </div>
                        </div>
                    </div>

                    {/* Empty Stock — only for returnables */}
                    {product?.returnable && (
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Set Empty Stock</p>
                            <p className="text-xs text-muted-foreground mb-3">Leave blank to keep current empties unchanged</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-foreground">Good Empties</Label>
                                    <Input type="number" value={emptyGood} onChange={(e) => setEmptyGood(e.target.value)} placeholder="0" className="bg-white/80 border-border" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-foreground">Broken Empties</Label>
                                    <Input type="number" value={emptyBroken} onChange={(e) => setEmptyBroken(e.target.value)} placeholder="0" className="bg-white/80 border-border" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {saving ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
