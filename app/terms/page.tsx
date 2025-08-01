import type { Metadata } from "next"
import LegalPage from "@/components/legal/LegalPage"
import { termsOfServiceContent } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Terms of Service | admin",
  description: "Terms and conditions for using admin's content platform",
}

export default function TermsPage() {
  return <LegalPage title="Terms of Service" content={termsOfServiceContent} />
}
