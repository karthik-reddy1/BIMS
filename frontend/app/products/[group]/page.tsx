"use client"

import { use, useState, useEffect, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackTypeCard } from "@/components/products/pack-type-card"
import api from "@/lib/api"
import type { ApiProduct } from "@/lib/types"

const PACK_ORDER = ["RGB", "PET", "CAN", "TTP", "MTP"]

export default function ProductGroupPage({ params }: { params: Promise<{ group: string }> }) {
    // Next.js 15: params is a Promise — must be unwrapped with React.use()
    const { group: groupSlug } = use(params)

    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [groupName, setGroupName] = useState(decodeURIComponent(groupSlug))

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<ApiProduct[]>("/products")
            const all: ApiProduct[] = res.data
            const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-")
            const decoded = decodeURIComponent(groupSlug)
            const filtered = all.filter(
                (p) => slugify(p.productGroup || p.productName) === decoded
            )
            setProducts(filtered)
            if (filtered.length > 0) {
                setGroupName(filtered[0].productGroup || filtered[0].productName)
            }
        } catch {
            // silent
        } finally {
            setLoading(false)
        }
    }, [groupSlug])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    // Group by packType in defined order
    const byPackType = new Map<string, ApiProduct[]>()
    for (const pt of PACK_ORDER) {
        const group = products.filter((p) => p.packType === pt)
        if (group.length > 0) byPackType.set(pt, group)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Back link */}
            <div className="flex items-center gap-3">
                <Link href="/products">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                        <ArrowLeft className="h-4 w-4" />
                        Products
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-foreground">{groupName}</h1>
                {products[0] && (
                    <p className="text-muted-foreground mt-1">{products[0].brand}</p>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-white/60 rounded-xl animate-pulse border border-border" />
                    ))}
                </div>
            ) : byPackType.size === 0 ? (
                <p className="text-center py-16 text-muted-foreground">
                    No variants found for this product group.
                    <br />
                    <span className="text-sm">Use the Edit button on a product to set its productGroup to &quot;{groupName}&quot;</span>
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...byPackType.entries()].map(([packType, variants]) => (
                        <PackTypeCard
                            key={packType}
                            packType={packType}
                            products={variants}
                            onRefresh={fetchProducts}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
