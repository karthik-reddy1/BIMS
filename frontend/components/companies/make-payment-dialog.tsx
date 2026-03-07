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
import type { Company } from "@/components/companies/companies-content"
import type { ApiPurchase } from "@/lib/types"
import api from "@/lib/api"

export function MakePaymentDialog({
  company,
  pendingPurchases,
  open,
  onOpenChange,
  onSaved,
}: {
  company: Company
  pendingPurchases: ApiPurchase[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedBills, setSelectedBills] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = company.outstanding - (Number(paymentAmount) || 0)

  const toggleBill = (purchaseId: string, amount: number) => {
    setSelectedBills((prev) => {
      const next = prev.includes(purchaseId)
        ? prev.filter((b) => b !== purchaseId)
        : [...prev, purchaseId]
      const total = pendingPurchases
        .filter((p) => next.includes(p.purchaseId))
        .reduce((sum, p) => sum + (p.grandTotal - (p.amountPaid || 0)), 0)
      setPaymentAmount(String(total))
      return next
    })
  }

  const reset = () => {
    setPaymentAmount("")
    setPaymentMode("")
    setReference("")
    setNotes("")
    setSelectedBills([])
    setError(null)
  }

  const handleSubmit = async () => {
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount")
      return
    }
    if (!paymentMode) {
      setError("Please select a payment mode")
      return
    }
    try {
      setSaving(true)
      setError(null)
      // Pay each selected purchase individually
      if (selectedBills.length > 0) {
        for (const purchaseId of selectedBills) {
          const purchase = pendingPurchases.find((p) => p.purchaseId === purchaseId)
          if (!purchase) continue
          await api.put(`/purchases/${purchaseId}/payment`, {
            amount: purchase.grandTotal - (purchase.amountPaid || 0),
            paymentMode,
            paymentDate: new Date().toISOString(),
          })
        }
      } else {
        // Bulk distribute payment across unpaid purchases
        await api.post(`/companies/${company.id}/payment`, {
          amount,
          paymentMode,
          paymentDate: new Date().toISOString(),
        })
      }
      onSaved?.()
      onOpenChange(false)
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Make Payment</DialogTitle>
        </DialogHeader>

        <div className="p-8 pt-6 flex flex-col gap-5">
          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Outstanding display */}
          <div className="bg-destructive/5 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Outstanding Amount</span>
            <span className="text-2xl font-bold text-destructive">
              ₹{company.outstanding.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Select Bills */}
          {pendingPurchases.length > 0 && (
            <div className="flex flex-col gap-3">
              <Label className="text-foreground">Select Purchases to Pay</Label>
              <div className="flex flex-col gap-2">
                {pendingPurchases.map((purchase) => (
                  <label
                    key={purchase.purchaseId}
                    className="flex items-center gap-3 bg-white/60 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedBills.includes(purchase.purchaseId)}
                      onCheckedChange={() => toggleBill(purchase.purchaseId, purchase.grandTotal)}
                    />
                    <span className="text-sm font-medium text-foreground flex-1">{purchase.purchaseId}</span>
                    <span className="text-sm font-medium text-foreground">
                      ₹{purchase.grandTotal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(purchase.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
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
            <span className={`text-lg font-bold ${remaining > 0 ? "text-destructive" : remaining === 0 ? "text-success" : "text-foreground"}`}>
              ₹{Math.max(0, remaining).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={() => { onOpenChange(false); reset() }}>Cancel</Button>
            <Button
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Check className="h-4 w-4 mr-2" />
              {saving ? "Recording…" : "Record Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
