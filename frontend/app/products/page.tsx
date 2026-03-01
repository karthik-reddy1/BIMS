"use client"

import { useState } from "react"
import { ProductsHeader } from "@/components/products/products-header"
import { ProductsGrid } from "@/components/products/products-grid"

export default function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <div className="flex flex-col gap-6">
      <ProductsHeader onProductAdded={() => setRefreshKey((k) => k + 1)} />
      <ProductsGrid key={refreshKey} />
    </div>
  )
}
