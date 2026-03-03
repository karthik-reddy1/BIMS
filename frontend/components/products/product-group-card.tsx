"use client"

import { useRouter } from "next/navigation"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ApiProduct } from "@/lib/types"

const PACK_COLORS: Record<string, string> = {
    RGB: "bg-success/10 text-success",
    PET: "bg-primary/10 text-primary",
    CAN: "bg-warning/10 text-warning-foreground",
    TTP: "bg-purple-100 text-purple-700",
    MTP: "bg-orange-100 text-orange-700",
}

export function ProductGroupCard({ groupName, products }: { groupName: string; products: ApiProduct[] }) {
    const router = useRouter()

    const totalBottles = products.reduce((sum, p) => sum + p.filledStock.totalBottles, 0)
    const totalCases = products.reduce((sum, p) => sum + p.filledStock.cases, 0)
    const packTypes = [...new Set(products.map((p) => p.packType))]
    const brand = products[0]?.brand ?? ""

    // Stock level color
    const stockColor = totalBottles > 200 ? "text-success" : totalBottles > 80 ? "text-warning" : "text-destructive"
    const barColor = totalBottles > 200 ? "bg-success" : totalBottles > 80 ? "bg-warning" : "bg-destructive"
    const barPct = Math.min((totalBottles / 500) * 100, 100)

    const slug = encodeURIComponent(groupName.toLowerCase().replace(/\s+/g, "-"))

    return (
        <div
            className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border p-5 flex flex-col gap-4 cursor-pointer"
            onClick={() => router.push(`/products/${slug}`)}
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground leading-tight">{groupName}</h3>
                        <p className="text-sm text-muted-foreground">{brand}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                    {packTypes.map((t) => (
                        <Badge key={t} variant="secondary" className={`${PACK_COLORS[t] ?? ""} border-0 text-xs`}>
                            {t}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Total stock */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between text-sm">
                    <span className="text-muted-foreground">{products.length} variant{products.length !== 1 ? "s" : ""}</span>
                    <span className={`font-semibold ${stockColor}`}>
                        {totalBottles} bottles ({totalCases} cases)
                    </span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`absolute inset-y-0 left-0 rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${barPct}%` }}
                    />
                </div>
            </div>

            {/* Variant count hint */}
            <p className="text-xs text-muted-foreground">Click to see variant details →</p>
        </div>
    )
}
