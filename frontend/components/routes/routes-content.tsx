"use client"

import { useState } from "react"
import { Truck, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Route = {
  id: string
  name: string
  area: string
  shops: number
  lastRun: string
  driver: string
  vehicle: string
  bills: {
    id: string
    shop: string
    amount: number
    items: { product: string; qty: number }[]
  }[]
  stockToLoad: { product: string; bottles: number; cases: number }[]
}

const routes: Route[] = [
  {
    id: "a",
    name: "Route A",
    area: "City Center",
    shops: 5,
    lastRun: "Yesterday",
    driver: "Ravi",
    vehicle: "TN-01-AB-1234",
    bills: [
      {
        id: "BILL-001",
        shop: "Sai Traders",
        amount: 960,
        items: [
          { product: "Thumbsup", qty: 48 },
          { product: "Sprite", qty: 24 },
        ],
      },
      {
        id: "BILL-002",
        shop: "Kumar Stores",
        amount: 480,
        items: [{ product: "Thumbsup", qty: 24 }],
      },
    ],
    stockToLoad: [
      { product: "Thumbsup RGB 300ml", bottles: 72, cases: 3 },
      { product: "Sprite PET 500ml", bottles: 24, cases: 1 },
    ],
  },
  {
    id: "b",
    name: "Route B",
    area: "Market Road",
    shops: 4,
    lastRun: "Yesterday",
    driver: "Kumar",
    vehicle: "TN-01-CD-5678",
    bills: [
      {
        id: "BILL-003",
        shop: "Ravi Shop",
        amount: 1200,
        items: [
          { product: "Fanta", qty: 36 },
          { product: "Coke", qty: 24 },
        ],
      },
    ],
    stockToLoad: [
      { product: "Fanta RGB 300ml", bottles: 36, cases: 1.5 },
      { product: "Coke CAN 330ml", bottles: 24, cases: 1 },
    ],
  },
  {
    id: "c",
    name: "Route C",
    area: "Highway Stop",
    shops: 3,
    lastRun: "2 days ago",
    driver: "Suresh",
    vehicle: "TN-02-EF-9012",
    bills: [],
    stockToLoad: [],
  },
  {
    id: "d",
    name: "Route D",
    area: "Station Area",
    shops: 6,
    lastRun: "Today",
    driver: "Ganesh",
    vehicle: "TN-01-GH-3456",
    bills: [],
    stockToLoad: [],
  },
]

export function RoutesContent() {
  const [activeRoute, setActiveRoute] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [cashReceived, setCashReceived] = useState("")
  const [routeExpenses, setRouteExpenses] = useState("")

  const selectedRoute = routes.find((r) => r.id === activeRoute)
  const totalAmount = selectedRoute?.bills.reduce((s, b) => s + b.amount, 0) ?? 0
  const diff = cashReceived ? totalAmount - parseFloat(cashReceived) - parseFloat(routeExpenses || "0") : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{route.name} - {route.area}</h3>
                  <p className="text-sm text-muted-foreground">{route.shops} shops | Last run: {route.lastRun}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Driver: <span className="text-foreground font-medium">{route.driver}</span> | {route.vehicle}
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setActiveRoute(route.id)
                setCompleting(false)
                setCashReceived("")
                setRouteExpenses("")
              }}
            >
              {"Today's Bill"}
            </Button>
          </div>
        ))}
      </div>

      {selectedRoute && (
        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Shop Bills on {selectedRoute.name}
            </h2>
            {selectedRoute.bills.length === 0 ? (
              <p className="text-muted-foreground">No bills for today on this route.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedRoute.bills.map((bill) => (
                  <div key={bill.id} className="bg-muted/50 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="h-4 w-4 text-success" />
                      <span className="font-medium text-foreground">{bill.id} - {bill.shop}</span>
                      <span className="ml-auto font-semibold text-foreground">{"\u20B9"}{bill.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="pl-6 flex flex-col gap-0.5">
                      {bill.items.map((item) => (
                        <p key={item.product} className="text-sm text-muted-foreground">
                          {item.product}: {item.qty} bottles
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-sm font-medium text-muted-foreground">
                  Total: {selectedRoute.bills.length} shops | {"\u20B9"}{totalAmount.toLocaleString("en-IN")}
                </div>
              </div>
            )}
          </div>

          {selectedRoute.stockToLoad.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock to Load
              </h3>
              <div className="flex flex-col gap-2">
                {selectedRoute.stockToLoad.map((s) => (
                  <div
                    key={s.product}
                    className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border text-sm"
                  >
                    <span className="text-foreground font-medium">{s.product}</span>
                    <span className="text-muted-foreground">{s.bottles} bottles ({s.cases} cases)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRoute.bills.length > 0 && !completing && (
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
              <div>
                <h3 className="font-semibold text-foreground mb-4">Cash Settlement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-sm">Expected</Label>
                    <div className="bg-muted/50 rounded-lg p-3 text-lg font-semibold text-foreground border border-border">
                      {"\u20B9"}{totalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-sm">Received</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{"\u20B9"}</span>
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
                    <Label className="text-muted-foreground text-sm">Difference</Label>
                    <div className={`bg-muted/50 rounded-lg p-3 text-lg font-semibold border border-border ${diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-foreground"}`}>
                      {"\u20B9"}{Math.abs(diff).toLocaleString("en-IN")}
                      {diff !== 0 && (diff > 0 ? " due" : " short")}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Empties Collected</h3>
                <Accordion type="single" collapsible className="flex flex-col gap-2">
                  {selectedRoute.bills.map((bill) => (
                    <AccordionItem
                      key={bill.id}
                      value={bill.id}
                      className="bg-muted/50 rounded-lg border border-border px-4"
                    >
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">
                        {bill.shop}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {bill.items.map((item) => (
                          <div
                            key={item.product}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2"
                          >
                            <span className="text-sm font-medium text-foreground min-w-[100px]">{item.product}:</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Label className="text-xs text-muted-foreground">Good</Label>
                                <Input type="number" defaultValue="0" className="w-16 h-8 text-sm bg-white/80 border-border" />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Label className="text-xs text-muted-foreground">Broken</Label>
                                <Input type="number" defaultValue="0" className="w-16 h-8 text-sm bg-white/80 border-border" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-foreground font-semibold">Route Expenses</Label>
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{"\u20B9"}</span>
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
                  Net: {"\u20B9"}{Math.abs(diff).toLocaleString("en-IN")}
                </div>
                <Button
                  size="lg"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => {
                    setCompleting(false)
                    setActiveRoute(null)
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
