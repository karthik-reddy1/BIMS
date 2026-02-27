import { RoutesContent } from "@/components/routes/routes-content"

export default function RoutesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Route Management</h1>
      <RoutesContent />
    </div>
  )
}
