import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const recentBills = [
  { id: "BILL-001", shop: "Sai Traders", amount: "\u20B9960", time: "10:30 AM" },
  { id: "BILL-002", shop: "Kumar Stores", amount: "\u20B9480", time: "11:15 AM" },
  { id: "BILL-003", shop: "Ravi Shop", amount: "\u20B91,200", time: "12:00 PM" },
  { id: "BILL-004", shop: "Lakshmi Mart", amount: "\u20B9720", time: "1:30 PM" },
  { id: "BILL-005", shop: "Ganesh Store", amount: "\u20B9360", time: "2:45 PM" },
]

export function RecentBills() {
  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-border">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Bills</h2>
        <Link
          href="/billing"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6">Bill ID</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="pr-6">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBills.map((bill) => (
            <TableRow key={bill.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="pl-6 font-medium text-foreground">{bill.id}</TableCell>
              <TableCell className="text-foreground">{bill.shop}</TableCell>
              <TableCell className="text-foreground font-medium">{bill.amount}</TableCell>
              <TableCell className="pr-6 text-muted-foreground">{bill.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
