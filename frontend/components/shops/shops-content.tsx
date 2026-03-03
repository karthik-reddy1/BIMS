"use client"

import { useState, useEffect } from "react"
import { Building2, Search, MapPin, Phone, Trash2, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export function ShopsContent() {
    const [shops, setShops] = useState<ApiShop[]>([])
    const [search, setSearch] = useState("")
    const [shopToDelete, setShopToDelete] = useState<ApiShop | null>(null)

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
                    <Card key={shop.shopId} className="group relative bg-white/50 backdrop-blur-md border border-border shadow-sm hover:shadow-md transition-all duration-300">
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setShopToDelete(shop)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-4 pr-8">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground line-clamp-1">{shop.shopName}</h3>
                                    <p className="text-sm text-muted-foreground">{shop.shopId}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {(shop.phone || shop.address) && (
                                    <div className="space-y-2 pb-3 border-b border-border/50">
                                        {shop.phone && (
                                            <div className="flex items-center gap-2 text-sm text-foreground">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {shop.phone}
                                            </div>
                                        )}
                                        {shop.address && (
                                            <div className="flex items-center gap-2 text-sm text-foreground">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="line-clamp-1">{shop.address}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-muted-foreground">Outstanding</span>
                                    <span className={`text-lg font-bold ${shop.outstandingAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                                        ₹{shop.outstandingAmount?.toLocaleString("en-IN") || 0}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Package className="h-4 w-4" /> Empties Owed
                                    </span>
                                    {shop.returnableProducts && shop.returnableProducts.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {shop.returnableProducts.filter(r => r.emptiesOwed > 0).map(ret => (
                                                <Badge key={ret.productId} variant="secondary" className="bg-secondary/20">
                                                    {ret.productName}: {ret.emptiesOwed}
                                                </Badge>
                                            ))}
                                            {shop.returnableProducts.filter(r => r.emptiesOwed > 0).length === 0 && (
                                                <span className="text-xs text-muted-foreground italic">No empties owed</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">No empties owed</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredShops.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                        <Building2 className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                        <p className="text-muted-foreground">No shops found matching your search</p>
                    </div>
                )}
            </div>

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
