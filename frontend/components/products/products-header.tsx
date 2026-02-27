"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProductsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-foreground">Products</h1>
      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Add Product
      </Button>
    </div>
  )
}
