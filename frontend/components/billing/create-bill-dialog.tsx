"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, X, Receipt, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import api from "@/lib/api"
import type { ApiProduct, ApiShop, ApiRoute } from "@/lib/types"

type BillItem = {
  productId: string
  quantity: number
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
  const [shopId, setShopId] = useState("")
  const [routeId, setRouteId] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [amountReceived, setAmountReceived] = useState("")
  const [items, setItems] = useState<BillItem[]>([{ productId: "", quantity: 1 }])
  const [shops, setShops] = useState<ApiShop[]>([])
  const [routes, setRoutes] = useState<ApiRoute[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch shops, routes, and products when dialog opens
  useEffect(() => {
    if (!open) return
    Promise.all([
      api.get<ApiShop[]>("/shops"),
      api.get<ApiRoute[]>("/routes"),
      api.get<ApiProduct[]>("/products"),
    ]).then(([shopsRes, routesRes, productsRes]) => {
      setShops(shopsRes.data)
      setRoutes(routesRes.data)
      setProducts(productsRes.data)
    }).catch(() => { })
  }, [open])

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const grandTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p.productId === item.productId)
      if (!product) return total
      return total + product.mrp * item.quantity
    }, 0)
  }, [items, products])

  const reset = () => {
    setItems([{ productId: "", quantity: 1 }])
    setShopId("")
    setRouteId("")
    setPaymentMode("")
    setAmountReceived("")
    setError(null)
  }

  const handleSubmit = async () => {
    if (!shopId) {
      setError("Please select a shop")
      return
    }
    if (!paymentMode) {
      setError("Please select a payment mode")
      return
    }
    const validItems = items.filter((i) => i.productId && i.quantity > 0)
    if (validItems.length === 0) {
      setError("Please add at least one item")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const selectedShop = shops.find((s) => s.shopId === shopId)
      const selectedRoute = routes.find((r) => r.routeId === routeId)

      await api.post("/bills", {
        shopId,
        routeId: routeId || null,
        routeName: selectedRoute?.routeName || null,
        billDate: new Date().toISOString(),
        items: validItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Create Shop Bill</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Shop</Label>
              <Select value={shopId} onValueChange={setShopId}>
                <SelectTrigger className="bg-white/80 border-border">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.length === 0 && (
                    <SelectItem value="_empty" disabled>No shops found</SelectItem>
                  )}
                  {shops.map((s) => (
                    <SelectItem key={s.shopId} value={s.shopId}>{s.shopName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Route</Label>
              <Select value={routeId} onValueChange={setRouteId}>
                <SelectTrigger className="bg-white/80 border-border">
                  <SelectValue placeholder="Select route" />
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Items</h3>
              <Button size="sm" onClick={addItem} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => {
              const product = products.find((p) => p.productId === item.productId)
              const itemTotal = product ? product.mrp * item.quantity : 0

              return (
                <div key={index} className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground">Product</Label>
                    <Select value={item.productId} onValueChange={(v) => updateItem(index, "productId", v)}>
                      <SelectTrigger className="bg-white/80 border-border">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.productId} value={p.productId}>
                            {p.productName} — Stock: {p.filledStock.totalBottles} | ₹{p.mrp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground">Qty (bottles)</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateItem(index, "quantity", Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                          className="w-16 text-center bg-white/80 border-border"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-lg font-semibold text-primary pb-1.5 min-w-[80px] text-right">
                      ₹{itemTotal.toLocaleString("en-IN")}
                    </p>

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
              )
            })}
          </div>

          <div className="bg-primary/5 backdrop-blur-md p-6 rounded-xl border border-primary/10">
            <div className="flex items-center justify-between text-xl mb-2">
              <span className="text-muted-foreground">Items Total</span>
              <span className="font-semibold text-foreground">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-2xl">
              <span className="font-bold text-foreground">Grand Total</span>
              <span className="font-bold text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Payment Mode</Label>
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
