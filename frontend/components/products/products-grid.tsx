"use client"

import { useState } from "react"
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

export type Product = {
  name: string
  mrp: number
  perCase: number
  bottlesPerCase: number
  size: string
  stock: number
  type: "RGB" | "PET" | "CAN"
  brand: string
  returnable: boolean
  empties?: { good: number; broken: number }
  oweCompany?: number
  shopsOwe?: number
}

const products: Product[] = [
  {
    name: "Thumbsup RGB 300ml",
    mrp: 20,
    perCase: 300,
    bottlesPerCase: 24,
    size: "300ml",
    stock: 240,
    type: "RGB",
    brand: "CSD Flavour",
    returnable: true,
    empties: { good: 40, broken: 5 },
    oweCompany: 320,
    shopsOwe: 120,
  },
  {
    name: "Sprite PET 500ml",
    mrp: 30,
    perCase: 360,
    bottlesPerCase: 24,
    size: "500ml",
    stock: 120,
    type: "PET",
    brand: "CSD Flavour",
    returnable: false,
  },
  {
    name: "Fanta RGB 300ml",
    mrp: 20,
    perCase: 300,
    bottlesPerCase: 24,
    size: "300ml",
    stock: 180,
    type: "RGB",
    brand: "CSD Flavour",
    returnable: true,
    empties: { good: 30, broken: 2 },
    oweCompany: 200,
    shopsOwe: 80,
  },
  {
    name: "Coke CAN 330ml",
    mrp: 40,
    perCase: 480,
    bottlesPerCase: 24,
    size: "330ml",
    stock: 96,
    type: "CAN",
    brand: "CSD Flavour",
    returnable: false,
  },
  {
    name: "Maaza RGB 200ml",
    mrp: 15,
    perCase: 240,
    bottlesPerCase: 24,
    size: "200ml",
    stock: 50,
    type: "RGB",
    brand: "Maaza",
    returnable: true,
    empties: { good: 15, broken: 3 },
    oweCompany: 100,
    shopsOwe: 40,
  },
  {
    name: "Pepsi PET 1L",
    mrp: 50,
    perCase: 600,
    bottlesPerCase: 12,
    size: "1L",
    stock: 60,
    type: "PET",
    brand: "CSD Flavour",
    returnable: false,
  },
]

export function ProductsGrid() {
  const [search, setSearch] = useState("")
  const [packType, setPackType] = useState("all")
  const [brand, setBrand] = useState("all")

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
          </SelectContent>
        </Select>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-full sm:w-44 bg-white/80 backdrop-blur-md border-border">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="CSD Flavour">CSD Flavour</SelectItem>
            <SelectItem value="Maaza">Maaza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </div>
  )
}
