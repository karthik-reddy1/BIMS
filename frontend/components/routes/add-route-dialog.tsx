"use client"

import { useState } from "react"
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
import api from "@/lib/api"
import type { ApiRoute } from "@/lib/types"

export function AddRouteDialog({
    open,
    onOpenChange,
    onSaved,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved?: () => void
}) {
    const [routeName, setRouteName] = useState("")
    const [schedule, setSchedule] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const reset = () => {
        setRouteName("")
        setSchedule("")
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!routeName.trim()) {
            setError("Route name is required")
            return
        }

        try {
            setSaving(true)
            setError(null)

            const autoRouteId = "RT-" + Date.now().toString(36).toUpperCase()

            await api.post<ApiRoute>("/routes", {
                routeId: autoRouteId,
                routeName: routeName.trim(),
                schedule: schedule.trim() || undefined,
                shopIds: [], // Start empty
            })

            onSaved?.()
            onOpenChange(false)
            reset()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save route")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
            <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-white/95 rounded-2xl p-0 border border-border">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold text-foreground">Add Route</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
                        </p>
                    )}

                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Route Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={routeName}
                                onChange={(e) => setRouteName(e.target.value)}
                                placeholder="e.g. Downtown Loop"
                                className="bg-white/80 border-border"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Schedule <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                                placeholder="e.g. Mon, Wed, Fri"
                                className="bg-white/80 border-border"
                            />
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
                            {saving ? "Saving…" : "Save Route"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
