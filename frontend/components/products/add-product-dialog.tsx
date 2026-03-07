"use client"

import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"
import type { ApiCompany } from "@/lib/types"

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
    const [productGroup, setProductGroup] = useState("")
    const [newGroupMode, setNewGroupMode] = useState(false)   // true = typing a new group
    const [existingGroups, setExistingGroups] = useState<string[]>([])
    const [existingCompanies, setExistingCompanies] = useState<ApiCompany[]>([])
    const [brand, setBrand] = useState("")
    const [size, setSize] = useState("")
    const [packType, setPackType] = useState<PackType>("RGB")
    const [mrp, setMrp] = useState("")
    const [casePrice, setCasePrice] = useState("")
    const [bottlesPerCase, setBottlesPerCase] = useState("")
    const [isReturnable, setIsReturnable] = useState(false)

    // Initial Stock fields
    const [filledCases, setFilledCases] = useState("")
    const [filledLoose, setFilledLoose] = useState("")
    const [emptyGood, setEmptyGood] = useState("")
    const [emptyBroken, setEmptyBroken] = useState("")

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch existing product groups & companies when dialog opens
    useEffect(() => {
        if (!open) return
        api.get<{ productGroup?: string; productName: string }[]>("/products")
            .then((res) => {
                const groups = Array.from(
                    new Set(res.data.map((p) => p.productGroup || p.productName).filter(Boolean))
                ).sort() as string[]
                setExistingGroups(groups)
            }).catch(() => { })

        api.get<ApiCompany[]>("/companies")
            .then((res) => setExistingCompanies(res.data))
            .catch(() => { })
    }, [open])

    const reset = () => {
        setProductName("")
        setProductGroup("")
        setNewGroupMode(false)
        setBrand("")
        setSize("")
        setPackType("RGB")
        setMrp("")
        setCasePrice("")
        setBottlesPerCase("")
        setIsReturnable(false)
        setFilledCases("")
        setFilledLoose("")
        setEmptyGood("")
        setEmptyBroken("")
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
            const payload: Record<string, unknown> = {
                productId,
                brand: brand.trim() || productName.trim(),
                productName: productName.trim(),
                productGroup: productGroup.trim() || productName.trim(),
                size: size.trim(),
                packType,
                isReturnable: packType === "RGB" ? true : isReturnable,
                mrp: Number(mrp),
                casePrice: Number(casePrice),
                bottlesPerCase: Number(bottlesPerCase),
                perBottlePrice: Number(perBottlePrice),
                filledStock: {
                    cases: Number(filledCases) || 0,
                    looseBottles: Number(filledLoose) || 0,
                },
            }

            if (packType === "RGB" || isReturnable) {
                payload.emptyStock = {
                    good: Number(emptyGood) || 0,
                    broken: Number(emptyBroken) || 0,
                }
            }

            await api.post("/products", payload)
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

                <div className="p-8 pt-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
                    )}

                    {/* Product Name + Brand + Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Product Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={productName}
                                onChange={(e) => { setProductName(e.target.value); if (!productGroup) setProductGroup(e.target.value) }}
                                placeholder="e.g. Thumbsup"
                                className="bg-white/80 border-border"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-foreground">Brand (Company) <span className="text-destructive">*</span></Label>
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
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground">Product Group <span className="text-xs text-muted-foreground">(groups variants on the Products page)</span></Label>
                        {newGroupMode ? (
                            <div className="flex gap-2">
                                <Input
                                    value={productGroup}
                                    onChange={(e) => setProductGroup(e.target.value)}
                                    placeholder="Type new group name"
                                    className="bg-white/80 border-border flex-1"
                                    autoFocus
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setNewGroupMode(false); setProductGroup("") }}
                                    className="shrink-0"
                                >
                                    ✕
                                </Button>
                            </div>
                        ) : (
                            <Select
                                value={productGroup}
                                onValueChange={(v) => {
                                    if (v === "__new__") { setNewGroupMode(true); setProductGroup("") }
                                    else setProductGroup(v)
                                }}
                            >
                                <SelectTrigger className="bg-white/80 border-border">
                                    <SelectValue placeholder={productName || "Select or create group…"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {existingGroups.map((g) => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                    <SelectItem value="__new__" className="text-primary font-medium">
                                        ＋ New group…
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
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

                    <Separator className="my-2" />

                    {/* Initial Stock */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-foreground font-semibold">Initial Stock (Optional)</Label>

                        <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs text-muted-foreground">Filled Cases</Label>
                                    <Input
                                        type="number"
                                        value={filledCases}
                                        onChange={(e) => setFilledCases(e.target.value)}
                                        placeholder="0"
                                        className="bg-white/80"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs text-muted-foreground">Filled Loose</Label>
                                    <Input
                                        type="number"
                                        value={filledLoose}
                                        onChange={(e) => setFilledLoose(e.target.value)}
                                        placeholder="0"
                                        className="bg-white/80"
                                    />
                                </div>
                            </div>

                            {(packType === "RGB" || isReturnable) && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-muted-foreground">Empty Good Bottles</Label>
                                        <Input
                                            type="number"
                                            value={emptyGood}
                                            onChange={(e) => setEmptyGood(e.target.value)}
                                            placeholder="0"
                                            className="bg-white/80"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-muted-foreground">Empty Broken Bottles</Label>
                                        <Input
                                            type="number"
                                            value={emptyBroken}
                                            onChange={(e) => setEmptyBroken(e.target.value)}
                                            placeholder="0"
                                            className="bg-white/80"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

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
