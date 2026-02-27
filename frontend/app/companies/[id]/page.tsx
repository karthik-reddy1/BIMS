import { companies } from "@/lib/company-data"
import { CompanyDetailsContent } from "@/components/companies/company-details-content"
import { notFound } from "next/navigation"

export default async function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = companies.find((c) => c.id === id)

  if (!company) {
    notFound()
  }

  return <CompanyDetailsContent company={company} />
}
