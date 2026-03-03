"use client"

import { useState, useEffect, useCallback } from "react"
import { Package, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import * as XLSX from "xlsx"

type ItemSale = {
    productName: string
    casesSold: number
    looseBottlesSold: number
    totalValue: number
}

type BusinessSummary = {
    totalSales: number
    totalExpenses: number
    profit: number
}

type ItemSalesData = {
    businessSummary: BusinessSummary
    itemSales: ItemSale[]
}

interface ItemSalesReportProps {
    days: string
}

export function ItemSalesReport({ days }: ItemSalesReportProps) {
    const [data, setData] = useState<ItemSalesData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const to = new Date()
            const from = new Date()
            from.setDate(to.getDate() - parseInt(days))
            const res = await api.get<ItemSalesData>(
                `/reports/item-sales?from=${from.toISOString()}&to=${to.toISOString()}`
            )
            setData(res.data)
            setError(null)

            // Expose the global export function so the header button can trigger it
            const exportExcel = () => {
                if (!res.data) return

                // Wait, since we are exporting, we build the sheet using xlsx
                const wb = XLSX.utils.book_new()

                // TABLE 1: Business Summary
                const summaryData = [
                    ["Business Summary", "", ""],
                    ["Total Sales (₹)", "Total Expenses (₹)", "Estimated Profit (₹)"],
                    [
                        res.data.businessSummary.totalSales,
                        res.data.businessSummary.totalExpenses,
                        res.data.businessSummary.profit
                    ],
                    ["", "", ""] // blank row spacer
                ]

                // TABLE 2: Item Sales
                const itemsData = [
                    ["Item-wise Sales Report", "", "", ""],
                    ["Product Name", "Cases Sold", "Loose Bottles Sold", "Total Value (₹)"]
                ]

                res.data.itemSales.forEach(item => {
                    itemsData.push([
                        item.productName,
                        item.casesSold as any,
                        item.looseBottlesSold as any,
                        item.totalValue as any
                    ])
                })

                // Combine both tables into one sheet
                const combinedData = [...summaryData, ...itemsData]

                const ws = XLSX.utils.aoa_to_sheet(combinedData)

                // Adjust column widths
                ws["!cols"] = [{ wch: 35 }, { wch: 15 }, { wch: 20 }, { wch: 15 }]

                XLSX.utils.book_append_sheet(wb, ws, "Sales Report")
                XLSX.writeFile(wb, `Sales_Report_${days}_Days.xlsx`)
            }

                // Bind to window for easy access from header
                ; (window as any).triggerExcelExport = exportExcel

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load item sales")
        } finally {
            setLoading(false)
        }
    }, [days])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Cleanup global on unmount
    useEffect(() => {
        return () => {
            delete (window as any).triggerExcelExport
        }
    }, [])

    const filteredItems = data?.itemSales.filter((i) =>
        i.productName.toLowerCase().includes(search.toLowerCase())
    )

    const fmt = (val: number) => `₹${val.toLocaleString("en-IN")}`

    if (loading) return <div className="text-center py-8 text-muted-foreground">Loading specific items...</div>
    if (error) return <div className="text-center py-8 text-destructive">{error}</div>

    return (
        <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Item-wise Sales
                    </h2>
                    <p className="text-sm text-muted-foreground">View detailed product performance</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3">Product Name</th>
                                <th className="px-4 py-3 text-right">Cases Sold</th>
                                <th className="px-4 py-3 text-right">Loose Sold</th>
                                <th className="px-4 py-3 text-right">Total Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredItems?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No items sold in this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems?.map((item, idx) => (
                                    <tr key={idx} className="bg-white/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">{item.productName}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{item.casesSold}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{item.looseBottlesSold}</td>
                                        <td className="px-4 py-3 text-right font-medium text-foreground">{fmt(item.totalValue)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
