"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, X, Receipt, Minus, ChevronRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
import api from "@/lib/api"
import type { ApiProduct, ApiShop, ApiRoute } from "@/lib/types"

// ─── Per-item state (UI only — only productId + qty go to API) ───────────────
type BillItem = {
  selectedGroup: string     // e.g. "Thumbsup"
  selectedPackType: string  // e.g. "RGB"
  productId: string         // resolved after all 3 steps
  cases: number             // UI tracker for cases
  looseBottles: number      // UI tracker for loose bottles
  quantity: number          // computed total bottles sent to backend or DB
}

const EMPTY_ITEM = (): BillItem => ({
  selectedGroup: "",
  selectedPackType: "",
  productId: "",
  cases: 0,
  looseBottles: 0,
  quantity: 0,
})

const PACK_ORDER = ["RGB", "PET", "CAN", "TTP", "MTP"]

// Badge colour per pack type
function packBadge(pt: string) {
  const cls =
    pt === "RGB" ? "bg-success/10 text-success" :
      pt === "PET" ? "bg-primary/10 text-primary" :
        pt === "CAN" ? "bg-orange-100 text-orange-700" :
          "bg-muted text-muted-foreground"
  return <Badge className={`${cls} border-0 text-xs`}>{pt}</Badge>
}

export function CreateBillDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [newShopMode, setNewShopMode] = useState(false)
  const [newShopName, setNewShopName] = useState("")
  const [shopId, setShopId] = useState("")
  const [routeId, setRouteId] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [amountReceived, setAmountReceived] = useState("")
  const [items, setItems] = useState<BillItem[]>([EMPTY_ITEM()])
  const [shops, setShops] = useState<ApiShop[]>([])
  const [routes, setRoutes] = useState<ApiRoute[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data when dialog opens
  useEffect(() => {
    if (!open) return
    Promise.all([
      api.get<ApiShop[]>("/shops"),
      api.get<ApiRoute[]>("/routes"),
      api.get<ApiProduct[]>("/products"),
    ]).then(([s, r, p]) => {
      setShops(s.data)
      setRoutes(r.data)
      setProducts(p.data)
    }).catch(() => { })
  }, [open])

  // ── Derived product hierarchies ───────────────────────────────────────────

  // All unique groups sorted
  const groups = useMemo(() => {
    const set = new Set(products.map((p) => p.productGroup || p.productName))
    return Array.from(set).sort()
  }, [products])

  // Pack types available for a given group
  const packTypesForGroup = (group: string): ApiProduct["packType"][] => {
    const types = new Set<string>(
      products
        .filter((p) => (p.productGroup || p.productName) === group)
        .map((p) => p.packType)
    )
    return PACK_ORDER.filter((pt) => types.has(pt)) as ApiProduct["packType"][]
  }

  // Sizes (products) for a group + packType
  const productsForGroupAndPack = (group: string, packType: string) =>
    products
      .filter((p) => (p.productGroup || p.productName) === group && p.packType === packType)
      .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))

  // ── Item helpers ──────────────────────────────────────────────────────────

  const addItem = () => setItems([...items, EMPTY_ITEM()])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))

  const updateGroup = (index: number, group: string) => {
    const next = [...items]
    next[index] = { ...EMPTY_ITEM(), selectedGroup: group }
    setItems(next)
  }

  const updatePackType = (index: number, packType: string) => {
    const next = [...items]
    next[index] = { ...next[index], selectedPackType: packType, productId: "" }
    setItems(next)
  }

  const updateProduct = (index: number, productId: string) => {
    const next = [...items]
    const product = products.find(p => p.productId === productId)

    // Automatically initialize with 1 case or 1 bottle based on what's available
    let initialCases = 0
    let initialLoose = 0
    let qty = 0

    if (product) {
      // if we have at least 1 case worth of stock
      if (product.filledStock.totalBottles >= product.bottlesPerCase) {
        initialCases = 1;
        qty = product.bottlesPerCase;
      } else if (product.filledStock.totalBottles > 0) {
        initialLoose = 1;
        qty = 1;
      }
    }

    next[index] = {
      ...next[index],
      productId,
      cases: initialCases,
      looseBottles: initialLoose,
      quantity: qty
    }
    setItems(next)
  }

  const updateQtySplit = (index: number, type: 'cases' | 'loose', val: number) => {
    const next = [...items]
    const item = next[index]
    const product = products.find(p => p.productId === item.productId)
    const bpc = product ? product.bottlesPerCase : 24

    const safeVal = Math.max(0, val || 0)

    if (type === 'cases') item.cases = safeVal
    if (type === 'loose') item.looseBottles = safeVal

    item.quantity = (item.cases * bpc) + item.looseBottles
    setItems(next)
  }

  // ── Total ─────────────────────────────────────────────────────────────────

  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const p = products.find((p) => p.productId === item.productId)
      return sum + (p ? p.mrp * item.quantity : 0)
    }, 0)
  }, [items, products])

  // ── Reset ─────────────────────────────────────────────────────────────────

  const reset = () => {
    setItems([EMPTY_ITEM()])
    setShopId("")
    setNewShopMode(false)
    setNewShopName("")
    setRouteId("")
    setPaymentMode("")
    setAmountReceived("")
    setError(null)
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!newShopMode && !shopId) { setError("Please select a shop"); return }
    if (newShopMode && !newShopName.trim()) { setError("Please enter a shop name"); return }
    if (!paymentMode) { setError("Please select a payment mode"); return }
    const validItems = items.filter((i) => i.productId && i.quantity > 0)
    if (validItems.length === 0) { setError("Please add at least one product with quantity > 0"); return }

    // Warn about insufficient stock
    for (const item of validItems) {
      const p = products.find((pr) => pr.productId === item.productId)
      if (p && item.quantity > p.filledStock.totalBottles) {
        setError(`Not enough stock for ${p.productName} ${p.size}. Available: ${p.filledStock.totalBottles} bottles`)
        return
      }
    }

    try {
      setSaving(true)
      setError(null)

      let finalShopId = shopId
      let finalRouteId = routeId
      let finalRouteName = null

      if (newShopMode) {
        // Create new shop first
        const autoShopId = "SHP-" + Date.now().toString(36).toUpperCase()
        const selectedRoute = routes.find((r) => r.routeId === routeId)
        finalRouteName = selectedRoute?.routeName || null

        const shopRes = await api.post<ApiShop>("/shops", {
          shopId: autoShopId,
          shopName: newShopName.trim(),
          routeId: finalRouteId || null,
          routeName: finalRouteName,
        })
        finalShopId = shopRes.data.shopId
      } else {
        // Existing shop: user might have explicitly selected a route, 
        // or we should use the one already tied to the shop (if we fetched it)
        const selectedRoute = routes.find((r) => r.routeId === routeId)
        finalRouteName = selectedRoute?.routeName || null
      }

      await api.post("/bills", {
        shopId: finalShopId,
        routeId: finalRouteId || null,
        routeName: finalRouteName || null,
        billDate: new Date().toISOString(),
        items: validItems.map((i) => ({
          productId: i.productId,
          cases: i.cases,
          looseBottles: i.looseBottles,
          quantity: i.quantity
        })),
        paymentMode,
        paymentReceived: Number(amountReceived) || 0,
      })
      onSaved?.()
      onOpenChange(false)
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create bill")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Create Shop Bill</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
            </p>
          )}

          {/* Shop + Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Shop <span className="text-destructive">*</span></Label>
              {newShopMode ? (
                <div className="flex gap-2">
                  <Input
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="Type new shop name"
                    className="bg-white/80 border-border flex-1"
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setNewShopMode(false); setNewShopName("") }}
                    className="shrink-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Select
                  value={shopId}
                  onValueChange={(v) => {
                    if (v === "__new__") { setNewShopMode(true); setShopId("") }
                    else setShopId(v)
                  }}
                >
                  <SelectTrigger className="bg-white/80 border-border">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.length === 0 && <SelectItem value="_" disabled>No shops found</SelectItem>}
                    {shops.map((s) => (
                      <SelectItem key={s.shopId} value={s.shopId}>{s.shopName}</SelectItem>
                    ))}
                    <SelectItem value="__new__" className="text-primary font-medium">
                      ＋ New shop…
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Route</Label>
              <Select value={routeId} onValueChange={setRouteId}>
                <SelectTrigger className="bg-white/80 border-border">
                  <SelectValue placeholder="No Route / Walk-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-route">No Route / Walk-in</SelectItem>
                  {routes.map((r) => (
                    <SelectItem key={r.routeId} value={r.routeId}>{r.routeName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Items</h3>
              <Button size="sm" onClick={addItem} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => {
              const availPackTypes = packTypesForGroup(item.selectedGroup)
              const availSizes = productsForGroupAndPack(item.selectedGroup, item.selectedPackType)
              const selectedProduct = products.find((p) => p.productId === item.productId)
              const stockOk = !selectedProduct || item.quantity <= selectedProduct.filledStock.totalBottles
              const itemTotal = selectedProduct ? selectedProduct.mrp * item.quantity : 0

              return (
                <div
                  key={index}
                  className={`rounded-xl border p-4 flex flex-col gap-3 transition-colors ${!stockOk ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"
                    }`}
                >
                  {/* 3-step product picker row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Step 1 — Group */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">1</span>
                        Product Group
                      </Label>
                      <Select value={item.selectedGroup} onValueChange={(v) => updateGroup(index, v)}>
                        <SelectTrigger className="bg-white/80 border-border h-9 text-sm">
                          <SelectValue placeholder="Select group…" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.length === 0 && <SelectItem value="_" disabled>No products found</SelectItem>}
                          {groups.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Step 2 — Pack Type */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">2</span>
                        Pack Type
                      </Label>
                      <Select
                        value={item.selectedPackType}
                        onValueChange={(v) => updatePackType(index, v)}
                        disabled={!item.selectedGroup}
                      >
                        <SelectTrigger className="bg-white/80 border-border h-9 text-sm">
                          <SelectValue placeholder={item.selectedGroup ? "Select type…" : "—"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availPackTypes.map((pt) => (
                            <SelectItem key={pt} value={pt}>
                              <span className="flex items-center gap-2">{packBadge(pt)} {pt}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Step 3 — Size / Variant */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">3</span>
                        Size / Variant
                      </Label>
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateProduct(index, v)}
                        disabled={!item.selectedPackType}
                      >
                        <SelectTrigger className="bg-white/80 border-border h-9 text-sm">
                          <SelectValue placeholder={item.selectedPackType ? "Select size…" : "—"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availSizes.map((p) => (
                            <SelectItem key={p.productId} value={p.productId}>
                              <span className="flex items-center justify-between gap-3 w-full">
                                <span>{p.size}</span>
                                <span className="text-xs text-muted-foreground">
                                  {p.filledStock.totalBottles} btl · ₹{p.mrp}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Product info strip + qty */}
                  {selectedProduct && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-sm">
                        {packBadge(selectedProduct.packType)}
                        <span className="text-muted-foreground">
                          Stock: <span className={`font-semibold ${selectedProduct.filledStock.totalBottles < 24 ? "text-destructive" : "text-foreground"}`}>
                            {selectedProduct.filledStock.totalBottles} bottles
                          </span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">₹{selectedProduct.mrp}/btl</span>
                        {!stockOk && (
                          <span className="text-destructive text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Exceeds stock
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Qty Config */}
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cases</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => updateQtySplit(index, 'cases', item.cases - 1)}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <Input
                                type="number" min={0}
                                value={item.cases}
                                onChange={(e) => updateQtySplit(index, 'cases', parseInt(e.target.value) || 0)}
                                className="w-16 text-center bg-white/80 border-border h-8 font-medium focus-visible:ring-1"
                              />
                              <Button
                                variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => updateQtySplit(index, 'cases', item.cases + 1)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Loose</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => updateQtySplit(index, 'loose', item.looseBottles - 1)}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <Input
                                type="number" min={0}
                                value={item.looseBottles}
                                onChange={(e) => updateQtySplit(index, 'loose', parseInt(e.target.value) || 0)}
                                className="w-16 text-center bg-white/80 border-border h-8 font-medium focus-visible:ring-1"
                              />
                              <Button
                                variant="outline" size="icon" className="h-8 w-8"
                                onClick={() => updateQtySplit(index, 'loose', item.looseBottles + 1)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Show total equivalent bottles to be explicitly clear */}
                          <div className="flex flex-col items-center gap-1 ml-2 pl-3 border-l border-border/50">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Btl</span>
                            <span className="h-8 flex items-center justify-center font-bold text-sm bg-muted/30 w-12 rounded-md border border-border/30">
                              {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Item total */}
                        <p className="text-base font-bold text-primary min-w-[80px] text-right">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </p>

                        {/* Remove */}
                        {items.length > 1 && (
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empty placeholder when product not yet selected */}
                  {!selectedProduct && items.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grand total */}
          <div className="bg-primary/5 backdrop-blur-md p-5 rounded-xl border border-primary/10">
            <div className="flex items-center justify-between text-xl">
              <span className="text-muted-foreground">Items Total</span>
              <span className="font-semibold text-foreground">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-2xl">
              <span className="font-bold text-foreground">Grand Total</span>
              <span className="font-bold text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Payment Mode <span className="text-destructive">*</span></Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="bg-white/80 border-border">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Amount Received</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0"
                  className="pl-7 bg-white/80 border-border"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { onOpenChange(false); reset() }}>Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Receipt className="h-4 w-4 mr-2" />
              {saving ? "Creating…" : "Generate Bill"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
