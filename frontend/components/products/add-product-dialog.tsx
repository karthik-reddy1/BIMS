"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

const PACK_TYPES = ["RGB", "PET", "CAN", "TTP", "MTP"] as const
type PackType = typeof PACK_TYPES[number]

export function AddProductDialog({
    open,
    onOpenChange,
    onSaved,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved?: () => void
}) {
    const [productName, setProductName] = useState("")
    const [brand, setBrand] = useState("")
    const [size, setSize] = useState("")
    const [packType, setPackType] = useState<PackType>("RGB")
    const [mrp, setMrp] = useState("")
    const [casePrice, setCasePrice] = useState("")
    const [bottlesPerCase, setBottlesPerCase] = useState("")
    const [isReturnable, setIsReturnable] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const reset = () => {
        setProductName("")
        setBrand("")
        setSize("")
        setPackType("RGB")
        setMrp("")
        setCasePrice("")
        setBottlesPerCase("")
        setIsReturnable(true)
        setError(null)
    }

    // Auto-generate productId: "Thumbsup" + "RGB" + "300ml" → "THUMBSUP-RGB-300ML"
    const productId = [productName, packType, size]
        .filter(Boolean)
        .join("-")
        .toUpperCase()
        .replace(/[^A-Z0-9-]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30)

    const perBottlePrice = casePrice && bottlesPerCase
        ? (Number(casePrice) / Number(bottlesPerCase)).toFixed(2)
        : ""

    const handleSave = async () => {
        if (!productName.trim() || !packType || !mrp || !casePrice || !bottlesPerCase || !size.trim()) {
            setError("Please fill in all required fields")
            return
        }
        try {
            setSaving(true)
            setError(null)
            await api.post("/products", {
                productId,
                brand: brand.trim() || productName.trim(),
                productName: productName.trim(),
                size: size.trim(),
                packType,
                isReturnable: packType === "RGB" ? true : isReturnable,
                mrp: Number(mrp),
                casePrice: Number(casePrice),
                bottlesPerCase: Number(bottlesPerCase),
                perBottlePrice: Number(perBottlePrice),
            })
            onSaved?.()
            onOpenChange(false)
            reset()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save product")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="max-w-lg backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">Add Product</DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-6 flex flex-col gap-4">
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
                    )}

                    {/* Product Name + Brand */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Product Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g. Thumbsup"
                                className="bg-white/80 border-border"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Brand</Label>
                            <Input
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="e.g. CSD Flavour"
                                className="bg-white/80 border-border"
                            />
                        </div>
                    </div>

                    {/* Pack Type + Size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Pack Type <span className="text-destructive">*</span></Label>
                            <Select value={packType} onValueChange={(v) => { setPackType(v as PackType); if (v === "RGB") setIsReturnable(true) }}>
                                <SelectTrigger className="bg-white/80 border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PACK_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            <span className="flex items-center gap-2">
                                                {t}
                                                {t === "RGB" && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Returnable</Badge>}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Size <span className="text-destructive">*</span></Label>
                            <Input
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="e.g. 300ml"
                                className="bg-white/80 border-border"
                            />
                        </div>
                    </div>

                    {/* MRP + Case Price + Bottles per Case */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">MRP <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="20" className="pl-7 bg-white/80 border-border" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Case Price <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                <Input type="number" value={casePrice} onChange={(e) => setCasePrice(e.target.value)} placeholder="300" className="pl-7 bg-white/80 border-border" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Btl/Case <span className="text-destructive">*</span></Label>
                            <Input type="number" value={bottlesPerCase} onChange={(e) => setBottlesPerCase(e.target.value)} placeholder="24" className="bg-white/80 border-border" />
                        </div>
                    </div>

                    {/* Returnable toggle (only for non-RGB) */}
                    {packType !== "RGB" && (
                        <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                            <input
                                type="checkbox"
                                id="returnable"
                                checked={isReturnable}
                                onChange={(e) => setIsReturnable(e.target.checked)}
                                className="h-4 w-4 rounded border-border"
                            />
                            <Label htmlFor="returnable" className="text-foreground cursor-pointer">Is Returnable</Label>
                        </div>
                    )}

                    {/* Preview */}
                    {productId && (
                        <div className="bg-primary/5 rounded-lg px-4 py-3 text-sm">
                            <span className="text-muted-foreground">Product ID: </span>
                            <span className="font-mono font-semibold text-foreground">{productId}</span>
                            {perBottlePrice && (
                                <span className="ml-4 text-muted-foreground">₹{perBottlePrice}/bottle</span>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => { onOpenChange(false); reset() }}>Cancel</Button>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {saving ? "Saving…" : "Save Product"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
