"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddProductDialog } from "@/components/products/add-product-dialog"

export function ProductsHeader({ onProductAdded }: { onProductAdded?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      <AddProductDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={() => {
          setOpen(false)
          onProductAdded?.()
        }}
      />
    </>
  )
}
