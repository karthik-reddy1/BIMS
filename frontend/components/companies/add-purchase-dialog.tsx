"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
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
import type { Company } from "@/components/companies/companies-content"
import type { ApiProduct } from "@/lib/types"
import api from "@/lib/api"

type PurchaseItem = {
  productKey: string   // "ProductName|PackType", e.g. "Thumbsup|RGB"
  productId: string
  cases: number
}

type EmptyReturn = {
  productId: string
  goodCases: number
  goodBottles: number
  brokenBottles: number
}

export function AddPurchaseDialog({
  company,
  open,
  onOpenChange,
  onSaved,
}: {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [items, setItems] = useState<PurchaseItem[]>([{ productId: "", productKey: "", cases: 1 }])
  const [transportBill, setTransportBill] = useState("")
  const [emptiesReturns, setEmptiesReturns] = useState<EmptyReturn[]>([])
  const [emptiesExpanded, setEmptiesExpanded] = useState(true)
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all products once when dialog opens
  useEffect(() => {
    if (!open) return
    api.get<ApiProduct[]>("/products").then((res) => {
      setAllProducts(res.data)
    }).catch(() => { })
  }, [open])

  // Only show products mapped to this company
  const companyProducts = useMemo(
    () => allProducts.filter((p) => (p.brand || "").toLowerCase() === (company?.name || "").toLowerCase()),
    [allProducts, company]
  )

  // RGB products in inventory for this company — these are the ones we can return to the company
  const rgbProducts = useMemo(
    () => companyProducts.filter((p) => p.isReturnable && p.emptyStock.total > 0),
    [companyProducts]
  )

  const initEmpties = useCallback(() => {
    setEmptiesReturns(
      rgbProducts.map((p) => ({
        productId: p.productId,
        goodCases: 0,
        goodBottles: 0,
        brokenBottles: 0,
      }))
    )
  }, [rgbProducts])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        initEmpties()
        setItems([{ productId: "", productKey: "", cases: 1 }])
        setTransportBill("")
        setError(null)
      }
      onOpenChange(nextOpen)
    },
    [initEmpties, onOpenChange]
  )

  // Re-init empties when products load
  useEffect(() => {
    if (open && rgbProducts.length > 0 && emptiesReturns.length === 0) {
      initEmpties()
    }
  }, [rgbProducts, open, emptiesReturns.length, initEmpties])

  const addItem = () => setItems([...items, { productId: "", productKey: "", cases: 1 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const next = [...items]
    if (field === "productKey") {
      // reset variant when product+packType changes
      next[index] = { ...next[index], productKey: value as string, productId: "" }
    } else {
      next[index] = { ...next[index], [field]: value }
    }
    setItems(next)
  }
  const updateEmpty = (productId: string, field: keyof EmptyReturn, value: number) => {
    setEmptiesReturns((prev) =>
      prev.map((e) => (e.productId === productId ? { ...e, [field]: value } : e))
    )
  }

  const productTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = companyProducts.find((p) => p.productId === item.productId)
      return sum + (product ? product.casePrice * item.cases : 0)
    }, 0)
  }, [items, companyProducts])

  const transport = Number(transportBill) || 0

  const brokenPayment = useMemo(() => {
    return emptiesReturns.reduce((sum, e) => {
      const product = rgbProducts.find(p => p.productId === e.productId)
      if (!product) return sum
      const totalBroken = e.brokenBottles
      return sum + (totalBroken * 3)
    }, 0)
  }, [emptiesReturns, rgbProducts])

  const grandTotal = productTotal + transport + brokenPayment

  const dueDate = useMemo(() => {
    if (!company) return ""
    const d = new Date()
    d.setDate(d.getDate() + company.paymentTerms)
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
  }, [company])

  const handleSave = async () => {
    if (!company) return
    const validItems = items.filter((i) => i.productId && i.cases > 0)
    if (validItems.length === 0) {
      setError("Please add at least one item")
      return
    }

    // Validate empty returns don't exceed available stock
    for (const e of emptiesReturns) {
      const product = rgbProducts.find(prod => prod.productId === e.productId)
      if (!product) continue

      const goodCount = (e.goodCases * product.bottlesPerCase) + e.goodBottles
      if (goodCount > product.emptyStock.good) {
        setError(`Cannot return more good ${product.productName} than available (${product.emptyStock.good}).`)
        return
      }
      const brokenCount = e.brokenBottles
      if (brokenCount > product.emptyStock.broken) {
        setError(`Cannot return more broken ${product.productName} than available (${product.emptyStock.broken}).`)
        return
      }
    }

    try {
      setSaving(true)
      setError(null)
      await api.post("/purchases", {
        companyId: company.id,
        purchaseDate: new Date().toISOString(),
        items: validItems.map((i) => ({ productId: i.productId, cases: i.cases })),
        transportBill: transport,
        emptiesReturned: emptiesReturns
          .map((e) => {
            const product = rgbProducts.find(prod => prod.productId === e.productId)
            if (!product) return { productId: e.productId, goodBottles: 0, brokenBottles: 0 }
            return {
              productId: e.productId,
              goodBottles: (e.goodCases * product.bottlesPerCase) + e.goodBottles,
              brokenBottles: e.brokenBottles
            }
          })
          .filter((e) => e.goodBottles > 0 || e.brokenBottles > 0)
      })
      onSaved?.()
      handleOpenChange(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save purchase")
    } finally {
      setSaving(false)
    }
  }

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
          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

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
              const product = companyProducts.find((p) => p.productId === item.productId)
              const totalBottles = product ? product.bottlesPerCase * item.cases : 0
              const itemTotal = product ? product.casePrice * item.cases : 0

              return (
                <div key={index} className="bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-border flex flex-col gap-3">
                  {/* Row 1: Product selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Product Name + PackType */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Product</Label>
                      <Select value={item.productKey} onValueChange={(v) => updateItem(index, "productKey", v)}>
                        <SelectTrigger className="bg-white/80 border-border">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Map(
                              companyProducts.map(p => [`${p.productName}|${p.packType}`, p])
                            ).values()
                          )
                            .sort((a, b) => a.productName.localeCompare(b.productName))
                            .map((p) => (
                              <SelectItem key={`${p.productName}|${p.packType}`} value={`${p.productName}|${p.packType}`}>
                                <span className="flex items-center gap-2">
                                  <span>{p.productName}</span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{p.packType}</Badge>
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Size Variant */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Size</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(index, "productId", v)}
                        disabled={!item.productKey}
                      >
                        <SelectTrigger className="bg-white/80 border-border">
                          <SelectValue placeholder={item.productKey ? "Select size" : "Pick product first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {companyProducts
                            .filter(p => `${p.productName}|${p.packType}` === item.productKey)
                            .map((p) => (
                              <SelectItem key={p.productId} value={p.productId}>
                                {p.size}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2: Cases, Price, Total, Delete */}
                  <div className="flex items-end gap-3">
                    <div className="flex flex-col gap-1.5 w-28">
                      <Label className="text-xs text-muted-foreground">Cases</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.cases}
                        onChange={(e) => updateItem(index, "cases", parseInt(e.target.value) || 1)}
                        className="bg-white/80 border-border"
                      />
                      {product && (
                        <span className="text-xs text-muted-foreground">{totalBottles} btl</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Case Price</Label>
                      <div className="h-9 flex items-center text-sm font-medium text-foreground">
                        {product ? `₹${product.casePrice}` : "—"}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <div className="h-9 flex items-center text-lg font-bold text-primary">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive mb-0.5"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Transport Bill */}
            <div className="flex items-center gap-4 pt-1">
              <Label className="text-sm text-foreground whitespace-nowrap">Transport Bill</Label>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
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
                  <p className="text-sm text-muted-foreground mt-0.5">Your current empty stock available for return</p>
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
                    const emptyReturn = emptiesReturns.find((e) => e.productId === rgbProduct.productId) || {
                      productId: rgbProduct.productId, goodCases: 0, goodBottles: 0, brokenBottles: 0
                    }

                    const totalGood = (emptyReturn.goodCases * rgbProduct.bottlesPerCase) + emptyReturn.goodBottles
                    const totalBroken = emptyReturn.brokenBottles
                    const brokenCost = totalBroken * (rgbProduct.brokenPrice || 0)

                    // Format good stock as cases + loose bottles
                    const goodCs = Math.floor(rgbProduct.emptyStock.good / rgbProduct.bottlesPerCase)
                    const goodLs = rgbProduct.emptyStock.good % rgbProduct.bottlesPerCase
                    const goodAvailDisplay = goodCs > 0 && goodLs > 0
                      ? `${goodCs}C + ${goodLs}B`
                      : goodCs > 0 ? `${goodCs}C` : `${goodLs}B`

                    return (
                      <div key={rgbProduct.productId} className="bg-white/50 p-4 rounded-lg border border-border">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{rgbProduct.productName}</span>
                              <span className="text-xs text-muted-foreground">{rgbProduct.size}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{rgbProduct.packType}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Available: <strong className="text-foreground">{goodAvailDisplay}</strong> good, <strong className="text-foreground">{rgbProduct.emptyStock.broken}</strong> broken
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Good Returning */}
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-foreground">Good Returning</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <Label className="text-[10px] text-muted-foreground">Cases</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={emptyReturn.goodCases}
                                    onChange={(e) => updateEmpty(rgbProduct.productId, "goodCases", parseInt(e.target.value) || 0)}
                                    className="bg-white/80 border-border h-8 text-sm"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <Label className="text-[10px] text-muted-foreground">Loose Bottles</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={emptyReturn.goodBottles}
                                    onChange={(e) => updateEmpty(rgbProduct.productId, "goodBottles", parseInt(e.target.value) || 0)}
                                    className="bg-white/80 border-border h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="text-xs text-right mt-1">
                                <span className={totalGood > rgbProduct.emptyStock.good ? "text-destructive font-semibold" : "text-muted-foreground"}>
                                  Total: {totalGood} / {rgbProduct.emptyStock.good}
                                </span>
                              </div>
                            </div>

                            {/* Broken Returning */}
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-foreground flex justify-between">
                                <span>Broken Returning</span>
                                <span className="text-warning-foreground">Credit: ₹{brokenCost}</span>
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5 col-span-2">
                                  <Label className="text-[10px] text-muted-foreground">Broken Bottles</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={emptyReturn.brokenBottles}
                                    onChange={(e) => updateEmpty(rgbProduct.productId, "brokenBottles", parseInt(e.target.value) || 0)}
                                    className="bg-white/80 border-border h-8 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="text-xs text-right mt-1">
                                <span className={totalBroken > rgbProduct.emptyStock.broken ? "text-destructive font-semibold" : "text-muted-foreground"}>
                                  Total: {totalBroken} / {rgbProduct.emptyStock.broken}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {brokenPayment > 0 && (
                    <div className="flex items-center justify-end text-sm font-medium text-warning-foreground pt-1">
                      Total Money for Broken: ₹{brokenPayment}
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
                <span className="font-medium text-foreground">₹{productTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transport</span>
                <span className="font-medium text-foreground">₹{transport.toLocaleString("en-IN")}</span>
              </div>
              {brokenPayment > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Broken Payment Credit</span>
                  <span className="font-medium text-warning-foreground">~ ₹{brokenPayment}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-end text-xs text-muted-foreground">
                Payment Due: {dueDate} ({company.paymentTerms} days)
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
              disabled={saving}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {saving ? "Saving…" : "Save Purchase"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
