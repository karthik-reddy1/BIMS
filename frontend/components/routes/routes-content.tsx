"use client"

import { useState, useEffect, useCallback } from "react"
import { Truck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import api from "@/lib/api"
import type { ApiRoute, ApiShopBill } from "@/lib/types"

// Track returnable empties per bill per product
type EmptiesState = Record<string, Record<string, { good: number; broken: number }>>

export function RoutesContent() {
  const [routes, setRoutes] = useState<ApiRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null)
  const [routeBills, setRouteBills] = useState<ApiShopBill[]>([])
  const [loadingBills, setLoadingBills] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [cashReceived, setCashReceived] = useState("")
  const [routeExpenses, setRouteExpenses] = useState("")
  const [empties, setEmpties] = useState<EmptiesState>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await api.get<ApiRoute[]>("/routes")
      setRoutes(res.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoutes() }, [fetchRoutes])

  const loadRouteBills = async (routeId: string) => {
    try {
      setLoadingBills(true)
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]
      const res = await api.get<ApiShopBill[]>(`/bills?routeId=${routeId}`)
      const todays = res.data.filter((b) => b.billDate.startsWith(todayStr))
      setRouteBills(todays)

      // Initialize empties state for returnable items
      const initEmpties: EmptiesState = {}
      for (const bill of todays) {
        initEmpties[bill.billId] = {}
        for (const item of bill.items) {
          if (item.isReturnable) {
            initEmpties[bill.billId][item.productId] = { good: 0, broken: 0 }
          }
        }
      }
      setEmpties(initEmpties)
    } catch {
      setRouteBills([])
    } finally {
      setLoadingBills(false)
    }
  }

  const updateEmpties = (billId: string, productId: string, field: "good" | "broken", value: number) => {
    setEmpties((prev) => ({
      ...prev,
      [billId]: {
        ...prev[billId],
        [productId]: { ...(prev[billId]?.[productId] ?? { good: 0, broken: 0 }), [field]: value },
      },
    }))
  }

  const activeRoute = routes.find((r) => r.routeId === activeRouteId)
  const totalAmount = routeBills.reduce((s, b) => s + (b.grandTotal ?? 0), 0)
  const cash = parseFloat(cashReceived) || 0
  const expenses = parseFloat(routeExpenses) || 0
  const diff = cash - expenses - totalAmount

  const handleComplete = async () => {
    try {
      setSubmitting(true)
      // For each bill that has returnable items with quantities entered, save empties return
      for (const bill of routeBills) {
        const billEmpties = empties[bill.billId]
        if (!billEmpties) continue

        const items = Object.entries(billEmpties)
          .filter(([, vals]) => vals.good > 0 || vals.broken > 0)
          .map(([productId, vals]) => ({
            productId,
            goodBottles: vals.good,
            brokenBottles: vals.broken,
          }))

        if (items.length === 0) continue

        await api.post("/empties-returns", {
          shopId: bill.shopId,
          routeId: activeRouteId,
          returnDate: new Date().toISOString(),
          items,
        })
      }
    } catch {
      // Non-blocking — complete the route UI even if empties save fails
    } finally {
      setSubmitting(false)
      setCompleting(false)
      setActiveRouteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No routes found. Add routes from the backend.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div
              key={route.routeId}
              className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{route.routeName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {route.shops?.length ?? 0} shops assigned
                    </p>
                  </div>
                </div>
              </div>
              {route.description && (
                <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
              )}
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setActiveRouteId(route.routeId)
                  setCompleting(false)
                  setCashReceived("")
                  setRouteExpenses("")
                  loadRouteBills(route.routeId)
                }}
              >
                {"Today's Bill"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {activeRoute && (
        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Shop Bills on {activeRoute.routeName}
            </h2>
            {loadingBills ? (
              <p className="text-muted-foreground">Loading bills…</p>
            ) : routeBills.length === 0 ? (
              <p className="text-muted-foreground">No bills for today on this route.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {routeBills.map((bill) => (
                  <div key={bill.billId} className="bg-muted/50 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="h-4 w-4 text-success" />
                      <span className="font-medium text-foreground">{bill.billId} - {bill.shopName}</span>
                      <span className="ml-auto font-semibold text-foreground">
                        ₹{bill.grandTotal?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="pl-6 flex flex-col gap-0.5">
                      {bill.items.map((item) => (
                        <p key={item.productId} className="text-sm text-muted-foreground">
                          {item.productName}: {item.quantity} bottles
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-sm font-medium text-muted-foreground">
                  Total: {routeBills.length} shops | ₹{totalAmount.toLocaleString("en-IN")}
                </div>
              </div>
            )}
          </div>

          {routeBills.length > 0 && !completing && (
            <Button
              size="lg"
              className="bg-success text-success-foreground hover:bg-success/90 w-full sm:w-auto"
              onClick={() => setCompleting(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Route Bill
            </Button>
          )}

          {completing && (
            <div className="flex flex-col gap-6 border-t border-border pt-6">
              {/* Cash Settlement */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Cash Settlement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-sm">Expected</Label>
                    <div className="bg-muted/50 rounded-lg p-3 text-lg font-semibold text-foreground border border-border">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-sm">Received</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="pl-7 bg-white/80 border-border"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-sm">
                      {diff >= 0 ? "Surplus" : "Deficit"}
                    </Label>
                    <div className={`bg-muted/50 rounded-lg p-3 text-lg font-semibold border border-border ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-foreground"}`}>
                      ₹{Math.abs(diff).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Empties Collected */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Empties Collected from Shops</h3>
                <Accordion type="single" collapsible className="flex flex-col gap-2">
                  {routeBills.map((bill) => {
                    const returnableItems = bill.items.filter((i) => i.isReturnable)
                    if (returnableItems.length === 0) return null
                    return (
                      <AccordionItem
                        key={bill.billId}
                        value={bill.billId}
                        className="bg-muted/50 rounded-lg border border-border px-4"
                      >
                        <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">
                          {bill.shopName}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          {returnableItems.map((item) => {
                            const e = empties[bill.billId]?.[item.productId] ?? { good: 0, broken: 0 }
                            return (
                              <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2">
                                <span className="text-sm font-medium text-foreground min-w-[120px]">{item.productName}:</span>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <Label className="text-xs text-muted-foreground">Good</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={item.quantity}
                                      value={e.good}
                                      onChange={(ev) => updateEmpties(bill.billId, item.productId, "good", parseInt(ev.target.value) || 0)}
                                      className="w-16 h-8 text-sm bg-white/80 border-border"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Label className="text-xs text-muted-foreground">Broken</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={item.quantity}
                                      value={e.broken}
                                      onChange={(ev) => updateEmpties(bill.billId, item.productId, "broken", parseInt(ev.target.value) || 0)}
                                      className="w-16 h-8 text-sm bg-white/80 border-border"
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">of {item.quantity} sold</span>
                                </div>
                              </div>
                            )
                          })}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
                {routeBills.every((b) => b.items.every((i) => !i.isReturnable)) && (
                  <p className="text-sm text-muted-foreground">No returnable items on today's bills.</p>
                )}
              </div>

              {/* Route Expenses */}
              <div className="flex flex-col gap-2">
                <Label className="text-foreground font-semibold">Route Expenses</Label>
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={routeExpenses}
                    onChange={(e) => setRouteExpenses(e.target.value)}
                    className="pl-7 bg-white/80 border-border"
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-2xl font-bold text-success">
                  Net: ₹{Math.max(0, cash - expenses).toLocaleString("en-IN")}
                </div>
                <Button
                  size="lg"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={handleComplete}
                  disabled={submitting}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {submitting ? "Saving…" : "Complete"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
