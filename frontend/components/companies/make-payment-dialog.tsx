"use client"

import { useState, useMemo } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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

export function MakePaymentDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedBills, setSelectedBills] = useState<string[]>([])

  const pendingPurchases = company.purchases.filter((p) => p.status === "pending")

  const selectedTotal = useMemo(() => {
    return pendingPurchases
      .filter((p) => selectedBills.includes(p.id))
      .reduce((sum, p) => sum + p.amount, 0)
  }, [selectedBills, pendingPurchases])

  const remaining = company.outstanding - (Number(paymentAmount) || 0)

  const toggleBill = (id: string) => {
    setSelectedBills((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
      const total = pendingPurchases
        .filter((p) => next.includes(p.id))
        .reduce((sum, p) => sum + p.amount, 0)
      setPaymentAmount(String(total))
      return next
    })
  }

  const handleSubmit = () => {
    onOpenChange(false)
    setPaymentAmount("")
    setPaymentMode("")
    setReference("")
    setNotes("")
    setSelectedBills([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Make Payment</DialogTitle>
        </DialogHeader>

        <div className="p-8 pt-6 flex flex-col gap-5">
          {/* Outstanding display */}
          <div className="bg-destructive/5 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Outstanding Amount</span>
            <span className="text-2xl font-bold text-destructive">
              {"\u20B9"}{company.outstanding.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Select Bills */}
          {pendingPurchases.length > 0 && (
            <div className="flex flex-col gap-3">
              <Label className="text-foreground">Select Bills to Pay</Label>
              <div className="flex flex-col gap-2">
                {pendingPurchases.map((purchase) => (
                  <label
                    key={purchase.id}
                    className="flex items-center gap-3 bg-white/60 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedBills.includes(purchase.id)}
                      onCheckedChange={() => toggleBill(purchase.id)}
                    />
                    <span className="text-sm font-medium text-foreground flex-1">{purchase.id}</span>
                    <span className="text-sm font-medium text-foreground">
                      {"\u20B9"}{purchase.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground">{purchase.date}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Amount */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{"\u20B9"}</span>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                className="pl-7 bg-white/80 border-border text-lg font-medium"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger className="bg-white/80 border-border">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Date */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Payment Date</Label>
            <Input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="bg-white/80 border-border"
            />
          </div>

          {/* Reference */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Reference / Transaction ID</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TXN12345678"
              className="bg-white/80 border-border"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
              className="bg-white/80 border-border resize-none"
            />
          </div>

          {/* Remaining */}
          <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Remaining Outstanding</span>
            <span
              className={`text-lg font-bold ${
                remaining > 0 ? "text-destructive" : remaining === 0 ? "text-success" : "text-foreground"
              }`}
            >
              {"\u20B9"}{Math.max(0, remaining).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={handleSubmit}
            >
              <Check className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
