"use client"

import { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProductGroupCard } from "@/components/products/product-group-card"
import api from "@/lib/api"
import type { ApiProduct } from "@/lib/types"

// Group products by productGroup field (fall back to productName)
function groupProducts(products: ApiProduct[]): Map<string, ApiProduct[]> {
  const map = new Map<string, ApiProduct[]>()
  for (const p of products) {
    const key = p.productGroup?.trim() || p.productName
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return map
}

export function ProductsGrid() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<ApiProduct[]>("/products")
      setProducts(res.data)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const grouped = groupProducts(products)

  // Filter groups by search
  const filteredGroups = [...grouped.entries()].filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product groups…"
          className="pl-9 bg-white/80 backdrop-blur-md border-border"
        />
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="backdrop-blur-md bg-white/80 rounded-xl border border-border p-5 h-44 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && filteredGroups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products found. Use "Add Product" to get started.</p>
        </div>
      )}

      {!loading && !error && filteredGroups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(([groupName, groupProducts]) => (
            <ProductGroupCard key={groupName} groupName={groupName} products={groupProducts} />
          ))}
        </div>
      )}
    </div>
  )
}
