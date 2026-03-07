"use client"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { ApiShop, ApiRoute } from "@/lib/types"

export function AddShopDialog({
    open,
    onOpenChange,
    onSaved,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved?: () => void
}) {
    const [shopName, setShopName] = useState("")
    const [phone, setPhone] = useState("")
    const [routeId, setRouteId] = useState<string>("none")
    const [routes, setRoutes] = useState<ApiRoute[]>([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            api.get<ApiRoute[]>("/routes").then((res) => setRoutes(res.data)).catch(console.error)
        }
    }, [open])

    const reset = () => {
        setShopName("")
        setPhone("")
        setRouteId("none")
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shopName.trim()) {
            setError("Shop name is required")
            return
        }

        try {
            setSaving(true)
            setError(null)

            const autoShopId = "SH-" + Date.now().toString(36).toUpperCase()
            const selectedRoute = routes.find(r => r.routeId === routeId)

            await api.post<ApiShop>("/shops", {
                shopId: autoShopId,
                shopName: shopName.trim(),
                phone: phone.trim() || undefined,
                routeId: selectedRoute ? selectedRoute.routeId : null,
                routeName: selectedRoute ? selectedRoute.routeName : null
            })

            onSaved?.()
            onOpenChange(false)
            reset()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save shop")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">Add Shop</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
                        </p>
                    )}

                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Shop Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g. Downtown Store"
                                className="bg-white/80 border-border"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 9876543210"
                                className="bg-white/80 border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Default Route <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Select value={routeId} onValueChange={setRouteId}>
                                <SelectTrigger className="bg-white/80 border-border">
                                    <SelectValue placeholder="Select a route" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Route (Walk-in)</SelectItem>
                                    {routes.map((route) => (
                                        <SelectItem key={route.routeId} value={route.routeId}>
                                            {route.routeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-border hover:bg-muted"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-24"
                        >
                            {saving ? "Saving…" : "Save Shop"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
