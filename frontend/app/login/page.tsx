"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GlassWater, Lock, Mail, ArrowRight, Loader2, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                // Force hard reload to update Navigation state and middleware
                window.location.href = "/"
            } else {
                setError(data.message || "Invalid credentials")
                setLoading(false)
            }
        } catch {
            setError("An unexpected error occurred. Is the server running?")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-neutral-50 via-white to-stone-50">

            {/* Decorative Background Elements matching the app's clean vibe */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

            <Card className="w-full max-w-md border-border/60 shadow-xl backdrop-blur-sm bg-white/90 z-10 relative overflow-hidden">
                {/* Top Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                <CardHeader className="space-y-3 pb-6 text-center pt-10">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
                        <GlassWater className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to Beverage Inventory System
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">

                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-11 bg-white/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-11 bg-white/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base shadow-md group mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 border-t border-border/40 bg-muted/20 px-6 py-4 mt-2">
                    <div className="text-sm text-center text-muted-foreground/80">
                        Secure, persistent session via encrypted cookies.
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
