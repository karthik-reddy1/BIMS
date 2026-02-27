"use client"

import { useState, useMemo } from "react"
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

const availableProducts = [
  { id: "1", name: "Thumbsup RGB 300ml", available: 240, price: 20 },
  { id: "2", name: "Sprite PET 500ml", available: 120, price: 30 },
  { id: "3", name: "Fanta RGB 300ml", available: 180, price: 20 },
  { id: "4", name: "Coke CAN 330ml", available: 96, price: 40 },
  { id: "5", name: "Maaza RGB 200ml", available: 50, price: 15 },
  { id: "6", name: "Pepsi PET 1L", available: 60, price: 50 },
]

type BillItem = {
  productId: string
  quantity: number
}

export function CreateBillDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [shop, setShop] = useState("")
  const [route, setRoute] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [amountReceived, setAmountReceived] = useState("")
  const [items, setItems] = useState<BillItem[]>([{ productId: "", quantity: 1 }])

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const grandTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = availableProducts.find((p) => p.id === item.productId)
      if (!product) return total
      return total + product.price * item.quantity
    }, 0)
  }, [items])

  const handleSubmit = () => {
    onOpenChange(false)
    setItems([{ productId: "", quantity: 1 }])
    setShop("")
    setRoute("")
    setPaymentMode("")
    setAmountReceived("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Create Shop Bill</DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Shop</Label>
              <Select value={shop} onValueChange={setShop}>
                <SelectTrigger className="bg-white/80 border-border">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sai-traders">Sai Traders</SelectItem>
                  <SelectItem value="kumar-stores">Kumar Stores</SelectItem>
                  <SelectItem value="ravi-shop">Ravi Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Route</Label>
              <Select value={route} onValueChange={setRoute}>
                <SelectTrigger className="bg-white/80 border-border">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="route-a">Route A</SelectItem>
                  <SelectItem value="route-b">Route B</SelectItem>
                  <SelectItem value="walk-in">No Route / Walk-in</SelectItem>
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
              const product = availableProducts.find((p) => p.id === item.productId)
              const itemTotal = product ? product.price * item.quantity : 0

              return (
                <div
                  key={index}
                  className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col sm:flex-row sm:items-end gap-4"
                >
                  <div className="flex-1 flex flex-col gap-2">
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
                            {p.name} - Available: {p.available} | {"\u20B9"}{p.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground">Qty</Label>
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
                      {"\u20B9"}{itemTotal.toLocaleString("en-IN")}
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
              <span className="font-semibold text-foreground">{"\u20B9"}{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-2xl">
              <span className="font-bold text-foreground">Grand Total</span>
              <span className="font-bold text-primary">{"\u20B9"}{grandTotal.toLocaleString("en-IN")}</span>
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
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Amount Received</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{"\u20B9"}</span>
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
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Generate Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
