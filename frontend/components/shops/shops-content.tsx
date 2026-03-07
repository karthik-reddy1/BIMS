"use client"

import { useState, useEffect } from "react"
import { Building2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import api from "@/lib/api"
import type { ApiShop } from "@/lib/types"
import { ShopCard } from "./shop-card"
import { ShopDetailModal } from "./shop-detail-modal"

export function ShopsContent() {
    const [shops, setShops] = useState<ApiShop[]>([])
    const [search, setSearch] = useState("")
    const [shopToDelete, setShopToDelete] = useState<ApiShop | null>(null)
    const [selectedShop, setSelectedShop] = useState<ApiShop | null>(null)

    const fetchShops = () => {
        api.get<ApiShop[]>("/shops").then((res) => setShops(res.data)).catch(console.error)
    }

    useEffect(() => {
        fetchShops()
    }, [])

    const handleDelete = async () => {
        if (!shopToDelete) return
        try {
            await api.delete(`/shops/${shopToDelete.shopId}`)
            setShopToDelete(null)
            fetchShops()
        } catch (err) {
            console.error(err)
        }
    }

    const filteredShops = shops.filter(
        (s) =>
            s.shopName.toLowerCase().includes(search.toLowerCase()) ||
            s.routeId?.toLowerCase().includes(search.toLowerCase()) ||
            s.routeName?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Shops</h1>
                    <p className="text-muted-foreground mt-2">Manage your customers and track their balances</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shops..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/50 border-input"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                    <ShopCard
                        key={shop.shopId}
                        shop={shop}
                        onDelete={setShopToDelete}
                        onClick={setSelectedShop}
                    />
                ))}

                {filteredShops.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                        <Building2 className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                        <p className="text-muted-foreground">No shops found matching your search</p>
                    </div>
                )}
            </div>

            <ShopDetailModal
                shop={selectedShop}
                open={!!selectedShop}
                onOpenChange={(open) => !open && setSelectedShop(null)}
                onPaymentComplete={() => {
                    api.get<ApiShop[]>("/shops").then((res) => {
                        setShops(res.data)
                        if (selectedShop) {
                            const updatedShop = res.data.find(s => s.shopId === selectedShop.shopId)
                            if (updatedShop) setSelectedShop(updatedShop)
                        }
                    }).catch(console.error)
                }}
            />

            <AlertDialog open={!!shopToDelete} onOpenChange={(open) => !open && setShopToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the shop
                            <span className="font-semibold text-foreground"> {shopToDelete?.shopName} </span>
                            and remove their data from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Shop
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
