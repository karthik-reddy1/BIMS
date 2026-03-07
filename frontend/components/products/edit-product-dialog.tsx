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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import type { ApiProduct, ApiCompany } from "@/lib/types"

// EditProductDialog now accepts ApiProduct directly
// (converted from the old Product UI type that came from products-grid)
export function EditProductDialog({
    product,
    open,
    onOpenChange,
    onSaved,
}: {
    product: ApiProduct | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved?: () => void
}) {
    const [productName, setProductName] = useState("")
    const [newGroupMode, setNewGroupMode] = useState(false)
    const [existingGroups, setExistingGroups] = useState<string[]>([])
    const [existingCompanies, setExistingCompanies] = useState<ApiCompany[]>([])
    const [brand, setBrand] = useState("")
    const [mrp, setMrp] = useState("")
    const [casePrice, setCasePrice] = useState("")
    const [bottlesPerCase, setBottlesPerCase] = useState("")
    const [filledCases, setFilledCases] = useState("")
    const [filledLoose, setFilledLoose] = useState("")
    const [emptyGoodCases, setEmptyGoodCases] = useState("")
    const [emptyGoodLoose, setEmptyGoodLoose] = useState("")
    const [emptyBroken, setEmptyBroken] = useState("")
    const [brokenPrice, setBrokenPrice] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Prefill when product changes
    useEffect(() => {
        if (!product) return
        setProductName(product.productName || "")
        setNewGroupMode(false)
        setBrand(product.brand || "")
        setMrp(String(product.mrp ?? ""))
        setCasePrice(String(product.casePrice ?? ""))
        setBottlesPerCase(String(product.bottlesPerCase ?? ""))
        setFilledCases(String(product.filledStock?.cases ?? 0))
        setFilledLoose(String(product.filledStock?.looseBottles ?? 0))

        const bpc = product.bottlesPerCase || 1
        const totalGood = product.emptyStock?.good ?? 0
        setEmptyGoodCases(String(Math.floor(totalGood / bpc)))
        setEmptyGoodLoose(String(totalGood % bpc))

        setEmptyBroken(String(product.emptyStock?.broken ?? 0))
        setBrokenPrice(String(product.brokenPrice ?? ""))
        setError(null)
    }, [product])

    // Fetch existing groups and companies from API when dialog opens
    useEffect(() => {
        if (!open) return
        api.get<{ productName: string }[]>("/products")
            .then((res) => {
                const groups = Array.from(
                    new Set(res.data.map((p) => p.productName).filter(Boolean))
                ).sort() as string[]
                setExistingGroups(groups)
            })
            .catch(() => { })

        api.get<ApiCompany[]>("/companies")
            .then((res) => setExistingCompanies(res.data))
            .catch(() => { })
    }, [open])

    const handleSave = async () => {
        if (!product) return
        try {
            setSaving(true)
            setError(null)

            const body: Record<string, unknown> = {
                brand: brand.trim() || product.brand,
                productName: productName.trim() || product.productName,
                mrp: Number(mrp),
                casePrice: Number(casePrice),
                bottlesPerCase: Number(bottlesPerCase),
                perBottlePrice: Number(casePrice) / Number(bottlesPerCase),
                filledStock: {
                    cases: Number(filledCases) || 0,
                    looseBottles: Number(filledLoose) || 0,
                },
            }

            if (product.isReturnable) {
                body.emptyStock = {
                    good: (Number(emptyGoodCases) || 0) * Number(bottlesPerCase) + (Number(emptyGoodLoose) || 0),
                    broken: Number(emptyBroken) || 0,
                }
                if (brokenPrice !== "") body.brokenPrice = Number(brokenPrice)
            }

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
                        Edit {product?.productName} {product?.size}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
                    )}

                    {/* Product Name (group identifier) */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground">
                            Product Name{" "}
                            <span className="text-xs text-muted-foreground">(groups variants on Products page)</span>
                        </Label>
                        {newGroupMode ? (
                            <div className="flex gap-2">
                                <Input
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="Type new product name"
                                    className="bg-white/80 border-border flex-1"
                                    autoFocus
                                />
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => { setNewGroupMode(false); setProductName(product?.productName || "") }}
                                    className="shrink-0"
                                >
                                    ✕
                                </Button>
                            </div>
                        ) : (
                            <Select
                                value={productName}
                                onValueChange={(v) => {
                                    if (v === "__new__") { setNewGroupMode(true); setProductName("") }
                                    else setProductName(v)
                                }}
                            >
                                <SelectTrigger className="bg-white/80 border-border">
                                    <SelectValue placeholder="Select product name…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {existingGroups.map((g) => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                    <SelectItem value="__new__" className="text-primary font-medium">
                                        ＋ New product name…
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Brand / Company */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Brand (Company)</Label>
                        <Select value={brand} onValueChange={setBrand}>
                            <SelectTrigger className="bg-white/80 border-border">
                                <SelectValue placeholder="Select company..." />
                            </SelectTrigger>
                            <SelectContent>
                                {existingCompanies.map((c) => (
                                    <SelectItem key={c.companyId} value={c.companyName}>
                                        {c.companyName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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

                    {/* Filled Stock */}
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Filled Stock</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Cases</Label>
                                <Input type="number" value={filledCases} onChange={(e) => setFilledCases(e.target.value)} className="bg-white/80 border-border" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Loose Bottles</Label>
                                <Input type="number" value={filledLoose} onChange={(e) => setFilledLoose(e.target.value)} className="bg-white/80 border-border" />
                            </div>
                        </div>
                    </div>

                    {/* Empty Stock — only for RGB */}
                    {product?.isReturnable && (
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Empty Stock</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-foreground">Good Empties - Cases</Label>
                                    <Input type="number" value={emptyGoodCases} onChange={(e) => setEmptyGoodCases(e.target.value)} className="bg-white/80 border-border" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-foreground">Good Empties - Loose</Label>
                                    <Input type="number" value={emptyGoodLoose} onChange={(e) => setEmptyGoodLoose(e.target.value)} className="bg-white/80 border-border" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Broken Empties (Loose Bottles)</Label>
                                <Input type="number" value={emptyBroken} onChange={(e) => setEmptyBroken(e.target.value)} className="bg-white/80 border-border" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-foreground">Price per Broken Bottle (₹)</Label>
                                <Input type="number" value={brokenPrice} onChange={(e) => setBrokenPrice(e.target.value)} placeholder="e.g. 3" className="bg-white/80 border-border" />
                                <p className="text-[10px] text-muted-foreground">Credit given when customer returns a broken bottle</p>
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
