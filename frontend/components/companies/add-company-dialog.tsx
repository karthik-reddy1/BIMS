"use client"

import { useState } from "react"
import { Check, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import api from "@/lib/api"

export function AddCompanyDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [terms, setTerms] = useState("7")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName("")
    setContact("")
    setPhone("")
    setAddress("")
    setTerms("7")
    setError(null)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Company name is required")
      return
    }
    try {
      setSaving(true)
      setError(null)
      // Auto-generate companyId from name: "CSD Flavour" → "CSD-FLAVOUR"
      const companyId = name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20)

      await api.post("/companies", {
        companyId,
        companyName: name.trim(),
        contactPerson: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        paymentTerms: parseInt(terms) || 7,
      })

      onSaved?.()
      onOpenChange(false)
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save company")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-lg backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">Add Company</DialogTitle>
        </DialogHeader>

        <div className="p-8 pt-6 flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Company Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CSD Flavour (Coca-Cola)"
              className="bg-white/80 border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Contact Person</Label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="bg-white/80 border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="pl-10 bg-white/80 border-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Address</Label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              rows={3}
              className="bg-white/80 border-border resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Payment Terms</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                min={1}
                className="w-24 bg-white/80 border-border"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { onOpenChange(false); reset() }}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
              disabled={saving}
            >
              <Check className="h-4 w-4 mr-2" />
              {saving ? "Saving…" : "Save Company"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
