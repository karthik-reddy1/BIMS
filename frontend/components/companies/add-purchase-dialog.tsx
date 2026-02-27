"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, X, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Company } from "@/lib/company-data"
import { companyProducts, companyRGBProducts } from "@/lib/company-data"

type PurchaseItem = {
  productId: string
  cases: number
}

type EmptyReturn = {
  productId: string
  goodReturning: number
  brokenReturning: number
}

export function AddPurchaseDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [items, setItems] = useState<PurchaseItem[]>([{ productId: "", cases: 1 }])
  const [transportBill, setTransportBill] = useState("")
  const [emptiesReturns, setEmptiesReturns] = useState<EmptyReturn[]>([])
  const [emptiesExpanded, setEmptiesExpanded] = useState(true)

  const availableProducts = useMemo(
    () => companyProducts.filter((p) => p.companyId === company?.id),
    [company?.id]
  )

  const rgbProducts = useMemo(
    () => (company?.id ? companyRGBProducts[company.id] ?? [] : []),
    [company?.id]
  )

  // Initialize empties returns when opening
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && company) {
        const rgbs = companyRGBProducts[company.id] ?? []
        setEmptiesReturns(
          rgbs.map((p) => ({
            productId: p.id,
            goodReturning: 0,
            brokenReturning: 0,
          }))
        )
        setItems([{ productId: "", cases: 1 }])
        setTransportBill("")
      }
      onOpenChange(nextOpen)
    },
    [company, onOpenChange]
  )

  const addItem = () => setItems([...items, { productId: "", cases: 1 }])

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  const updateEmpty = (productId: string, field: "goodReturning" | "brokenReturning", value: number) => {
    setEmptiesReturns((prev) =>
      prev.map((e) => (e.productId === productId ? { ...e, [field]: value } : e))
    )
  }

  const productTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = availableProducts.find((p) => p.id === item.productId)
      return sum + (product ? product.casePrice * item.cases : 0)
    }, 0)
  }, [items, availableProducts])

  const transport = Number(transportBill) || 0

  const brokenPayment = useMemo(() => {
    return emptiesReturns.reduce((sum, e) => sum + e.brokenReturning * 3, 0)
  }, [emptiesReturns])

  const grandTotal = productTotal + transport + brokenPayment

  const dueDate = useMemo(() => {
    if (!company) return ""
    const d = new Date()
    d.setDate(d.getDate() + company.paymentTerms)
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
  }, [company])

  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-6 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Purchase from {company.name}
            </DialogTitle>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          {/* SECTION 1: Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">Items</h3>
              <Button size="sm" onClick={addItem} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => {
              const product = availableProducts.find((p) => p.id === item.productId)
              const totalBottles = product ? product.bottlesPerCase * item.cases : 0
              const itemTotal = product ? product.casePrice * item.cases : 0

              return (
                <div
                  key={index}
                  className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-border"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    {/* Product */}
                    <div className="sm:col-span-5 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(index, "productId", v)}
                      >
                        <SelectTrigger className="bg-white/80 border-border">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="flex items-center gap-2">
                                {p.name}
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {p.packType}
                                </Badge>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cases */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Cases</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.cases}
                        onChange={(e) => updateItem(index, "cases", parseInt(e.target.value) || 1)}
                        className="bg-white/80 border-border"
                      />
                      {product && (
                        <span className="text-xs text-muted-foreground">
                          = {totalBottles} bottles
                        </span>
                      )}
                    </div>

                    {/* Case Price */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Case Price</Label>
                      <div className="h-9 flex items-center text-sm font-medium text-foreground">
                        {product ? `\u20B9${product.casePrice}` : "-"}
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <div className="h-9 flex items-center text-lg font-bold text-primary">
                        {"\u20B9"}{itemTotal.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className="sm:col-span-1 flex items-end justify-end">
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Transport Bill */}
            <div className="flex items-center gap-4 pt-1">
              <Label className="text-sm text-foreground whitespace-nowrap">Transport Bill</Label>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{"\u20B9"}</span>
                <Input
                  type="number"
                  value={transportBill}
                  onChange={(e) => setTransportBill(e.target.value)}
                  placeholder="0"
                  className="pl-7 bg-white/80 border-border"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Empties Returning */}
          {rgbProducts.length > 0 && (
            <div className="backdrop-blur-sm bg-white/60 rounded-xl border-l-4 border-l-primary border border-border p-5 flex flex-col gap-4">
              <button
                onClick={() => setEmptiesExpanded(!emptiesExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Empty Bottles Returning to Company</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Your current empty stock available for return
                  </p>
                </div>
                {emptiesExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {emptiesExpanded && (
                <div className="flex flex-col gap-3">
                  {rgbProducts.map((rgbProduct) => {
                    const emptyReturn = emptiesReturns.find((e) => e.productId === rgbProduct.id)
                    const good = emptyReturn?.goodReturning ?? 0
                    const broken = emptyReturn?.brokenReturning ?? 0
                    const brokenCost = broken * 3

                    return (
                      <div
                        key={rgbProduct.id}
                        className="bg-white/50 p-4 rounded-lg border border-border"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{rgbProduct.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Available: {rgbProduct.availableGood} good, {rgbProduct.availableBroken} broken
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs text-muted-foreground">Good Returning</Label>
                              <Input
                                type="number"
                                min={0}
                                max={rgbProduct.availableGood}
                                value={good}
                                onChange={(e) =>
                                  updateEmpty(
                                    rgbProduct.id,
                                    "goodReturning",
                                    Math.min(parseInt(e.target.value) || 0, rgbProduct.availableGood)
                                  )
                                }
                                className="bg-white/80 border-border"
                              />
                              <span className="text-xs text-muted-foreground">max: {rgbProduct.availableGood}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs text-muted-foreground">Broken from Warehouse</Label>
                              <Input
                                type="number"
                                min={0}
                                max={rgbProduct.availableBroken}
                                value={broken}
                                onChange={(e) =>
                                  updateEmpty(
                                    rgbProduct.id,
                                    "brokenReturning",
                                    Math.min(parseInt(e.target.value) || 0, rgbProduct.availableBroken)
                                  )
                                }
                                className="bg-white/80 border-border"
                              />
                              <span className="text-xs text-muted-foreground">max: {rgbProduct.availableBroken}</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs text-warning-foreground">Money for Broken</Label>
                              <div className="h-9 flex items-center text-sm font-medium text-warning-foreground">
                                {"\u20B9"}{brokenCost}
                              </div>
                              <span className="text-xs text-muted-foreground">broken x {"\u20B9"}3</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {brokenPayment > 0 && (
                    <div className="flex items-center justify-end text-sm font-medium text-warning-foreground pt-1">
                      Total Money for Broken: {"\u20B9"}{brokenPayment}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: Bill Summary */}
          <div className="bg-primary/5 backdrop-blur-md p-6 rounded-xl border border-primary/10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Product Total</span>
                <span className="font-medium text-foreground">{"\u20B9"}{productTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transport</span>
                <span className="font-medium text-foreground">{"\u20B9"}{transport.toLocaleString("en-IN")}</span>
              </div>
              {brokenPayment > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Broken Payment</span>
                  <span className="font-medium text-warning-foreground">{"\u20B9"}{brokenPayment}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-primary">{"\u20B9"}{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-end text-xs text-muted-foreground">
                Payment Due: {dueDate} ({company.paymentTerms} days)
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleOpenChange(false)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Save Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
