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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AddRouteDialog } from "./add-route-dialog"
import { BillDetailModal } from "@/components/billing/bill-detail-modal"
import api from "@/lib/api"
import type { ApiRoute, ApiShopBill, ApiShop, ApiProduct } from "@/lib/types"

// Track returnable empties per SHOP per product (not per bill — prevents double-counting)
type EmptiesState = Record<string, Record<string, { good: number; broken: number }>>

export function RoutesContent() {
  const [routes, setRoutes] = useState<ApiRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null)
  const [routeBills, setRouteBills] = useState<ApiShopBill[]>([])
  const [loadingBills, setLoadingBills] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [cashReceived, setCashReceived] = useState("")
  const [shopCash, setShopCash] = useState<Record<string, string>>({}) // keyed by shopId
  // Maps shopId → { shopName, totalDue, returnableProducts: {productId → qty} }
  const [shopSummary, setShopSummary] = useState<Record<string, { shopName: string; totalDue: number; products: Record<string, { name: string; totalQty: number }> }>>({})
  const [routeExpenses, setRouteExpenses] = useState("")
  const [empties, setEmpties] = useState<EmptiesState>({})
  const [submitting, setSubmitting] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [shopsMap, setShopsMap] = useState<Record<string, ApiShop>>({})
  const [productsMap, setProductsMap] = useState<Record<string, ApiProduct>>({})

  // Bill View State
  const [viewBill, setViewBill] = useState<ApiShopBill | null>(null)

  // Load Sheet State
  const [loadSheetRoute, setLoadSheetRoute] = useState<ApiRoute | null>(null)
  const [loadSheetOpen, setLoadSheetOpen] = useState(false)

  const fetchRoutes = useCallback(async () => {
    try {
      const [res, shopsRes, productsRes] = await Promise.all([
        api.get<ApiRoute[]>("/routes"),
        api.get<ApiShop[]>("/shops"),
        api.get<ApiProduct[]>("/products")
      ])
      setRoutes(res.data)
      const sMap: Record<string, ApiShop> = {}
      shopsRes.data.forEach(s => { sMap[s.shopId] = s })
      setShopsMap(sMap)

      const pMap: Record<string, ApiProduct> = {}
      productsRes.data.forEach(p => { pMap[p.productId] = p })
      setProductsMap(pMap)
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
      const route = routes.find((r) => r.routeId === routeId)
      const todays = route?.activeBills || []
      setRouteBills(todays)

      // Build per-SHOP state (not per-bill) to avoid double-counting
      const initEmpties: EmptiesState = {}
      const initShopCash: Record<string, string> = {}
      const initShopSummary: Record<string, { shopName: string; totalDue: number; products: Record<string, { name: string; totalQty: number }> }> = {}

      for (const bill of todays) {
        const shopId = bill.shopId
        if (!initShopCash[shopId]) initShopCash[shopId] = ""
        if (!initEmpties[shopId]) initEmpties[shopId] = {}
        if (!initShopSummary[shopId]) {
          initShopSummary[shopId] = {
            shopName: bill.shopName,
            totalDue: 0,
            products: {}
          }
        }
        // Accumulate outstanding for this shop across all its bills
        initShopSummary[shopId].totalDue += bill.grandTotal || 0

        // Merge returnable products across all bills for same shop
        for (const item of bill.items) {
          if (item.isReturnable) {
            if (!initEmpties[shopId][item.productId]) {
              initEmpties[shopId][item.productId] = { good: 0, broken: 0 }
            }
            // Track total qty sold per product per shop (across all bills)
            if (!initShopSummary[shopId].products[item.productId]) {
              initShopSummary[shopId].products[item.productId] = { name: item.productName, totalQty: 0 }
            }
            initShopSummary[shopId].products[item.productId].totalQty += item.quantity
          }
        }
      }

      setEmpties(initEmpties)
      setShopCash(initShopCash)
      setShopSummary(initShopSummary)
    } catch {
      setRouteBills([])
    } finally {
      setLoadingBills(false)
    }
  }

  const updateEmpties = (shopId: string, productId: string, field: "good" | "broken", value: number) => {
    setEmpties((prev) => ({
      ...prev,
      [shopId]: {
        ...prev[shopId],
        [productId]: { ...(prev[shopId]?.[productId] ?? { good: 0, broken: 0 }), [field]: value },
      },
    }))
  }

  const handleOpenLoadSheet = (route: ApiRoute) => {
    setLoadSheetRoute(route)
    setLoadSheetOpen(true)
  }

  const getLoadSheetItems = (route: ApiRoute | null) => {
    if (!route || !route.activeBills || route.activeBills.length === 0) return []

    // Aggregate all items across all active bills
    const itemMap = new Map<string, { name: string; quantity: number, bottlesPerCase: number }>()

    route.activeBills.forEach(bill => {
      bill.items.forEach(item => {
        const product = productsMap[item.productId]
        const bpc = product?.bottlesPerCase || 1 // default to 1 if not found to avoid div by zero

        const existing = itemMap.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          itemMap.set(item.productId, {
            name: [item.productName, item.size, item.packType].filter(Boolean).join(" "),
            quantity: item.quantity,
            bottlesPerCase: bpc
          })
        }
      })
    })

    return Array.from(itemMap.values()).map(item => {
      const cases = Math.floor(item.quantity / item.bottlesPerCase)
      const loose = item.quantity % item.bottlesPerCase
      return { ...item, cases, loose }
    }).sort((a, b) => a.name.localeCompare(b.name))
  }

  const loadSheetItems = getLoadSheetItems(loadSheetRoute)

  const activeRoute = routes.find((r) => r.routeId === activeRouteId)
  const totalAmount = routeBills.reduce((s, b) => s + (b.grandTotal ?? 0), 0)
  // Sum cash across shops (keyed by shopId now)
  const calculatedCashReceived = Object.values(shopCash).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const cash = calculatedCashReceived || 0
  const expenses = parseFloat(routeExpenses) || 0
  const diff = cash - expenses - totalAmount

  const handleComplete = async () => {
    try {
      setSubmitting(true)

      // 1. Group all today's shop bills under a new Route Bill
      const rbRes = await api.post("/route-bills", {
        routeId: activeRouteId,
        routeName: activeRoute?.routeName,
        routeDate: new Date().toISOString(),
        shopBillIds: routeBills.map(b => b.billId),
        stockLoaded: []
      })

      const routeBillId = rbRes.data.routeBillId

      // 2. Build ONE shopCollection entry per shop (not per bill)
      // This prevents double-deduction of outstanding when a shop has multiple bills
      const shopCollections = Object.entries(shopSummary).map(([shopId, summary]) => {
        const cashPaid = parseFloat(shopCash[shopId]) || 0
        const shopEmpties = empties[shopId] || {}
        const items = Object.entries(shopEmpties)
          .filter(([, vals]) => vals.good > 0 || vals.broken > 0)
          .map(([productId, vals]) => ({
            productId,
            goodBottles: vals.good,
            brokenBottles: vals.broken,
          }))

        return { shopId, cashCollected: cashPaid, items }
      }).filter(sc => sc.cashCollected > 0 || sc.items.length > 0)

      // 3. Complete the route bill
      await api.put(`/route-bills/${routeBillId}/complete`, {
        cashReceived: calculatedCashReceived,
        routeExpenses: parseFloat(routeExpenses) || 0,
        shopCollections
      })

      // 4. Refresh routes so processed bills are removed from active list
      await fetchRoutes()

    } catch (err) {
      console.error("Failed to complete route", err)
    } finally {
      setSubmitting(false)
      setCompleting(false)
      setActiveRouteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Routes Management</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Truck className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No routes found. Create a new route to get started.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Section 1: Active Routes (Has Bills Today) */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Routes with Bills Today</h2>
            {routes.filter((r) => r.activeBills && r.activeBills.length > 0).length === 0 ? (
              <p className="text-muted-foreground bg-white/50 p-4 rounded-xl border border-dashed border-border text-center">
                No active routes found. Assign shops to a route first.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.filter((r) => r.activeBills && r.activeBills.length > 0).map((route) => (
                  <div
                    key={route.routeId}
                    className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-primary/20 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{route.routeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {route.activeBills?.length ?? 0} bills today
                          </p>
                        </div>
                      </div>
                    </div>
                    {route.description && (
                      <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
                    )}
                    <div className="flex flex-col gap-2 mt-4">
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
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleOpenLoadSheet(route)}
                      >
                        View Load Sheet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Inactive Routes */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Other Routes</h2>
            {routes.filter((r) => !r.activeBills || r.activeBills.length === 0).length === 0 ? (
              <p className="text-muted-foreground">All routes have bills today.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.filter((r) => !r.activeBills || r.activeBills.length === 0).map((route) => (
                  <div
                    key={route.routeId}
                    className="backdrop-blur-md bg-muted/40 rounded-xl border border-border p-5 opacity-80"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted-foreground/10">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{route.routeName}</h3>
                          <p className="text-sm text-muted-foreground">0 bills today</p>
                        </div>
                      </div>
                    </div>
                    {route.description && (
                      <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground italic">
                      Generate bills for shops on this route to activate it.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                      <div className="ml-auto flex items-center gap-3">
                        <span className="font-semibold text-foreground">
                          ₹{bill.grandTotal?.toLocaleString("en-IN")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => setViewBill(bill)}
                        >
                          <svg xmlns="http://www.0w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                        </Button>
                      </div>
                    </div>
                    <div className="pl-6 flex flex-col gap-0.5">
                      {bill.items.map((item) => {
                        const product = productsMap[item.productId]
                        const bpc = product?.bottlesPerCase || 1
                        const cases = Math.floor(item.quantity / bpc)
                        const loose = item.quantity % bpc
                        const qtyText = cases > 0 && loose > 0 ? `${cases} cs, ${loose} btls` : cases > 0 ? `${cases} cs` : `${loose} btls`
                        return (
                          <p key={item.productId} className="text-sm text-muted-foreground">
                            {item.productName}: {qtyText}
                          </p>
                        )
                      })}
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
                    <Label className="text-muted-foreground text-sm">Received (Auto-sum)</Label>
                    <div className="bg-muted/50 rounded-lg p-3 text-lg font-semibold text-foreground border border-border">
                      ₹{calculatedCashReceived.toLocaleString("en-IN")}
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

              <div>
                <h3 className="font-semibold text-foreground mb-4">Shop Settlements (Cash & Empties)</h3>
                <Accordion type="single" collapsible className="flex flex-col gap-2">
                  {Object.entries(shopSummary).map(([shopId, summary]) => {
                    const shop = shopsMap[shopId]
                    const hasReturnables = Object.keys(summary.products).length > 0

                    return (
                      <AccordionItem
                        key={shopId}
                        value={shopId}
                        className="bg-muted/50 rounded-lg border border-border px-4"
                      >
                        <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">
                          <div className="flex justify-between items-center w-full pr-4">
                            <span>{summary.shopName}</span>
                            <span className="text-sm font-bold text-foreground">
                              Due: ₹{(shop?.outstandingAmount ?? summary.totalDue).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 flex flex-col gap-6">
                          {/* Cash Collected Input */}
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cash Collected</Label>
                            <div className="relative w-full sm:w-64">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                              <Input
                                type="number"
                                value={shopCash[shopId] ?? ""}
                                onChange={(e) => setShopCash(prev => ({ ...prev, [shopId]: e.target.value }))}
                                className="pl-7 bg-white/80 border-border"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Empties Returned — grouped per shop across ALL their bills */}
                          {hasReturnables && (
                            <div className="flex flex-col gap-3">
                              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empties Returned</Label>
                              {Object.entries(summary.products).map(([productId, prod]) => {
                                const e = empties[shopId]?.[productId] ?? { good: 0, broken: 0 }
                                return (
                                  <div key={productId} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2">
                                    <span className="text-sm font-medium text-foreground min-w-[120px]">{prod.name}:</span>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1.5">
                                        <Label className="text-xs text-muted-foreground">Good</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          max={prod.totalQty}
                                          value={e.good}
                                          onChange={(ev) => updateEmpties(shopId, productId, "good", parseInt(ev.target.value) || 0)}
                                          className="w-16 h-8 text-sm bg-white/80 border-border"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Label className="text-xs text-muted-foreground">Broken</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          max={prod.totalQty}
                                          value={e.broken}
                                          onChange={(ev) => updateEmpties(shopId, productId, "broken", parseInt(ev.target.value) || 0)}
                                          className="w-16 h-8 text-sm bg-white/80 border-border"
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground">of {prod.totalQty} sold</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
                {Object.values(shopSummary).every(s => Object.keys(s.products).length === 0) && (
                  <p className="text-sm text-muted-foreground mt-2">No returnable items on today's bills.</p>
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

      <AddRouteDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSaved={fetchRoutes}
      />

      {/* Load Sheet Modal */}
      <Dialog open={loadSheetOpen} onOpenChange={setLoadSheetOpen}>
        <DialogContent className="max-w-md w-[95vw] backdrop-blur-xl bg-white/95 rounded-2xl p-6 border border-border">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Load Sheet</DialogTitle>
                <div className="text-sm text-muted-foreground">{loadSheetRoute?.routeName}</div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {loadSheetItems.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-4">No items to load.</p>
            ) : (
              loadSheetItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/40 rounded-xl border border-border gap-2">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.cases > 0 && (
                      <Badge variant="secondary" className="px-3 py-1 bg-white shadow-sm border border-border text-sm whitespace-nowrap">
                        {item.cases} <span className="text-xs text-muted-foreground ml-1">cases</span>
                      </Badge>
                    )}
                    {item.loose > 0 && (
                      <Badge variant="outline" className="px-3 py-1 bg-white border-border text-sm whitespace-nowrap">
                        {item.loose} <span className="text-xs text-muted-foreground ml-1">cases</span>
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button onClick={() => setLoadSheetOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Detail Modal */}
      <BillDetailModal
        bill={viewBill}
        open={!!viewBill}
        onOpenChange={(o) => { if (!o) setViewBill(null) }}
        onBillUpdate={() => {
          fetchRoutes();
          if (activeRouteId) {
            loadRouteBills(activeRouteId);
          }
          setViewBill(null);
        }}
      />
    </div>
  )
}
