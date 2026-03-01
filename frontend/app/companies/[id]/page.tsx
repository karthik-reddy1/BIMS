import { CompanyDetailsContent } from "@/components/companies/company-details-content"

export default async function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CompanyDetailsContent companyId={id} />
}
