import { ProductsHeader } from "@/components/products/products-header"
import { ProductsGrid } from "@/components/products/products-grid"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ProductsHeader />
      <ProductsGrid />
    </div>
  )
}
