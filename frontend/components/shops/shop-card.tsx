import { Building2, MapPin, Phone, Trash2, Package, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ApiShop } from "@/lib/types"

interface ShopCardProps {
    shop: ApiShop
    onDelete: (shop: ApiShop) => void
    onClick: (shop: ApiShop) => void
}

export function ShopCard({ shop, onDelete, onClick }: ShopCardProps) {
    // Determine the empty owes, limiting to max 4 for the minimal card view
    const owedEmpties = shop.returnableProducts?.filter(r => r.emptiesOwed > 0) || []
    const displayEmpties = owedEmpties.slice(0, 4)
    const extraEmpties = owedEmpties.length > 4 ? owedEmpties.length - 4 : 0

    return (
        <Card
            className="group relative bg-white/50 backdrop-blur-md border border-border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => onClick(shop)}
        >
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(shop)
                }}
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

                <div className="space-y-3 mb-4">
                    <div className="space-y-2 pb-3 border-b border-border/50">
                        {shop.phone && (
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {shop.phone}
                            </div>
                        )}
                        {shop.routeName && (
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <Route className="h-4 w-4 text-muted-foreground" />
                                {shop.routeName}
                            </div>
                        )}
                        {shop.address && (
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="line-clamp-1">{shop.address}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-muted-foreground">Outstanding</span>
                        <span className={`text-lg font-bold ${shop.outstandingAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                            ₹{shop.outstandingAmount?.toLocaleString("en-IN") || 0}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" /> Empties Owed
                        </span>
                        {owedEmpties.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {displayEmpties.map(ret => (
                                    <Badge key={ret.productId} variant="secondary" className="bg-secondary/20 font-normal">
                                        {ret.productName}: <span className="font-bold ml-1">{ret.emptiesOwed}</span>
                                    </Badge>
                                ))}
                                {extraEmpties > 0 && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
                                        +{extraEmpties} more
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">No empties owed</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
