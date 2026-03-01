"use client"

import { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductCard } from "@/components/products/product-card"
import api from "@/lib/api"
import type { ApiProduct } from "@/lib/types"

export type Product = {
  productId: string
  name: string
  mrp: number
  perCase: number
  bottlesPerCase: number
  size: string
  stock: number
  filledCases: number
  filledLoose: number
  type: "RGB" | "PET" | "CAN"
  brand: string
  returnable: boolean
  empties?: { good: number; broken: number }
  oweCompany?: number
  shopsOwe?: number
}

function mapApiProduct(p: ApiProduct): Product {
  return {
    productId: p.productId,
    name: p.productName,
    mrp: p.mrp,
    perCase: p.casePrice,
    bottlesPerCase: p.bottlesPerCase,
    size: p.size,
    stock: p.filledStock.totalBottles,
    filledCases: p.filledStock.cases,
    filledLoose: p.filledStock.looseBottles,
    type: p.packType as "RGB" | "PET" | "CAN",
    brand: p.brand,
    returnable: p.isReturnable,
    empties: p.isReturnable
      ? { good: p.emptyStock.good, broken: p.emptyStock.broken }
      : undefined,
    oweCompany: p.isReturnable ? p.returnableAccounts.companyOwed : undefined,
    shopsOwe: p.isReturnable ? p.returnableAccounts.shopsOwed : undefined,
  }
}

export function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [packType, setPackType] = useState("all")
  const [brand, setBrand] = useState("all")

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<ApiProduct[]>("/products")
      setProducts(res.data.map(mapApiProduct))
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Derive unique brands from fetched products
  const brands = Array.from(new Set(products.map((p) => p.brand)))

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesPack = packType === "all" || p.type === packType
    const matchesBrand = brand === "all" || p.brand === brand
    return matchesSearch && matchesPack && matchesBrand
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/80 backdrop-blur-md border-border"
          />
        </div>
        <Select value={packType} onValueChange={setPackType}>
          <SelectTrigger className="w-full sm:w-40 bg-white/80 backdrop-blur-md border-border">
            <SelectValue placeholder="Pack Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="RGB">RGB</SelectItem>
            <SelectItem value="PET">PET</SelectItem>
            <SelectItem value="CAN">CAN</SelectItem>
            <SelectItem value="TTP">TTP</SelectItem>
            <SelectItem value="MTP">MTP</SelectItem>
          </SelectContent>
        </Select>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-full sm:w-44 bg-white/80 backdrop-blur-md border-border">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-5 h-52 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products found.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.productId} product={product} onSaved={fetchProducts} />
          ))}
        </div>
      )}
    </div>
  )
}
