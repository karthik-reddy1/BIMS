"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EditProductDialog } from "@/components/products/edit-product-dialog"
import type { Product } from "@/components/products/products-grid"

function stockColor(stock: number) {
  if (stock > 100) return "bg-success"
  if (stock >= 50) return "bg-warning"
  return "bg-destructive"
}

function stockProgressColor(stock: number) {
  if (stock > 100) return "text-success"
  if (stock >= 50) return "text-warning"
  return "text-destructive"
}

export function ProductCard({
  product,
  onSaved,
}: {
  product: Product
  onSaved?: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const cases = Math.floor(product.stock / product.bottlesPerCase)
  const stockPercent = Math.min((product.stock / 300) * 100, 100)

  return (
    <>
      <div className="relative backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border p-5 flex flex-col gap-4">

        {/* Edit button — small square in bottom-right corner */}
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-3 right-3 h-7 w-7 rounded-md border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 shadow-sm"
          onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
          title="Edit product"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground leading-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{product.brand}</p>
          </div>
          <Badge
            variant="secondary"
            className={
              product.returnable
                ? "bg-success/10 text-success border-0 shrink-0"
                : "bg-muted text-muted-foreground border-0 shrink-0"
            }
          >
            {product.returnable ? "Returnable" : "Non-Return"}
          </Badge>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">MRP</span>
            <span className="font-medium text-foreground">₹{product.mrp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Per Case</span>
            <span className="font-medium text-foreground">₹{product.perCase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bottles/Case</span>
            <span className="font-medium text-foreground">{product.bottlesPerCase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium text-foreground">{product.size}</span>
          </div>
        </div>

        {/* Stock bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${stockProgressColor(product.stock)}`}>
              Stock: {product.stock} bottles ({cases} cases)
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${stockColor(product.stock)} transition-all duration-500`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        </div>

        {/* Empties (returnables only) */}
        {product.returnable && product.empties && (
          <div className="text-sm flex flex-col gap-1 pt-1 border-t border-border pb-4">
            <p className="text-muted-foreground">
              Empties: <span className="text-foreground font-medium">{product.empties.good} good</span>, <span className="text-destructive font-medium">{product.empties.broken} broken</span>
            </p>
            {product.oweCompany !== undefined && (
              <p className="text-warning-foreground">
                Owe Company: <span className="font-medium">{product.oweCompany}</span>
              </p>
            )}
            {product.shopsOwe !== undefined && (
              <p className="text-primary">
                Shops Owe: <span className="font-medium">{product.shopsOwe}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <EditProductDialog
        product={product}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => { setEditOpen(false); onSaved?.() }}
      />
    </>
  )
}
